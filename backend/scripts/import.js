/* ========= README ========== */
/*
These scripts were last tested for Directus v9.15.1.
You will need nodejs > v17.5 for built-in fetch.
You will need to have Directus installed so npx can find the 'directus' command.

These script will use administrator privileges to export Directus configurations of the following types into a JSON file and allow you to re-import them into another Directus instance
- Collection schemas (Created by admin - exported with Directus CLI)
- Dashboards (Insights module)
- Panels (Used in dashboards)
- Flows
- Operations (Used in flows)
- Folders
- Webhooks
- Roles (Except for the admin role)
- Permissions (Except for admin permissions)
- Presets (& bookmarks - only global presets and role-specific presets, not for specific users)

These script can hopefully help you migrate your configurations between Directus environments (e.g. development -> production).
BUT the scripts will only create the exported data and/or update the data if any configuration entries with the same IDs exist in the target environment.
That means that in order for these scripts to work as intended, you should manage all of these configurations from your development environment and then import them into the target environment.
Creating configurations in the target environment directly should not cause errors, but will make your exported configs out of sync, which could potentially cause issues down the line ¯\_(ツ)_/¯

These scripts go through the regular Directus API endpoints and therefore require administrator privileges and a running Directus server.
This allows us to export / import the data in a format that will work across different databases (e.g. Sqlite3 (dev) -> MySQL (prod)).

When running this script, the following variables must be present in your environment:
  DIRECTUS_URL (default: "http://localhost:8055")
  CONFIG_FILE (default: "./directus-configs.json")
  SCHEMA_FILE (default: "./directus-schemas.yaml" - this uses the Directus cli)
  ADMIN_EMAIL
  ADMIN_PASSWORD

Environment variables can be omitted in favor of the default values.

I have found that importing schemas created with Directus CLI works best when the admin is not signed in.
*/

const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055'
const CONFIG_FILE = process.env.CONFIG_FILE || './directus-configs.json'
const SCHEMA_FILE = process.env.SCHEMA_FILE || './directus-schemas.yaml'
const ADMIN = {
  EMAIL: process.env.ADMIN_EMAIL,
  PASSWORD: process.env.ADMIN_PASSWORD
}

let envErrors = []
if (!ADMIN.EMAIL) envErrors.push('ADMIN_EMAIL')
if (!ADMIN.PASSWORD) envErrors.push('ADMIN_PASSWORD')
if (envErrors.length) {
  console.error('Missing environment variables: ' + envErrors.join(', '))
  process.exit(1)
}

const CONFIGS_TO_CREATE = [
  'dashboards', 
  'panels',
  'flows',
  'operations', 
  'folders',
  'webhooks',
  'roles',
  'permissions', 
  'presets' 
]


async function main() {
  //* USE DIRECTUS CLI TO IMPORT CREATED COLLECTION SCHEMAS
  try {
    const { stderr } = await exec(`npx directus schema apply -y ${SCHEMA_FILE}`)

    if (stderr) {
      console.error('Failed to use Directus CLI to import collection schemas')
      console.error(stderr)
      process.exit(1)
    }

  } catch (err) {
    console.error('Failed to use Directus CLI to import collection schemas')
    console.error(err)
    process.exit(1)
  }

  //* LOAD SAVED CONFIGS FROM FILE
  let configs
  try {
    const json = fs.readFileSync(CONFIG_FILE)
    configs = JSON.parse(json)
  } catch (err) {
    console.error('Could not load config file')
    console.error(err)
    process.exit(1)
  }
  
  //* LOGIN AS ADMIN
  let access_token
  try {
    ({ data: { access_token } } = await login())
  } catch (err) {
    console.error('Failed to login')
    console.error(err)
    process.exit(1)
  }
  if (!access_token) {
    console.error('Failed to get access token from admin login')
    process.exit(1)
  }

  //* CHECK FOR EXISTING ENTRIES FOR ALL CONFIGS IN THE DATABASE
  // Contains lists of all of the ids of the different config types in the actual database
  // If our imported config has the same ID as any of these, we need to update instead of create
  let configIds
  try {
    // Returns an array the resolved configs' ID for each config name in CONFIGS_TO_CREATE
    configIds = (await Promise.all(CONFIGS_TO_CREATE
      .map(confName => get(confName, access_token))))
      .map(res => res.data
      .map(conf => conf.id))

  } catch (err) {
    console.error('There was an issue getting the existing configs')
    console.error(err)
    process.exit(1)
  }

  // Zip together config names and the resolved config data's ID from Directus into entries array (e.g. [ 'dashboards', [...dashboardIds] ])
  const existingIdsEntries = CONFIGS_TO_CREATE.map((confName, i) => ([ confName, configIds[i] ]))
  // const existingIds = Object.fromEntries(CONFIGS_TO_CREATE.map((confName, i) => ([ confName, configIds[i] ])))
  
  //* FIND THE CONFIGS THAT WE HAVE AND ALREADY EXIST, THEY WILL NEED TO BE UPDATED
  // Contains the intersection of the IDs in the exported configs and the configs in the database in an object
  // i.e. the exported configs that need to be updated instead of created
  const updateThese = Object.fromEntries(existingIdsEntries.map(([ confName, existingIds ]) => ([ confName, intersection(getIds(configs[confName]), existingIds) ])))

  // This set will contain the configs that have already been created, so we can go directly to 'update' for all, for example, folders in batch 2, since they were all created in batch 1
  const alreadyCreated = new Set()

  //* BATCH THE CONFIGS SO DEPENDENCIES CAN BE CREATED FIRST
  const batches = [
    {
      dashboards: configs.dashboards, // Dashboards are created without any panels
      flows: configs.flows.map(f => omit(f, 'operation')), // Flows are created without any operations and without any initial operation
      roles: configs.roles, // Roles have no dependencies
      folders: configs.folders.map(f => omit(f, 'parent')), // Folders are created with no parents
      webhooks: configs.webhooks, // Webhooks have no dependencies
    },
    {
      folders: configs.folders, // Now that all folders exist, update them to point at their parents
      panels: configs.panels, // Now we add panels to dashboards
      operations: configs.operations.map(o => omit(o, 'resolve', 'reject')), // Operations can now be added to their parent flows, but not linked to each other yet
      permissions: configs.permissions, // Permissions can be created now that roles exist
      presets: configs.presets // Presets (sometimes) depend on roles, so now they can be created
    },
    {
      flows: configs.flows, // Now we can update flows with their initial operation
      operations: configs.operations // Now operations can be updated to reference each other
    }
  ]



  //* DO THE UPDATES / CREATES
  try {
    // Go through all types of configs we have (dashboards, panels etc) in batches
    for (const batch of batches) { // 'batch' is an obj of the configs
      const batchPromises = [] // we populate this with promises for each config request for all config types of the batch

      for (const configName in batch) { // 'configName' is the name of the config type
        const configArray = batch[configName] // 'configArray' are the actual configs for that type
        
        // We then go through all configs for the type and update / create them and save the array of promises we get out
        const promises = configArray.map(conf => {
          if (alreadyCreated.has(configName) || updateThese[configName].includes(conf.id)) {
            // If the config is in the previous object of arrays of configs to update
            // Or this kind of config has already been created in a previous batch, we need to update it
            return update(configName, conf, access_token)
          }

          // Otherwise, just create it as a new config
          return create(configName, conf, access_token)
        })

        // We then flatten the different types of config promises arrays into one big batch of promises that can be awaited
        // e.g. [dashboardPromise, dashboardPromise, flowPromise, flowPromise] and so on, where the next batch will have [panelPromise, operationPromise] and so on
        batchPromises.push(...promises)
      }
    
      await Promise.all(batchPromises)

      // We add the names of all the configs we created / updated in this batch so we can go directly to updating them in a later batch
      for (const configName of Object.keys(batch)) {
        alreadyCreated.add(configName)
      }
    }
  } catch (err) {
    console.error(err)
    console.error(err?.response?.data?.errors)
  }
}

main()

// Returns an array of the elements that are both in arr1 and arr2
// only works for primitives (like number IDs)
function intersection(arr1, arr2) {
  return arr1.filter(x => arr2.includes(x))
}

async function update(confName, conf, access_token) {
  // We need configs ID for the request, but we don't want it in the body of the request
  const id = conf.id
  delete conf.id

  const res = await fetch(`${DIRECTUS_URL}/${confName}/${id}?access_token=${access_token}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(conf)
  })

  return res.json()
}

async function create(confName, conf, access_token) {
  const res = await fetch(`${DIRECTUS_URL}/${confName}?access_token=${access_token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(conf)
  })

  return res.json()
}

function omit(obj, ...keys) {
  const clone = Object.assign({}, obj)
  for (const key of keys) {
    delete clone[key]
  }
  return clone
}

async function login() {
  const res = await fetch(DIRECTUS_URL + '/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: ADMIN.EMAIL,
      password: ADMIN.PASSWORD
    })
  })

  return res.json()
}

async function get(configName, access_token) {
  const res = await fetch(`${DIRECTUS_URL}/${configName}?access_token=${access_token}`)
  
  return res.json()
}

function getIds(configArr) {
  return configArr.map(c => c.id)
}
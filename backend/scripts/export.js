/* ========= README ========== */
/*
These scripts were last tested for Directus v9.15.1.
You will need nodejs > v17.5 for built-in fetch.
You will need to have Directus installed so npx can find the 'directus' command.

These script will use administrator privileges to export Directus configurations of the following types into a JSON file and allow you to re-import them into another Directus instance
- Collection schemas (Created by admin - exported with Directus CLI)
- Project settings (asset presets, project name, number of login attempts, admin panel styling etc)
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

const CONFIGS_TO_GET = [
  'settings',
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
  //* USE DIRECTUS CLI TO EXPORT CREATED COLLECTION SCHEMAS
  try {
    const { stderr } = await exec(`npx directus schema snapshot -y ${SCHEMA_FILE}`)

    if (stderr) {
      console.error('Failed to use Directus CLI to export collection schemas')
      console.error(stderr)
      process.exit(1)
    }

  } catch (err) {
    console.error('Failed to use Directus CLI to export collection schemas')
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
  
  //* GET DATA FOR REQUIRED TABLES (not the schemas exported by Directus cli)
  let configRes
  try {
    // Returns an array the resolved configs for each config name in CONFIGS_TO_GET
    configRes = (await Promise.all(CONFIGS_TO_GET
      .map(conf => get(conf, access_token))))
      .map(res => res.data)

  } catch (err) {
    console.error('There was an issue getting the configs')
    console.error(err)
    process.exit(1)
  }

  // Zip together config names and the resolved config data from Directus into entries array (e.g. [ 'dashboards', [...dashboardObj] ])
  // and then create an object from this (e.g. { 'dashboards: [{ xyz: abc }] })
  const configData = Object.fromEntries(CONFIGS_TO_GET.map((confName, i) => ([ confName, configRes[i] ])))
  
  // We need the admin ID to remove all permissions pertaining to the admin
  const adminId = configData.roles.find(role => role.name === 'Administrator').id

  //* TRANSFORM DATA
  const output = {
    settings: removeId(configData.settings),
    dashboards: configData.dashboards.map(removeCreatedMetaData).map(d => {
      delete d.panels // Panels are added to dashboards, not other way around
      return d
    }),
    panels: configData.panels.map(removeCreatedMetaData),
    flows: configData.flows.map(removeCreatedMetaData).map(f => {
      delete f.operations // Operations are added to flows, not other way around
      return f
    }),
    operations: configData.operations.map(removeCreatedMetaData),
    folders: configData.folders,
    webhooks: configData.webhooks,

    // We don't save the admin user, since all Directus instances already has one
    // We don't want to edit the users of a role, if it already exists
    roles: configData.roles.filter(role => role.name !== 'Administrator').map(removeRoleUsers),

    // Remove all permissions pertaining to the admin since the admin already exists and has all permissions
    permissions: configData.permissions.filter(permission => permission.role !== adminId),

    // Remove all presets that have been set for specific users (development users are only for testing)
    // this leaves only global presets or role-specific presets
    presets: configData.presets.filter(preset => preset.user === null)
  }
  
  //* SAVE OUTPUT TO JSON FILE
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(output))
  } catch (err) {
    console.error('There was an issue saving the configs to a file')
    console.error(err)
    process.exit(1)
  }
}

main()

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

function removeCreatedMetaData(entry) {
  // It's alright to mutate the object here, we don't use original for anything else
  delete entry.date_created
  delete entry.user_created

  return entry
}

// Removes the users of a role, since we either want to create a new role if it does not exist (doesn't need users)
// or we want to update the role if it does exist, in which case we don't want to overwrite existing users of that role
function removeRoleUsers(role) {
  delete role.users

  return role
}

// Returns the same object without an ID-prop
function removeId(obj) {
  delete obj.id
  return obj
}
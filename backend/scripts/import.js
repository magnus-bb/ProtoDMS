/* 
linkede entries er følgende (pilens retning angiver hvem der har et link til hvem):
* dashboards <-> panels (dashboards først)
* flows <-> operations (garanteret flows først)
* folders -> folders (parent folder) (skal måske oprettes i et træ-format, så parent altid findes når child oprettes)
* permissions -> roles
* presets -> roles
*/

// TODO: Flows skal ikke oprettes med operations lige umiddelbart. Der skal bygges et træ af operations der tilhører flows. Følgende er idéen om hvordan det skal gøres:
/*
Først skal man finde den første operation i et Flow (jeg går ud fra, at den der står under 'operation' er først node i flowet, og 'operations' er et ligegyldigt array, som bare kan være tomt ved oprettelse)
Når man har første 'operation' skal man linke den til de to næste, der står under 'resolve' og 'reject', og så fortsætte med de operations, der er linket til.
Måske er der flere forgreninger end bare resolve og reject (hvis man bruger conditionals - test det). Når dette træ er færdigt kan man tage rod-operationen og oprette den med link til flowet.
Dernæst kan man oprette resten af nodes i rækkefølge af forgreningerne (skal dette gøres baglæns i stedet? Det handler om at de operationer man refererer til bare skal findes på forhånd).
Når man er færdig, så skal man opdatere flowet med 'operation' sat til rod-operationen.
*/
// TODO: Folders skal oprettes i en træ-struktur (lidt simplere end operations).
/*
Der skal bygges træer af folders, som er fuldstændigt ligesom almindelige mapper.
Der kan være flere rodfolders, da alle folders har en parent, undtagen første lag (parent: null er dem lige under File Library).
Når de importeres skal de så gøres i den rækkefølge hvor man starter med de folders med parent: null, og så bare ét lag ad gangen,
så parent altid findes inden et child oprettes.
*/


const axios = require('axios').default
require('dotenv').config() // MUST RUN SCRIPT FROM WHERE .env IS LOCATED
const fs = require('fs')
// const config = require('../directus-config.js')(process.env) // use this for environment vars?



const DIRECTUS_URL = 'http://localhost:8055' // Set the remote URL here
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




let access_token = ''
let configs




async function main() {
  //* LOAD SAVED CONFIGS FROM FILE
  try {
    const json = fs.readFileSync('./exported-configs/directus-configs.json')

    configs = JSON.parse(json)
  } catch (err) {
    console.error('Could not load config file. ' + err)
    process.exit(1)
  }



  //* LOGIN AS ADMIN
  const loginRes = await axios.post(DIRECTUS_URL + '/auth/login', {
    email: ADMIN.EMAIL,
    password: ADMIN.PASSWORD
  })

  access_token = loginRes.data.data.access_token



  //* CHECK FOR EXISTING ENTRIES FOR ALL CONFIGS IN THE DATABASE
  // Contains lists of all of the ids of the different config types in the actual database
  // If our imported config has the same ID as any of these, we need to update instead of create
  const [
    { data: { data: dashboards } }, 
    { data: { data: panels } }, 
    { data: { data: flows } }, 
    { data: { data: operations } }, 
    { data: { data: folders } }, 
    { data: { data: webhooks } }, 
    { data: { data: roles } }, 
    { data: { data: permissions } }, 
    { data: { data: presets } }, 
  ] = await Promise.all([
    axios.get(DIRECTUS_URL + '/dashboards?access_token=' + access_token),
    axios.get(DIRECTUS_URL + '/panels?access_token=' + access_token),
    axios.get(DIRECTUS_URL + '/flows?access_token=' + access_token),
    axios.get(DIRECTUS_URL + '/operations?access_token=' + access_token),
    axios.get(DIRECTUS_URL + '/folders?access_token=' + access_token),
    axios.get(DIRECTUS_URL + '/webhooks?access_token=' + access_token),
    axios.get(DIRECTUS_URL + '/roles?access_token=' + access_token),
    axios.get(DIRECTUS_URL + '/permissions?access_token=' + access_token),
    axios.get(DIRECTUS_URL + '/presets?access_token=' + access_token),
  ])

  const existingIds = {
    dashboards: dashboards.map(d => d.id),
    panels: panels.map(p => p.id),
    flows: flows.map(f => f.id),
    operations: operations.map(o => o.id),
    folders: folders.map(f => f.id),
    webhooks: webhooks.map(w => w.id),
    roles: roles.map(r => r.id),
    permissions: permissions.map(p => p.id),
    presets: presets.map(p => p.id)
  }



  //* FIND THE CONFIGS THAT WE HAVE AND ALREADY EXIST, THEY WILL NEED TO BE UPDATED
  // Contains the intersection of the IDs in the exported configs and the configs in the database
  // i.e. the exported configs that need to be updated instead of created
  const updateThese = {
    dashboards: intersection(configs.dashboards.map(d => d.id), existingIds.dashboards),
    panels: intersection(configs.panels.map(p => p.id), existingIds.panels),
    flows: intersection(configs.flows.map(f => f.id), existingIds.flows),
    operations: intersection(configs.operations.map(o => o.id), existingIds.operations),
    folders: intersection(configs.folders.map(f => f.id), existingIds.folders),
    webhooks: intersection(configs.webhooks.map(w => w.id), existingIds.webhooks),
    roles: intersection(configs.roles.map(r => r.id), existingIds.roles),
    permissions: intersection(configs.permissions.map(p => p.id), existingIds.permissions),
    presets: intersection(configs.presets.map(p => p.id), existingIds.presets) 
  }


  //* BATCH THE CONFIGS SO DEPENDENCIES CAN BE CREATED FIRST
  const batches = [
    {
      dashboards: configs.dashboards,
      flows: configs.flows,
      roles: configs.roles,
      folders: configs.folders,
      webhooks: configs.webhooks,
    },
    {
      panels: configs.panels, // panels depend on dashboards to be created already
      operations: configs.operations, // operations depend on flows to be created already
      permissions: configs.permissions, // permissions depend on roles to be created already
      presets: configs.presets // presets (sometimes) depend on roles to be created already
    }
  ]


  //* DO THE UPDATES / CREATES
  try {
    // Go through all types of configs we have (dashboards, panels etc) in batches
    for (const batch of batches) { // 'batch' is an obj of the configs
      const batchPromises = [] // we populate this with promises for each config request for all config types of the batch

      for (const configName in batch) { // 'configName' is the name of the config type
        const configArray = batch[configName] // 'configArray' is the actual configs for that type
        
        // We then go through all configs for the type and update / create them and save the array of promises we get out
        const promises = configArray.map(conf => {
          if (updateThese[configName].includes(conf.id)) {
            // If the config is in the previous object of arrays of configs to update, we need to update it
            return update(configName, conf)
          }

          // Otherwise, just create it as a new config
          return create(configName, conf)
        })

        // We then flatten the different types of config promises arrays into one big batch of promises that can be awaited
        // e.g. [dashboardPromise, dashboardPromise, flowPromise, flowPromise] and so on, where the next batch will have [panelPromise, operationPromise] and so on
        batchPromises.push(...promises)
      }
    
      await Promise.all(batchPromises)
    }
  } catch (err) {
    console.error(err)
    console.error(err.response.data.errors)
  }
}

main()

// Returns an array of the elements that are both in arr1 and arr2
// only works for primitives (like number IDs)
function intersection(arr1, arr2) {
  return arr1.filter(x => arr2.includes(x))
}

function update(confName, conf) {
  // We need configs ID for the request, but we don't want it in the body of the request
  const id = conf.id
  delete conf.id

  return axios.patch(`${DIRECTUS_URL}/${confName}/${id}?access_token=${access_token}`, conf)
}

function create(confName, conf) {
  return axios.post(`${DIRECTUS_URL}/${confName}?access_token=${access_token}`, conf)
}
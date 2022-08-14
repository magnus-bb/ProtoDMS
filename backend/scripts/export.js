const axios = require('axios').default
require('dotenv').config() // MUST RUN SCRIPT FROM WHERE .env IS LOCATED
const fs = require('fs')

//TODO: let admin credentials be passed or env, pass in directus url but default to dev val, pass in output location but with default.

const ADMIN = {
  EMAIL: process.env.ADMIN_EMAIL,
  PASSWORD: process.env.ADMIN_PASSWORD
}

const DIRECTUS_URL = 'http://localhost:8055'

let envErrors = []
if (!ADMIN.EMAIL) envErrors.push('ADMIN_EMAIL')
if (!ADMIN.PASSWORD) envErrors.push('ADMIN_PASSWORD')

if (envErrors.length) {
  console.error('Missing environment variables: ' + envErrors.join(', '))
  process.exit(1)
}

let access_token = ''

async function main() {
  //* LOGIN AS ADMIN
  const loginRes = await axios.post(DIRECTUS_URL + '/auth/login', {
    email: ADMIN.EMAIL,
    password: ADMIN.PASSWORD
  })
  access_token = loginRes.data.data.access_token
  
  //* GET DATA FOR REQUIRED TABLES (not the schemas exported by Directus cli)
  // good to go = fjern alt det, der ikke skal bruges i import upload, men behold IDs, så man i import kan tjekke om noget allerede findes
  const [
    { data: { data: dashboards } }, // good to go
    { data: { data: panels } }, // good to go
    { data: { data: flows } }, // good to go
    { data: { data: operations } }, // good to go
    { data: { data: folders } }, // good to go
    { data: { data: webhooks } }, // good to go
    { data: { data: roles } }, // fjern administrator-rolle og fjern users-array på alle roller
    { data: { data: permissions } }, // fjern alle permissions med admin-ID
    { data: { data: presets } }, // Filtrér så vi kun har presets hvor user er null, det er så vi kun beholder globale eller rolle-specifikke presets
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

  // We need the admin ID to remove all permissions pertaining to the admin
  const adminId = roles.find(role => role.name === 'Administrator').id

  //* TRANSFORM DATA
  const output = {
    dashboards: dashboards.map(removeCreatedMetaData),
    panels: panels.map(removeCreatedMetaData),
    flows: flows.map(removeCreatedMetaData),
    operations: operations.map(removeCreatedMetaData),
    folders,
    webhooks,

    // We don't save the admin user, since all Directus instances already has one
    // We don't want to edit the users of a role, if it already exists
    roles: roles.filter(role => role.name !== 'Administrator').map(removeRoleUsers),

    // Remove all permissions pertaining to the admin since the admin already exists and has all permissions
    permissions: permissions.filter(permission => permission.role !== adminId),

    // Remove all presets that have been set for specific users (development users are only for testing)
    // this leaves only global presets or role-specific presets
    presets: presets.filter(preset => preset.user === null)
  }

  //* SAVE OUTPUT TO JSON FILE
  fs.writeFileSync('./exported-configs/directus-configs.json', JSON.stringify(output))
}

main()

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
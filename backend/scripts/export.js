//! REWRITE WHOLE FILE AS A DIRECTUS CUSTOM FLOW
// This allows for using internal sdk etc and is faster
// Just need to figure out if there is a good way to call it from cli (setting as a webhook trigger?)
const axios = require('axios').default
require('dotenv').config()

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

async function main() {
  //* LOGIN AS ADMIN
  const loginRes = await axios.post('http://localhost:8055/auth/login', {
    email: ADMIN.EMAIL,
    password: ADMIN.PASSWORD
  })
  access_token = loginRes.data.data.access_token
  
  //* GET DATA FOR REQUIRED TABLES (not the schemas exported by Directus cli)
  const [
    { data: { data: dashboards } }, 
    { data: { data: flows } }, 
    { data: { data: folders } }, 
    { data: { data: operations } }, 
    { data: { data: panels } }, 
    { data: { data: permissions } }, //* Special transformation: match 'role' ids to existing roles
    { data: { data: presets } }, //* Special transformation: filter so we only keep presets where 'user' is null. This is because we only want global or role-specific presets, but not overwrite users. If role-specific presets are too cumbersome (since we need the ids) just use global
    { data: { data: webhooks } },
    { data: { data: roles } },
  ] = await Promise.all([
    axios.get('http://localhost:8055/dashboards?access_token=' + access_token),
    axios.get('http://localhost:8055/flows?access_token=' + access_token),
    axios.get('http://localhost:8055/folders?access_token=' + access_token),
    axios.get('http://localhost:8055/operations?access_token=' + access_token),
    axios.get('http://localhost:8055/panels?access_token=' + access_token),
    axios.get('http://localhost:8055/permissions?access_token=' + access_token),
    axios.get('http://localhost:8055/presets?access_token=' + access_token),
    axios.get('http://localhost:8055/webhooks?access_token=' + access_token),
    axios.get('http://localhost:8055/roles?access_token=' + access_token),
  ])
  //* TRANSFORM THESE AND SAVE TO FILE (remove IDs etc, see how they should be formatted when creating)

  //* NOTES FOR IMPORT SCRIPT
  //* Make sure we don't overwrite existing resources (e.g. the admin roles / user(s)), that might mean that some things will need to be fetched so we can inject the data in the transformation step and not recreate existing roles etc that already have users on them (same goes for other data)
  //* Match IDs for everything existing / newly created. This might not be possible??
  //* Check if a specific order is required for the resources (e.g. do flows need to be created before operations? Roles before permissions? Panels before dashboards), then bundle requests into steps

}

main()
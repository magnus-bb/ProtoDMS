# Should I Use? Directus backend

## First time setup
I recommend setting the following environment variables for development:
`.env`
```
CONFIG_PATH=directus-config.js
```

And these should be used for the initial schema import see [Migrate environments](#migrate-environments). Set them in the terminal with `export` or `set` (Windows)
```
DB_CLIENT=sqlite3
DB_FILENAME=./data.db
ADMIN_EMAIL=admin@user.email
ADMIN_PASSWORD=adminuserpassword
```

If needed, recreate the database file in production with:
```sh
npx directus bootstrap
```

Follow this by running the server with:
```sh
npm start
```

When the server is running, you can **import** configurations as described in the [Migrate environments section](#migrate-environments).

## Plugins
### [generate-types](https://github.com/maltejur/directus-extension-generate-types "GitHub"))
This plugin is simply an `index.js` file located in `extensions/modules/generate-types/`.

This allows for manual downloading of type declaration files for collections created in Directus.

#### How to update
Go to [the modules' GitHub page](https://github.com/maltejur/directus-extension-generate-types "GitHub") and download the latest release and overwrite the existing `index.js` file. You might need to activate the plugin under 'Project Settings' -> 'Modules' in the admin panel.

## Migrate environments
This section describes how to move schemas and configurations from the development environment to production / staging (et cetera) or any similar remote server.
This method should **only** be used one-way. That means, that you should create all of the following configurations in development, use this method to export them, and them import them into the remote environment (not the other way around). This method will **only** create non-existing configurations (not update or delete any), which means that you might end up with duplicate configurations, if any of the configurations that can be exported with this method are done in the remote environment as well as the development environment. This also means that if you create any new configurations in the remote environment it will be out of sync with the development configuration.

The method can export / import the following configurations:
* Collection schemas (Created by admin - exported with Directus CLI)
* Dashboards (Insights module)
* Panels (Used in dashboards)
* Flows
* Operations (Used in flows)
* Folders
* Webhooks
* Roles (Except for the admin role)
* Permissions (Except for admin permissions)
* Presets (& bookmarks - only global presets and role-specific presets, not for specific users)

The reason for exporting these elements in particular is that they lay the foundation for how to use the app, but do not interfere with the remote environments' saved collections and users. Things such as dashboards and webhooks are not data-specific and as such can safely be transferred from for example development to production.

### Usage
There are in depth descriptions of their use in the files `scripts/export.js` and `scripts/import.js`.

Both the import and export script can be run with nodejs, but you will need to have the following environment variables set:
```
DIRECTUS_URL (default: "http://localhost:8055")
CONFIG_FILE (default: "./directus-configs.json")
SCHEMA_FILE (default: "./directus-schemas.yaml" - this uses the Directus cli)
ADMIN_EMAIL
ADMIN_PASSWORD
```
Environment variables can be omitted in favor of the default values.

You can use a remote `DIRECTUS_URL` for both importing and exporting.

### Examples
```bash
# Export from DIRECTUS_URL environment
ADMIN_EMAIL=admin@admin.com ADMIN_PASSWORD=password node scripts/export.js

# Import to target DIRECTUS_URL environment
ADMIN_EMAIL=admin@admin.com ADMIN_PASSWORD=password node scripts/import.js

# Alternatively you can run the scripts from package.json
export ADMIN_EMAIL=admin@admin.com ADMIN_PASSWORD=password
npm run export-config
npm run import-config
```

Be aware that setting environment variables in Windows is done with `set`.

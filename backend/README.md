# Should I Use? Directus backend

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
* Dashboards & panels (the Insights module)
* Flows & operations (Flows and the actions they can do)
* Folder structure (File library structure, but not files)
* Webhooks
* Roles & permissions (but not the users themselves)
* Presets & bookmarks (only global / role presets, not user-specific ones)

The reason for exporting these elements in particular is that they lay the foundation for how to use the app, but do not interfere with the remote environments' saved collections and users. Things such as dashboards and webhooks are not data-specific and as such can safely be transferred from development to production.
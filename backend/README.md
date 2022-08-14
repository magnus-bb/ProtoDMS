# Should I Use? Directus backend

## Plugins
### [generate-types](https://github.com/maltejur/directus-extension-generate-types "GitHub"))
This plugin is simply an `index.js` file located in `extensions/modules/generate-types/`.

This allows for manual downloading of type declaration files for collections created in Directus.

#### How to update
Go to [the modules' GitHub page](https://github.com/maltejur/directus-extension-generate-types "GitHub") and download the latest release and overwrite the existing `index.js` file. You might need to activate the plugin under 'Project Settings' -> 'Modules' in the admin panel.

## Migrate environments
This section describes how to move schemas and configurations from one environment to another (e.g. from local development to production on remote server).

TODO
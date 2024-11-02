## Installation
Clone the repo into the same parent directory as repos using these packages.

Run `npm run build` from this directory to install dependencies and create new package builds.

Packages can then be added into other projects by adding the following to `package.json`'s dependencies:
```
"@fflags/client": "file:../feature-flags/fflags-client",
"@fflags/mongo-loader": "file:../feature-flags/fflags-mongo-loader",
"@fflags/rest-loader": "file:../feature-flags/fflags-rest-loader",
"@fflags/types": "file:../feature-flags/fflags-types",
```

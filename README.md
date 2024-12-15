## Installation
Clone the repo into the same parent directory as repos using these packages.

Run `npm run build` from this directory to install dependencies and create new package builds.

Packages can then be added into other projects by adding the following to `package.json`'s dependencies:
```
"@avocet/sdk": "file:../packages/avocet-sdk",
"@avocet/core": "file:../packages/avocet-core",
```

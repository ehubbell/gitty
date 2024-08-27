## Overview
A simple CLI that will fetch, store, and clone Github repositories and subdirectories.


## Prerequisites
- Node v20.13.1 (for proper unzip)
- Ora v5.4.1 (for module require)


## Quick Start
- `npm install -g @playbooks-xyz/transfer`
- `transfer <repo_url>`
- `transfer <repo_url> --path ~/playgrounds/repo-name`
- `transfer <repo_url> --path ~/playgrounds/repo-name --clone <account_login>`

## Description
The commands above will install the SDK to your local machine and make the `transfer` command available globally.
You can then download any Github repository or subdirectory (based on your credentials) per the quick start instructions.


## How it works
The `transfer` commands downloads a copy of the main repository's tarball, unzips it, formats it, and stores the formatted version in your cwd.
Alternatively, you can pass in a `--path` parameter indicating where you want to install the repository relative to the current directory.
As part of the formatting, we automatically remove the `.git` directory and the tarball file so you'll start with a clean working repository.


## Config
Playbooks-transfer will look for a config file at the root of your file system and read the following variables:

```
~/.transferrc

GITHUB_USER=****
GITHUB_EMAIL=****
GITHUB_TOKEN=****

```

## Development
- `npm start`
- `cd .. && node playbooks-transfer <repo_url> --path ~/playgrounds/repo-name`


## Deploy
- npm build
- npm version [major | minor | patch]
- npm publish
- git push --tags


## Testing
- npm run build
- npm pack
- npm install ./npm-package-name.tgz
- playbooks-transfer repo_url --destination ~/user/file/path


## Author
- Playbooks XYZ
- support@playbooks.xyz


## Inspiration
- degit
- gittar


## Contributions
- Please open an issue describing the PR you want to submit before starting work.
## Overview
A simple CLI that will fetch, store, and clone Github repositories and subdirectories.


## Prerequisites
- Node v20.13.1 (for proper unzip)
- Ora v5.4.1 (for module require)


## Quick Start
- `npm i -g @playbooks-xyz/playbooks-transfer`
- `playbooks-transfer <repo_url>`
- `playbooks-transfer <repo_url> --directory ~/repos`

## Description
The commands above will install `playbooks-transfer` to your local machine and make the `playbooks-transfer` command globally available.
You can then download any public Github repository or subdirectory per the quick start instructions.


## How it works
Gitto downloads a copy of the main repository's tarball to your local machine, unzips the file, formats it, and then store the formatted version in your current working directory. Alternatively, you can pass in a `--directory` parameter indicating where you want to install the repository. As part of the formatting, we automatically remove the `.git` directory and the initial download so you'll start with a clean working repository.


## Why we built this
We ran into issues using Degit on some nested directories and felt like their CLI wasn't expansive enough for a couple of use-cases we had in mind.


## Config
Playbooks-transfer will read the following variables from your config file and use them as your defaults. You can override the location of your config file by passing `-c path/to/config` in any command.
- GITHUB_TOKEN
- DIRECTORY


## Development
- npm start
- node playbooks-transfer repo_url -d ~/user/file/path
- ...or...
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
## Overview
A simple CLI that will fetch, store, and clone Github repositories and subdirectories.


## Prerequisites
- Node v20.13.1 (for proper unzip)
- Ora v5.4.1 (for module require)


## Quick Start
- `npm install -g @playbooks-xyz/transfer`
- `transfer <repo_url>`
- `transfer <repo_url> --directory ~/playgrounds/repo-name`
- `transfer <repo_url> --directory ~/playgrounds/repo-name --clone ehubbell`

## Description
The commands above will install the SDK to your local machine and make the `transfer` command globally available.
You can then download any Github repository or subdirectory (you have access to) per the quick start instructions.


## How it works
The `transfer` commands downloads a copy of the main repository's tarball, unzips the file, formats it, and then stores the formatted version in your current working directory. Alternatively, you can pass in a `--directory` parameter indicating where you want to install the repository relative to the current directory.
As part of the formatting, we automatically remove the `.git` directory and the tarball file so you'll start with a clean working repository.


## Why we built this
We ran into issues using Degit on some nested directories and felt like their CLI wasn't expansive enough for a couple of use-cases we had in mind.


## Config
Playbooks-transfer will read the following variables from your config file:

```
~/.transferrc

GITHUB_USER=****
GITHUB_EMAIL=****
GITHUB_TOKEN=****

```

## Development
- run npm start in terminal tab
- then cd to the previous directory from a new terminal
- `node playbooks-transfer repo_url -d ~/user/file/path`


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
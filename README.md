## Overview
A simple CLI that will fetch, store, and clone Github repos.


## Prerequisites
- Github
- Node


## Quick Start
- `npm install -g @ehubbell/gitty`
- `gitty config`
- `gitty download <repo_url>`
- `gitty download <repo_url> --path ~/templates/repo-name`
- `gitty clone <repo_url> --account <account_login> --name <repo_name>`

## Description
The commands above will install the SDK to your local machine and make the `gitty` command available globally.
You can then download any Github repository or subdirectory (based on your credentials) per the quick start instructions.


## How it works
The `gitty` commands downloads a copy of the main repository's tarball, unzips it, formats it, and stores the formatted version in your cwd.
Alternatively, you can pass in a `--path` parameter indicating where you want to install the repository relative to the current directory.
As part of the formatting, we automatically remove the `.git` directory and the tarball file so you'll start with a clean working repository.


## Config
Gitty will look for a config file at the root of your file system and read the following variables:

```
~/.gittyrc

GITHUB_TOKEN=****

```

## Development
- `npm start`
- `cd .. && node gitty download <repo_url> --path ~/templates/repo-name`


## Deploy
- npm build
- npm version [major | minor | patch]
- npm publish
- npm run git


## Testing
- npm run build
- npm pack
- npm install ./npm-package-name.tgz -g
- gitty download <repo_url> --path ~/templates/repo-name


## Author
- Eric Hubbell
- eric@erichubbell.com


## Inspiration
- degit
- gittar


## Contributions
- Please open an issue describing the PR you want to submit before starting work.
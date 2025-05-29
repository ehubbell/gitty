## Overview
A simple CLI that will fetch, store, and clone Github repos.


## Prerequisites
- Github
- Node


## Quick Start
- `npm install -g @ehubbell/gitty`
- `gitty download <repo_url>`


## Description
The commands above will install the SDK to your local machine and make the `gitty` command available globally.
You can then download any Github repository or subdirectory. For private repos, please make sure to add your `github_token` to the config file.


## How it works
The `gitty` commands downloads a copy of the main repository's tarball from Github, unzips it, formats it, and stores the formatted version in your cwd.
Alternatively, you can pass in a `--path` parameter indicating where you want to install the repository relative to the current directory.
As part of the formatting, we automatically remove the `.git` directory and the tarball file so you have a clean working repository.


## Config File
Gitty will look for a `.gittyrc` config file at the root of your file system and read the following variables:

```
# ~/.gittyrc

GITHUB_TOKEN=****
```

## Commands
- `gitty config`
- `gitty download <repo_url>`
- `gitty download <repo_url> --path ~/templates/repo-name`
- `gitty clone <repo_url> --account <account_login> --name <repo_name>`


## Development
- `git clone`
- `npm install`
- `npm start`


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


## Inspiration
- degit
- gittar


## Contributions
Feel free to open an issue to discuss changes or submit a PR for bug fixes.
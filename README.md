## Overview
A simple CLI that will fetch, store, and clone Github repos.


## Prerequisites
- Github
- Node


## Quick Start
- `npm install -g @ehubbell/gitty`
- `gitty download <repo_url>`


## Description
The Gitty CLI gives developers an easy way to download Github repositories and subdirectories directly to their local machine.
It also lets developers clone Github repositories and subdirectories to their Github account and organizations where they're a member.
Depending on the functionality you need, Gitty accepts a variety of options to customize your experience.


## Config File
Gitty will look for a `.gittyrc` config file at the root of your file system containing your platform secrets.
To expedite your work, you can use the `gitty config` to create and / or read that file.
You can also pass the `--config` parameter to any command to specify a different path.
For now, Gitty will interpret the following variables:

```
# ~/.gittyrc

GITHUB_TOKEN=****
```

## Commands
- `gitty config`
- `gitty config --config ~/.gittyenv`
- `gitty download <repo_url>`
- `gitty download <repo_url> --path ~/templates/repo-name`
- `gitty download <repo_url> --unzip --clean --remove`
- `gitty clone <repo_url> --account <account_login> --name <repo_name>`

## Notes
- When unzipping


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
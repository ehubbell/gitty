## Overview
The Gitty CLI offers a lightweight and easy way to download a Github repository or subdirectory directly to your local machine.
As an alternative, you can also clone a Github repository or subdirectory to your own account and / or an organization where you're a member.
Bitbucket and GitLab integrations coming soon.

## Prerequisites

- Github
- Node

## Quick Start

```
npm install @ehubbell/gitty -g
gitty download <repo_url>
```

## Config File

Gitty will look for a `.gittyrc` config file at the root of your file system containing your environment secrets.
To expedite your work, you can use the `gitty config` command to create and / or read that file.
You can also pass the `--config` parameter to any command to specify a different path.
For now, Gitty will interpret the following variables:

```
# ~/.gittyrc

GITHUB_TOKEN=****
```

## Commands

- `gitty config`
- `gitty config --config ~/.gitty`
- `gitty download <repo_url>`
- `gitty download <repo_url> --path ~/username/sites --name test-repo`
- `gitty clone <repo_url> --account <account_login> --name <repo_name>`

## Development

- `git clone`
- `npm install`
- `npm start`

## Scripts

We've included a couple of helpful scripts for faster development.

- commit: `npm run commit -- 'commit message'`
- deploy: `npm run deploy -- 'commit message' [major|minor|patch]`

## Testing

- npm run build
- npm pack
- npm install ./npm-package-name.tgz -g
- gitty download <repo_url> --path ~/templates/repo-name

## Inspiration

- degit
- gittar

## Notes

Feel free to open an issue to discuss changes or submit a PR for bug fixes.

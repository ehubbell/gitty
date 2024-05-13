## Overview
A simple git tarball CLI for Github repositories and subdirectories.


## Quick Start
- `npm i gitto -g`
- `gitto <github_repo_url>`
- `gitto <github_repo_url> --directory ~/repos`


## Description
The commands above will install `gitto` to your local machine and make the `gitto` command globally available.
You can then download any public Github repository or subdirectory per the quick start instructions.


## How it works
Gitto downloads a copy of the main repository's tarball to your local machine, unzips the file, formats it, and then store the formatted version on your local directory in whichever directory you pass via the `--destination` parameter. As part of this, we automatically remove the `.git` directory so you start with a fresh slate.


## Why we built this
We ran into issues using Degit on some nested directories and felt like their CLI wasn't expansive enough for a couple of use-cases we have in mind.


## Author
- Eric Hubbell
- eric@erichubbell.com


## Inspiration
- degit
- gittar


## Contributions
- Please open an Issue describing the PR you want to submit so we can engage briefly before starting work.
## Overview
A simple Git Download CLI for Github repositories and subdirectories.

## Quick Start
- `npm i -g gitdl`
- `gitdl fetch <github_repo_url>`


## Why we built this
We ran into issues using Degit on some nested directories and felt like their CLI wasn't expansive enough for the direction we'd like to go.


## Description
The commands above will install `gitdl` to your machine and make the `gitdl` command globally available.
You can then download any public Github repository or subdirectory by simply copy / pasting the Github URL per the quickstart.


## How it works
When you run the command, we download a copy of the repo's tarball to your local machine and then unzip that file appropriately to the desired location on your machine while taking into account the nested URL path (if one exist). As part of the workflow, we remove the `.git` directory so you're then working with a clean slate.


## Options
- version
- fetch


## Author
- Eric Hubbell
- eric@erichubbell.com


## Inspiration
- degit


## Contributions
- Please open an Issue describing the PR you want to submit so we can engage briefly before starting work.
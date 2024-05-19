#!/usr/bin/env node

const sade = require('sade');
import { fetchCommand } from 'src/commands/fetch';
import { version } from '../package.json';

const cli = sade('gitdl <url>', true)
	.version(version)
	.command('fetch <url>')
	.describe('Fetch a Github repository or subdirectory and clone it to your Github.')
	.option('-c, --clone', 'Perform clone after download is complete.')
	.option('-d, --destination', 'Path to destination directory.')
	.option('-t, --token', 'Add your token')
	.option('-v, --version', 'Specify tarball version (optional).')
	.example('gitdl vercel/vercel')
	.example('gitdl vercel/vercel/examples/angular')
	.example('gitdl vercel/vercel/examples/angular --directory ~/storage')
	.example('gitdl vercel/vercel/examples/angular --directory ~/storage --clone playbooks-community')
	.action(fetchCommand);

cli.parse(process.argv);

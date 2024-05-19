#!/usr/bin/env node

const sade = require('sade');
import { fetchCommand } from 'src/commands/fetch';
import { version } from '../package.json';

const cli = sade('transfer <url>', true)
	.version(version)
	.describe('Fetch a Github repository or subdirectory and transfer it to your Github.')
	.option('-c, --clone', 'Perform clone after download is complete.')
	.option('-d, --destination', 'Path to destination directory.')
	.option('-t, --token', 'Specify your github token.')
	.option('-v, --version', 'Specify tarball version (optional).')
	.example('transfer vercel/vercel')
	.example('transfer vercel/vercel/examples/angular')
	.example('transfer vercel/vercel/examples/angular --directory ~/storage')
	.example('transfer vercel/vercel/examples/angular --directory ~/storage --clone playbooks-community')
	.action(fetchCommand);

cli.parse(process.argv);

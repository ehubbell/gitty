#!/usr/bin/env node

const os = require('os');
const sade = require('sade');
import { fetchCommand } from 'src/commands/fetch';
import { version } from '../package.json';

const cli = sade('playbooks-transfer <url>', true)
	.version(version)
	.describe('Fetch, store, and clone  Github repositories.')
	.option('-c, --clone', 'Clone to Github user / org after download is complete.')
	.option('-p, --path', 'Path to destination directory.')
	.option('-e, --env', 'Path to environment file', `${os.homedir()}/.transferrc`)
	.option('-v, --version', 'Specify tarball version (optional).')
	.example('transfer https://github.com/vercel/vercel')
	.example('transfer https://github.com/vercel/vercel -d vercel')
	.example('transfer https://github.com/vercel/vercel/tree/main/examples/angular -d angular -c ehubbell')
	.example('transfer https://github.com/vercel/vercel/tree/main/examples/angular -e ~/.pbrc -d angular -c ehubbell')
	.action(fetchCommand);

cli.parse(process.argv);

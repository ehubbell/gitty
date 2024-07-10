#!/usr/bin/env node

const os = require('os');
const sade = require('sade');
import { fetchCommand } from 'src/commands/fetch';
import { version } from '../package.json';

const cli = sade('playbooks-transfer <url>', true)
	.version(version)
	.describe('Fetch, store, and clone  Github repositories.')
	.option('-c, --clone', 'Clone to Github user / org after download is complete.')
	.option('-d, --destination', 'Path to destination directory.')
	.option('-e, --env', 'Path to environment file', `${os.homedir()}/.playbooksrc`)
	.option('-v, --version', 'Specify tarball version (optional).')
	.example('playbooks-transfer vercel/vercel')
	.example('playbooks-transfer https://github.com/vercel/vercel')
	.example('playbooks-transfer vercel/vercel/examples/angular')
	.example('playbooks-transfer https://github.com/vercel/vercel/tree/main/examples/angular')
	.example('playbooks-transfer vercel/vercel/examples/angular --env ~/.pbconfig --destination ./repo-name')
	.example('playbooks-transfer vercel/vercel/examples/angular --clone org-name')
	.action(fetchCommand);

cli.parse(process.argv);

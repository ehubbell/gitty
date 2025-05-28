#!/usr/bin/env node

const os = require('os');
const sade = require('sade');
import { version } from '../package.json';
import { cloneCommand, configCommand, downloadCommand } from 'src/commands';

const cli = sade('gitty');

cli
	.version(version)
	.describe('A simple CLI to fetch, store and clone Github repositories.')
	.option('--config', 'Path to your config file.', `${os.homedir()}/.gittyrc`);

cli.command('config').describe('Display your config file.').example('gitty config').action(configCommand);

cli
	.command('clone <url>')
	.describe('Clone a Github repo or subdirectory to your account.')
	.option('--account', 'Specify the account where we should add this clone.')
	.option('--name', 'Specify the name for cloned repository.')
	.option('--path', 'Specify path to a local directory (defaults to CWD).')
	.option('--version', 'Specify tarball version (optional).')
	.example('gitty clone https://github.com/vercel/vercel')
	.example('gitty clone https://github.com/vercel/vercel --account ehubbell')
	.example('gitty clone https://github.com/vercel/vercel --account ehubbell --name vercel-copy')
	.action(cloneCommand);

cli
	.command('download <url>')
	.describe('Download a Github repo or subdirectory to your local file system.')
	.option('--path', 'Specify path to a local directory (defaults to CWD).')
	.option('--version', 'Specify tarball version (optional).')
	.example('gitty download https://github.com/vercel/vercel')
	.example('gitty download https://github.com/vercel/vercel/tree/main/examples/angular --path ~/templates/angular')
	.action(downloadCommand);

cli.parse(process.argv);

const ora = require('ora');
import { GitService } from 'src/services/git-service';
import { GithubService } from 'src/services/github-service';
import { StorageService } from 'src/services/storage-service';
import { timeout } from 'src/utils/helpers';

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export const fetchCommand = async (url: string, options: any) => {
	const setupSpin = ora('Setting up...').start();
	await timeout(300);

	// Globals
	const token = options.t || options.token || TOKEN;
	// console.log("globals: ", { token });

	// Options
	const clone = options.c || options.clone || null;
	const destination = options.d || options.destination || null;
	const version = options.v || options.version || null;
	// console.log("options: ", { clone, destination, version });

	// Path
	const paths = url.split('https://github.com/')[1];
	const ownerId = paths.split('/')[0];
	const repoId = paths.split('/')[1];
	const nestedPath = paths.split('/').slice(4, paths.length).join('/');
	const basePath = destination || process.cwd();

	const destinations = destination.split('/');
	const formattedName = destinations[destinations.length - 1] || paths.split('/')[paths.length - 1];
	// console.log("url: ", { ownerId, repoId, nestedPath });

	setupSpin.succeed('Setup complete!');

	// Github Step
	const githubSpinner = ora('Fetching repo...').start();
	await timeout(300);
	const github = new GithubService({ token });
	const zipResponse = version
		? await github.getRepoVersionZip(ownerId, repoId, version)
		: await github.getRepoZip(ownerId, repoId);
	if (zipResponse.status !== 200) {
		githubSpinner.fail('Fetch failed!');
		return console.error('\ngithub: ', zipResponse);
	}
	githubSpinner.succeed('Fetch complete!');

	// Storage Step
	const storageSpinner = ora('Storing repo...').start();
	await timeout(300);
	const storage = new StorageService({
		basePath,
		ownerId,
		repoId: formattedName,
		nestedPath,
	});
	const valid = await storage.checkEmpty();
	if (!valid) return storageSpinner.fail('Please clear the destination directory!');
	await storage.saveRepo(zipResponse.data);
	await storage.unzipRepo();
	await storage.cleanRepo();
	storageSpinner.succeed('Storage complete!');

	// Clone Step
	if (clone) {
		const cloneSpinner = ora('Checking github...').start();
		await timeout(300);
		const repoResponse = await github.getRepo(clone, formattedName);
		if (repoResponse.status !== 404) {
			cloneSpinner.fail('Repo already exists!');
			return console.error('\ngithub: ', repoResponse);
		}

		cloneSpinner.text = 'Creating repo...';
		const orgResponse = await github.createOrgRepo(clone, {
			name: formattedName,
			private: false,
		});
		if (orgResponse.status !== 201) {
			cloneSpinner.fail('Create failed!');
			return console.error('\ngithub: ', orgResponse);
		}

		cloneSpinner.text = 'Cloning repo...';
		const git = new GitService({ basePath, token });
		await git.create(clone, formattedName);
		cloneSpinner.succeed('Clone complete!');
	}

	// Cleanup
	await storage.removeZip();
	console.log('You are all done.');
};

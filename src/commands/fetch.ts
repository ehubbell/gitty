const ora = require('ora');
import { GitService } from 'src/services/git-service';
import { GithubService } from 'src/services/github-service';
import { StorageService } from 'src/services/storage-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

const env = import.meta.env.VITE_NODE_ENV;
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export const fetchCommand = async (url: string, options: any) => {
	try {
		const setupSpinner = ora('Setting up...\n').start();
		await timeout(300);

		// Globals
		const token = options.t || options.token || TOKEN;
		Logger.log('globals: ', { env, token });

		// Options
		const clone = options.c || options.clone || null;
		const destination = options.d || options.destination || null;
		const version = options.v || options.version || null;
		Logger.log('options: ', { clone, destination, version });

		// Github
		const githubPath = url.split('https://github.com/')[1];
		const githubFragments = githubPath.split('/');
		const ownerId = githubFragments[0];
		const repoId = githubFragments[1];
		const nestedPath = githubFragments.slice(4, githubPath.length).join('/');
		Logger.log('url: ', { ownerId, repoId, nestedPath });

		// Destination
		const basePath = destination || process.cwd();
		const destinationFragments = destination?.split('/');
		const formattedName = destination
			? destinationFragments[destinationFragments.length - 1]
			: githubFragments[githubFragments.length - 1];

		Logger.log('destination: ', { basePath, formattedName });

		setupSpinner.succeed('Setup complete!');

		// Github Step
		const githubSpinner = ora('Fetching repo...\n').start();
		await timeout(300);
		const github = new GithubService({ token });
		const zipResponse = version
			? await github.getRepoVersionZip(ownerId, repoId, version)
			: await github.getRepoZip(ownerId, repoId);
		if (zipResponse.status !== 200) {
			githubSpinner.fail('Fetch failed!');
			return Logger.error('\ngithub: ', zipResponse);
		}
		githubSpinner.succeed('Fetch complete!');

		// Storage Step
		const storageSpinner = ora('Storing repo...\n').start();
		await timeout(300);
		const storage = new StorageService({ basePath, formattedName, nestedPath });
		const valid = await storage.checkEmpty();
		if (!valid) return storageSpinner.fail('Please clear the destination directory!');
		await storage.saveRepo(zipResponse.data);
		await storage.unzipRepo();
		await storage.cleanRepo();
		storageSpinner.succeed('Storage complete!');

		// Clone Step
		if (clone) {
			const cloneSpinner = ora('Checking github...\n').start();
			await timeout(300);
			const repoResponse = await github.getRepo(clone, formattedName);
			if (repoResponse.status !== 404) {
				cloneSpinner.fail('Repo already exists!');
				return Logger.error('\ngithub: ', repoResponse);
			}

			cloneSpinner.text = 'Creating repo...';
			const orgResponse = await github.createOrgRepo(clone, {
				name: formattedName,
				private: false,
			});
			if (orgResponse.status !== 201) {
				cloneSpinner.fail('Create failed!');
				return Logger.error('\ngithub: ', orgResponse);
			}

			cloneSpinner.text = 'Cloning repo...';
			const git = new GitService({ basePath, token });
			await git.create(clone, formattedName);
			cloneSpinner.succeed('Clone complete!');
		}

		// Cleanup
		await storage.removeZip();
		Logger.log('You are all done.');
	} catch (e) {
		Logger.log(e);
		Logger.error('Transfer failed:', e);
		process.exit();
	}
};

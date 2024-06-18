const ora = require('ora');
import { ConfigService } from 'src/services/config-service';
import { GitService } from 'src/services/git-service';
import { GithubService } from 'src/services/github-service';
import { StorageService } from 'src/services/storage-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const fetchCommand = async (url: string, options: any) => {
	try {
		// Options
		const clone = options.c || options.clone || null;
		const destination = options.d || options.destination || null;
		const environment = options.e || options.env || '~/.pbconfig';
		const version = options.v || options.version || null;
		Logger.log('options: ', { clone, destination, environment, version });

		// Config
		const configService = new ConfigService({ basePath: environment });
		const configSpinner = ora('Setting up...\n').start();
		await timeout(300);

		const configValid = await configService.checkEmpty();
		if (!configValid) return configSpinner.fail('Please provide a valid config file.');
		const config = await configService.readContents();
		Logger.log('config: ', config);

		// Github
		const githubPath = url.includes('github.com') ? url.split('https://github.com/')[1] : url;
		const githubFragments = githubPath.split('/');
		const ownerId = githubFragments[0];
		const repoId = githubFragments[1];
		const nestedPath = githubFragments.includes('tree')
			? githubFragments.slice(4, githubPath.length).join('/')
			: githubFragments.slice(3, githubPath.length).join('/');
		Logger.log('url: ', { ownerId, repoId, nestedPath });

		// Destination
		const basePath = destination || process.cwd();
		const destinationFragments = destination?.split('/');
		const formattedName = destination
			? destinationFragments[destinationFragments.length - 1]
			: githubFragments[githubFragments.length - 1];
		Logger.log('destination: ', { basePath, formattedName });

		configSpinner.succeed('\nSetup complete!');

		// Github Step
		const githubService = new GithubService({ token: config.GITHUB_TOKEN });
		const githubSpinner = ora('Fetching repo...\n').start();
		await timeout(300);

		const zipResponse = version
			? await githubService.getRepoVersionZip(ownerId, repoId, version)
			: await githubService.getRepoZip(ownerId, repoId);
		if (zipResponse.status !== 200) {
			githubSpinner.fail('Fetch failed!');
			return Logger.error('\ngithub: ', zipResponse);
		}
		githubSpinner.succeed('Fetch complete!');

		// Storage Step
		const storageService = new StorageService({ basePath, formattedName, nestedPath });
		const storageSpinner = ora('Storing repo...\n').start();
		await timeout(300);

		const storageValid = await storageService.checkEmpty();
		if (!storageValid) return storageSpinner.fail('Please clear the destination directory!');
		await storageService.saveRepo(zipResponse.data);
		await storageService.unzipRepo();
		await storageService.cleanRepo();
		storageSpinner.succeed('Storage complete!');

		// Clone Step
		if (clone) {
			const cloneSpinner = ora('Checking github...\n').start();
			await timeout(300);
			const repoResponse = await githubService.getRepo(clone, formattedName);
			if (repoResponse.status !== 404) {
				cloneSpinner.fail('Repo already exists!');
				return Logger.error('\ngithub: ', repoResponse);
			}

			cloneSpinner.text = 'Creating repo...';
			const orgResponse = await githubService.createOrgRepo(clone, {
				name: formattedName,
				private: false,
			});
			if (orgResponse.status !== 201) {
				cloneSpinner.fail('Create failed!');
				return Logger.error('\ngithub: ', orgResponse);
			}

			cloneSpinner.text = 'Cloning repo...';
			const gitService = new GitService({ basePath, token: config.GITHUB_TOKEN });
			await gitService.create(clone, formattedName);
			cloneSpinner.succeed('Clone complete!');
		}

		// Cleanup
		await storageService.removeZip();
		Logger.log('You are all done.');
	} catch (e) {
		Logger.log(e);
		Logger.error('Transfer failed:', e);
		process.exit();
	}
};

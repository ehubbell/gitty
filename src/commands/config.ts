const ora = require('ora');
import { ConfigService } from 'src/services/config-service';
import { GitService } from 'src/services/git-service';
import { GithubService } from 'src/services/github-service';
import { StorageService } from 'src/services/storage-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const configCommand = async (url: string, options: any) => {
	try {
		// Options
		const environment = options.e || options.env;
		const clone = options.c || options.clone || null;
		const path = options.p || options.path || null;
		const version = options.v || options.version || null;
		Logger.log('options: ', { environment, clone, path, version });

		// Config
		const configService = new ConfigService({ basePath: environment });
		const configSpinner = ora('Setting up...\n').start();
		await timeout(300);

		const configValid = await configService.checkEmpty();
		if (!configValid) return configSpinner.fail('Please provide a valid config file.');
		const config: any = await configService.readContents();
		Logger.log('config: ', config);

		// Github
		const githubPath = url.includes('github.com') ? url.split('https://github.com/')[1] : url;
		const githubFragments = githubPath.split('/');
		const ownerId = githubFragments[0];
		const repoId = githubFragments[1];
		const nestedPath = githubFragments.includes('tree')
			? githubFragments.slice(4, githubPath.length).join('/')
			: githubFragments.slice(2, githubPath.length).join('/');
		Logger.log('url: ', { ownerId, repoId, nestedPath });

		// Destination
		const basePath = path || process.cwd();
		const destinationFragments = path?.split('/');
		const formattedName = path
			? destinationFragments[destinationFragments.length - 1]
			: githubFragments[githubFragments.length - 1];
		Logger.log('destination: ', { basePath, formattedName });

		configSpinner.succeed('Setup complete!');

		// Github Step
		const githubService = new GithubService({ token: config.GITHUB_TOKEN });
		const githubSpinner = ora('Fetching repo...\n').start();
		await timeout(300);

		const zipResponse = version
			? await githubService.getRepoVersionZip(ownerId, repoId, version)
			: await githubService.getRepoZip(ownerId, repoId);
		if (zipResponse.status !== 200) {
			githubSpinner.fail('Fetch failed!');
			return Logger.error('Github: ', zipResponse);
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
		await storageService.removeZip();
		storageSpinner.succeed('Storage complete!');

		// Clone Step
		if (clone) {
			const cloneSpinner = ora('Checking github...\n').start();
			await timeout(300);
			const repoResponse = await githubService.getRepo(clone, formattedName);
			if (repoResponse.status !== 404) {
				cloneSpinner.fail('Repo already exists!');
				return Logger.error('github: ', JSON.stringify(repoResponse));
			}

			cloneSpinner.text = 'Creating repo...';
			const createResponse = await githubService.createRepo(clone, {
				name: formattedName,
				private: false,
			});
			if (createResponse.status !== 201) {
				cloneSpinner.fail('Create failed!');
				return Logger.error('github: ', JSON.stringify(createResponse));
			}

			cloneSpinner.text = 'Cloning repo...';
			const gitService = new GitService({ basePath, token: config.GITHUB_TOKEN });
			await gitService.create(clone, formattedName);
			cloneSpinner.succeed('Clone complete!');
		}
	} catch (e) {
		Logger.log(e);
		Logger.error('Transfer failed:', e);
		process.exit();
	}
};

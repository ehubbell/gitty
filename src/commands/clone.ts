const ora = require('ora');
import { ConfigService } from 'src/services/config-service';
import { GitService } from 'src/services/git-service';
import { GithubService } from 'src/services/github-service';
import { StorageService } from 'src/services/storage-service';
import { formatError, timeout } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const cloneCommand = async (url: string, options: any) => {
	try {
		// Options
		const env = options.config;
		const account = options.account || null;
		const name = options.name || null;
		const version = options.version || null;
		Logger.log('options: ', { env, account, name, version });

		// Config
		const configService = new ConfigService({ basePath: env });
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
		const basePath = process.cwd();
		const formattedName = name || githubFragments[githubFragments.length - 1];
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
		const cloneSpinner = ora('Checking github...\n').start();
		await timeout(300);
		const repoResponse = await githubService.getRepo(account, formattedName);
		if (repoResponse.status !== 404) {
			cloneSpinner.fail('Repo already exists!');
			return Logger.error('github: ', JSON.stringify(repoResponse));
		}

		cloneSpinner.text = 'Creating repo...';
		const createResponse = await githubService.createRepo(account, {
			name: formattedName,
			private: false,
		});
		if (createResponse.status !== 201) {
			cloneSpinner.fail('Create failed!');
			return Logger.error('github: ', JSON.stringify(createResponse));
		}

		cloneSpinner.text = 'Cloning repo...';
		const gitService = new GitService({ basePath, token: config.GITHUB_TOKEN });
		await gitService.create(account, formattedName);
		cloneSpinner.succeed('Clone complete!');
	} catch (e) {
		Logger.error(formatError(e));
		process.exit();
	}
};

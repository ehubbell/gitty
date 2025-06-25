const ora = require('ora');
import { ConfigService } from 'src/services/config-service';
import { GithubService } from 'src/services/github-service';
import { StorageService } from 'src/services/storage-service';
import { formatError, formatName, sleep } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const downloadCommand = async (url: string, options: any) => {
	try {
		// Options
		const env = options.config;
		const path = options.path || process.cwd();
		const name = options.name || formatName(url);
		const version = options.version || null;
		Logger.log('options: ', { env, path, name, version });

		// Config
		const configService = new ConfigService({ basePath: env });
		const configSpinner = ora('Setting up...\n').start();
		await sleep(300);

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
		configSpinner.succeed('Setup complete!');

		// Github Step
		const githubService = new GithubService({ token: config.GITHUB_TOKEN });
		const githubSpinner = ora('Fetching repo...\n').start();
		await sleep(300);

		const zipResponse = version
			? await githubService.getRepoVersionZip(ownerId, repoId, version)
			: await githubService.getRepoZip(ownerId, repoId);
		if (zipResponse.status !== 200) {
			githubSpinner.fail('Fetch failed!');
			return Logger.error('Github: ', JSON.stringify(zipResponse));
		}
		githubSpinner.succeed('Fetch complete!');

		// Storage Step
		const storageService = new StorageService({ basePath: path, fileName: name, nestedPath });
		const storageSpinner = ora('Storing repo...\n').start();
		await sleep(300);

		const storageEmpty = await storageService.checkEmpty();
		if (!storageEmpty) return storageSpinner.fail(`Please clear directory: ${path}/${name}`);
		await storageService.saveRepo(zipResponse.data);
		await storageService.unzipRepo();
		await storageService.cleanRepo();
		await storageService.removeZip();
		storageSpinner.succeed('Storage complete!');
	} catch (e) {
		Logger.error(formatError(e));
		process.exit();
	}
};

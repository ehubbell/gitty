const ora = require('ora');
import { ConfigService } from 'src/services/config-service';
import { GithubService } from 'src/services/github-service';
import { StorageService } from 'src/services/storage-service';
import { formatError, sleep } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const downloadCommand = async (url: string, options: any) => {
	try {
		// Options
		const env = options.config;
		const path = options.path || null;
		const unzip = options.unzip || null;
		const clean = options.clean || null;
		const remove = options.remove || null;
		const version = options.version || null;
		Logger.log('options: ', { env, path, unzip, clean, remove, version });

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
		const basePath = path || process.cwd();
		const fileName = githubFragments[githubFragments.length - 1];
		Logger.log('destination: ', { basePath, fileName });

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
		const storageService = new StorageService({ basePath, fileName, nestedPath });
		const storageSpinner = ora('Storing repo...\n').start();
		await sleep(300);

		const storageEmpty = await storageService.checkEmpty();
		if (!storageEmpty) return storageSpinner.fail(`Please clear directory: ${basePath}/${fileName}`);
		await storageService.saveRepo(zipResponse.data);
		if (unzip) await storageService.unzipRepo();
		if (clean) await storageService.cleanRepo();
		if (remove) await storageService.removeZip();
		storageSpinner.succeed('Storage complete!');
	} catch (e) {
		Logger.error(formatError(e));
		process.exit();
	}
};

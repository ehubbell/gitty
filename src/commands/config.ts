import ora from 'ora';
import { ConfigService } from 'src/services/config-service';
import { logger, sleep } from 'src/utils';

export const configCommand = async (options: any) => {
	const spinner = ora('Fetching config...');
	try {
		// Setup
		const config = options.c || options.config;
		logger.log('options: ', { config });

		// Start
		spinner.start();
		await sleep(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readContents();

		// Response
		const data = {};
		Object.keys(contents).map(key => {
			if (key.toLowerCase().includes('token')) return (data[key] = '********');
			data[key] = contents[key];
		});
		const formattedResponse = Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : 'Nothing to see yet.';

		spinner.succeed();
		logger.success(`Config [${config}]: `, formattedResponse);
	} catch (e) {
		spinner.fail();
		logger.error(e);
		process.exit();
	}
};

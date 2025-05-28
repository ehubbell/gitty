const ora = require('ora');
import { ConfigService } from 'src/services/config-service';
import { timeout } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const configCommand = async (options: any) => {
	const spinner = ora('Fetching config...');
	try {
		// Setup
		const config = options.c || options.config;
		Logger.log('options: ', { config });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readContents();

		// Response
		const data = {};
		Object.keys(contents).map(key => {
			if (key === 'token') return (data[key] = '********');
			data[key] = contents[key];
		});
		const formattedResponse = Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : 'Nothing to see yet.';

		spinner.succeed();
		Logger.success(`Config [${config}]: `, formattedResponse);
	} catch (e) {
		spinner.fail();
		Logger.error(e);
		process.exit();
	}
};

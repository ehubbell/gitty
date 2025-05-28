import * as FileSystem from 'src/utils/fs';

interface ConfigService {
	basePath: string;
}

class ConfigService {
	constructor(props: { basePath: string }) {
		this.basePath = props.basePath;
	}

	/* ----- Methods ----- */
	async setup() {
		const fragments = this.basePath.split('/');
		const path = fragments.filter((v, i) => i < fragments.length - 1).join('/');
		const file = fragments[fragments.length - 1];
		return await FileSystem.checkOrCreateFile(path, file);
	}

	async checkEmpty() {
		// console.log("Checking path: ", this.basePath);
		const pathExists = await FileSystem.checkPath(this.basePath);
		if (pathExists) {
			const path = await FileSystem.fileStats(this.basePath);
			if (path.isDirectory()) return false;
			return true;
		}
		return false;
	}

	async readContents() {
		const contents = await FileSystem.readFile(this.basePath);
		const records = contents.split('\n');
		const formattedRecords = {};
		records
			.filter(v => v.length > 0)
			.map(record => {
				const key = record.split('=')[0];
				const value = record.split('=')[1];
				return (formattedRecords[key] = value);
			});
		return formattedRecords;
	}
}

export { ConfigService };

// Docs

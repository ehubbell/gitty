const Archiver = require('archiver');
const Fs = require('fs-extra');
const Stream = require('fstream');
const Unzip = require('unzip-stream');
import * as FileSystem from 'src/utils/file-system';

interface StorageService {
	basePath: string;
	formattedName: string;
	nestedPath?: string;
}

class StorageService {
	constructor(props: { basePath: string; formattedName: string; nestedPath?: string }) {
		this.basePath = props.basePath;
		this.formattedName = props?.formattedName;
		this.nestedPath = props?.nestedPath;
	}

	/* ----- Computed ----- */
	get zipFile() {
		return `${this.basePath}/${this.formattedName}.zip`;
	}

	/* ----- Methods ----- */
	async checkEmpty() {
		const pathExists = await FileSystem.checkPath(this.basePath);
		if (pathExists) {
			const path = await FileSystem.fileStats(this.basePath);
			if (path.isDirectory()) {
				const entries = await Fs.readdir(this.basePath);
				console.log('entries: ', entries);
				return entries.length > 0 ? false : true;
			}
			return true;
		}
		return true;
	}

	async saveRepo(buffer: ArrayBuffer) {
		await FileSystem.checkOrCreatePath(this.basePath);
		await FileSystem.writeFile(this.zipFile, Buffer.from(buffer));
	}

	async fetchRepoStats() {
		return await FileSystem.fileStats(this.basePath);
	}

	async unzipRepo() {
		await FileSystem.checkOrCreatePath(this.basePath);

		await new Promise((resolve, reject) => {
			Fs.createReadStream(this.zipFile)
				.pipe(Unzip.Parse())
				.on('entry', (entry: any) => {
					const type = entry.type;
					const fileName = entry.path;
					const slicedPath = fileName.slice(fileName.indexOf('/'), fileName.length);
					const formattedPath = slicedPath.replace('/' + this.nestedPath, '/');
					const finalPath = this.basePath + formattedPath;
					if (type === 'Directory') return entry.autodrain();
					if (this.nestedPath) {
						const rootPath = slicedPath.split('/')[1];
						const rootFile = rootPath.toLowerCase();
						if (fileName.includes(this.nestedPath) || rootFile === 'license.md') {
							const writer = Stream.Writer({ path: finalPath });
							return entry.pipe(writer);
						}
						return entry.autodrain();
					} else {
						const writer = Stream.Writer({ path: finalPath });
						return entry.pipe(writer);
					}
				})
				.on('close', v => resolve(v))
				.on('error', e => reject(e));
		});
	}

	async cleanRepo() {
		await FileSystem.removePath(this.basePath + '/.git');
		await FileSystem.removePath(this.basePath + '/.github');
	}

	async zipRepo() {
		await FileSystem.checkOrCreatePath(this.basePath);
		const archive = Archiver('zip', { zlib: { level: 9 } });
		const stream = Fs.createWriteStream(this.zipFile);

		await new Promise((resolve, reject) => {
			stream.on('close', v => resolve(v));
			archive.directory(this.basePath, false);
			archive.on('error', err => reject(err));
			archive.pipe(stream);
			archive.finalize();
		});
	}

	async removeRepo() {
		await FileSystem.removePath(this.basePath);
	}

	async removeZip() {
		await FileSystem.removePath(this.zipFile);
	}
}

export { StorageService };

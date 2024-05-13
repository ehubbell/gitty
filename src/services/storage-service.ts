const Archiver = require("archiver");
const Fs = require("fs-extra");
const Stream = require("fstream");
const Unzip = require("unzip-stream");

interface StorageService {
  basePath: string;
  ownerId: string;
  repoId: string;
  versionId?: string;
  nestedPath?: string;
}

class StorageService {
  constructor(props: {
    basePath: string;
    ownerId: string;
    repoId: string;
    versionId?: string;
    nestedPath?: string;
  }) {
    this.basePath = props.basePath;
    this.ownerId = props?.ownerId;
    this.repoId = props?.repoId;
    this.versionId = props?.versionId;
    this.nestedPath = props?.nestedPath;
  }

  /* ----- Computed ----- */
  get repoPath() {
    return `${this.basePath}/repos/${this.ownerId}/${this.repoId}`;
  }

  get repoZipFile() {
    const computedFileName = this.versionId
      ? `${this.versionId}.zip`
      : "default.zip";
    return `${this.basePath}/repos/${this.ownerId}/${this.repoId}/${computedFileName}`;
  }

  get tempPath() {
    const computedVersion = this.versionId ? this.versionId : "default";
    return `${this.basePath}/temp/${this.ownerId}/${this.repoId}/${computedVersion}`;
  }

  get zipPath() {
    return `${this.basePath}/zips/${this.ownerId}/${this.repoId}`;
  }

  get zipFile() {
    const computedFileName = this.versionId ? `${this.versionId}` : "default";
    return `${this.basePath}/zips/${this.ownerId}/${this.repoId}/${computedFileName}.zip`;
  }

  /* ----- Helpers ----- */
  async checkPath(pathName) {
    return await Fs.promises
      .stat(pathName)
      .then(() => true)
      .catch(() => false);
  }

  async checkOrCreatePath(pathName) {
    const pathExists = await this.checkPath(pathName);
    if (!pathExists) await Fs.mkdirSync(pathName, { recursive: true });
  }

  async fileStats(filePath) {
    return await Fs.stat(filePath);
  }

  async removePath(pathName) {
    const pathExists = await this.checkPath(pathName);
    if (pathExists) await Fs.rm(pathName, { recursive: true });
  }

  async writeFile(filePath, content) {
    return await Fs.writeFile(filePath, content);
  }

  /* ----- Methods ----- */
  async checkZip() {
    console.log("checking zip...");
    return await this.checkPath(this.zipFile);
  }

  async saveRepo(buffer) {
    console.log("saving repo...");
    await this.checkOrCreatePath(this.repoPath);
    await this.writeFile(this.repoZipFile, Buffer.from(buffer));
    console.log("repo saved.");
  }

  async fetchRepoStats() {
    console.log("fetching stats: ", this.repoPath);
    return await this.fileStats(this.repoPath);
  }

  async unzipRepo() {
    console.log("unzipping repo: ", this.repoZipFile);
    await this.checkOrCreatePath(this.tempPath);
    const basePath = this.tempPath;

    await new Promise((resolve, reject) => {
      Fs.createReadStream(this.repoZipFile)
        .pipe(Unzip.Parse())
        .on("entry", (entry) => {
          const type = entry.type;
          const fileName = entry.path;
          const slicedPathName = fileName.slice(
            fileName.indexOf("/"),
            fileName.length
          );
          const formattedPath = slicedPathName.replace(
            "/" + this.nestedPath,
            ""
          );
          const finalPath = basePath + formattedPath;
          if (type === "Directory") return entry.autodrain();
          if (this.nestedPath) {
            if (fileName.includes(this.nestedPath)) {
              const writer = Stream.Writer({ path: finalPath });
              return entry.pipe(writer);
            }
            return entry.autodrain();
          } else {
            const writer = Stream.Writer({ path: finalPath });
            return entry.pipe(writer);
          }
        })
        .on("close", (v) => resolve(v))
        .on("error", (e) => reject(e));
    });
  }

  async cleanRepo() {
    await this.removePath(this.tempPath + "/.git");
    await this.removePath(this.tempPath + "/.github");
  }

  async zipRepo() {
    console.log("zipping repo: ", this.zipPath);
    await this.checkOrCreatePath(this.zipPath);
    const archive = Archiver("zip", { zlib: { level: 9 } });
    const stream = Fs.createWriteStream(this.zipFile);

    await new Promise((resolve, reject) => {
      stream.on("close", (v) => resolve(v));
      archive.directory(this.tempPath, false);
      archive.on("error", (err) => reject(err));
      archive.pipe(stream);
      archive.finalize();
    });
  }

  async removeRepo() {
    await this.removePath(this.repoPath);
    await this.removePath(this.tempPath);
    return await this.removePath(this.zipPath);
  }
}

export { StorageService };

// Docs

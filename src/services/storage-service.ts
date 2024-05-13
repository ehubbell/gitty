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
    return this.basePath;
  }

  get zipFile() {
    return `${this.repoPath}/${this.repoId}.zip`;
  }

  /* ----- Helpers ----- */
  async checkPath(pathName: string) {
    return await Fs.promises
      .stat(pathName)
      .then(() => true)
      .catch(() => false);
  }

  async checkOrCreatePath(pathName: string) {
    const pathExists = await this.checkPath(pathName);
    if (!pathExists) await Fs.mkdirSync(pathName, { recursive: true });
  }

  async fileStats(filePath: string) {
    return await Fs.stat(filePath);
  }

  async removePath(pathName: string) {
    const pathExists = await this.checkPath(pathName);
    if (pathExists) await Fs.rm(pathName, { recursive: true });
  }

  async writeFile(filePath: string, content: Buffer) {
    return await Fs.writeFile(filePath, content);
  }

  /* ----- Methods ----- */
  async checkValid() {
    console.log("Checking path: ", this.repoPath);
    const pathExists = await this.checkPath(this.repoPath);
    if (pathExists) {
      const path = await Fs.promises.stat(this.repoPath);
      if (path.isDirectory()) {
        const entries = await Fs.readdir(this.repoPath);
        return entries.length > 0 ? false : true;
      }
      return false;
    }
    return true;
  }

  async saveRepo(buffer: ArrayBuffer) {
    console.log("Saving repo...");
    await this.checkOrCreatePath(this.repoPath);
    await this.writeFile(this.zipFile, Buffer.from(buffer));
    console.log("repo saved.");
  }

  async fetchRepoStats() {
    console.log("fetching stats: ", this.repoPath);
    return await this.fileStats(this.repoPath);
  }

  async unzipRepo() {
    console.log("Unzipping repo: ", this.zipFile);
    await this.checkOrCreatePath(this.repoPath);

    await new Promise((resolve, reject) => {
      Fs.createReadStream(this.zipFile)
        .pipe(Unzip.Parse())
        .on("entry", (entry: any) => {
          const type = entry.type;
          const fileName = entry.path;
          const slicedPathName = fileName.slice(
            fileName.indexOf("/"),
            fileName.length
          );
          const formattedPath = slicedPathName.replace(
            "/" + this.nestedPath,
            "/"
          );
          const finalPath = this.repoPath + formattedPath;
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
    await this.removePath(this.repoPath + "/.git");
    await this.removePath(this.repoPath + "/.github");
  }

  async zipRepo() {
    console.log("Zipping repo: ", this.repoPath);
    await this.checkOrCreatePath(this.repoPath);
    const archive = Archiver("zip", { zlib: { level: 9 } });
    const stream = Fs.createWriteStream(this.zipFile);

    await new Promise((resolve, reject) => {
      stream.on("close", (v) => resolve(v));
      archive.directory(this.repoPath, false);
      archive.on("error", (err) => reject(err));
      archive.pipe(stream);
      archive.finalize();
    });
  }

  async removeRepo() {
    await this.removePath(this.repoPath);
  }

  async removeZip() {
    console.log("Removing zip...");
    await this.removePath(this.zipFile);
  }
}

export { StorageService };

// Docs

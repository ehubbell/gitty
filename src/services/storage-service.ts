const Archiver = require("archiver");
const Fs = require("fs-extra");
const Stream = require("fstream");
const Unzip = require("unzip-stream");
import * as FileSystem from "src/utils/file-system";

interface StorageService {
  basePath: string;
  ownerId: string;
  repoId: string;
  nestedPath?: string;
}

class StorageService {
  constructor(props: {
    basePath: string;
    ownerId: string;
    repoId: string;
    nestedPath?: string;
  }) {
    this.basePath = props.basePath;
    this.ownerId = props?.ownerId;
    this.repoId = props?.repoId;
    this.nestedPath = props?.nestedPath;
  }

  /* ----- Computed ----- */
  get zipFile() {
    return `${this.basePath}/${this.repoId}.zip`;
  }

  /* ----- Methods ----- */
  async checkEmpty() {
    // console.log("Checking path: ", this.basePath);
    const pathExists = await FileSystem.checkPath(this.basePath);
    if (pathExists) {
      const path = await Fs.promises.stat(this.basePath);
      if (path.isDirectory()) {
        const entries = await Fs.readdir(this.basePath);
        return entries.length > 0 ? false : true;
      }
      return false;
    }
    return true;
  }

  async saveRepo(buffer: ArrayBuffer) {
    // console.log("Saving repo...");
    await FileSystem.checkOrCreatePath(this.basePath);
    await FileSystem.writeFile(this.zipFile, Buffer.from(buffer));
    // console.log("repo saved.");
  }

  async fetchRepoStats() {
    // console.log("fetching stats: ", this.basePath);
    return await FileSystem.fileStats(this.basePath);
  }

  async unzipRepo() {
    // console.log("Unzipping repo: ", this.zipFile);
    await FileSystem.checkOrCreatePath(this.basePath);

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
          const finalPath = this.basePath + formattedPath;
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
    await FileSystem.removePath(this.basePath + "/.git");
    await FileSystem.removePath(this.basePath + "/.github");
  }

  async zipRepo() {
    // console.log("Zipping repo: ", this.basePath);
    await FileSystem.checkOrCreatePath(this.basePath);
    const archive = Archiver("zip", { zlib: { level: 9 } });
    const stream = Fs.createWriteStream(this.zipFile);

    await new Promise((resolve, reject) => {
      stream.on("close", (v) => resolve(v));
      archive.directory(this.basePath, false);
      archive.on("error", (err) => reject(err));
      archive.pipe(stream);
      archive.finalize();
    });
  }

  async removeRepo() {
    await FileSystem.removePath(this.basePath);
  }

  async removeZip() {
    // console.log("Removing zip...");
    await FileSystem.removePath(this.zipFile);
  }
}

export { StorageService };

// Docs

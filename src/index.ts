import sade from "sade";
import { GithubService } from "./services/github-service";
import { StorageService } from "./services/storage-service";
import { version } from "../package.json";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

const cli = sade("gitto <url>", true)
  .version(version)
  .describe("Download Github repository or subdirectory to your local machien.")
  .option("-d, --directory", "Path to destination directory")
  .example("fetch vercel/vercel")
  .example("fetch vercel/vercel/examples/angular")
  .example("fetch vercel/vercel/examples/angular --directory storage")
  .example("fetch vercel/vercel/examples/angular --directory ~/storage")
  .action(async (url, opts) => {
    // Path
    const fragments = url.split("https://github.com/")[1];
    const ownerId = fragments.split("/")[0];
    const repoId = fragments.split("/")[1];
    const nestedPath = fragments
      .split("/")
      .slice(4, fragments.length)
      .join("/");
    console.log("params: ", { ownerId, repoId, nestedPath });

    // Options
    console.log("options: ", opts);
    const directory = opts.d || opts.directory;

    // Github Service
    const githubClient = new GithubService(GITHUB_TOKEN);
    const response = await githubClient.getRepoZip(ownerId, repoId);
    console.log("github: ", { status: response.status });

    // Storage Service
    const basePath = directory || "gitto/storage";
    const storageClient = new StorageService({
      basePath,
      ownerId,
      repoId,
      nestedPath,
    });
    console.log("storage: ", storageClient.repoPath);
    await storageClient.saveRepo(response.data);
    await storageClient.unzipRepo();
    await storageClient.cleanRepo();
    await storageClient.zipRepo();
  });

cli.parse(process.argv);

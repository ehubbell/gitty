#!/usr/bin/env node

const sade = require("sade");
// const ora = require("ora");
import { GithubService } from "./services/github-service";
import { StorageService } from "./services/storage-service";
import { version } from "../package.json";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

const cli = sade("playbooks-tar <url>", true)
  .version(version)
  .describe("Download Github repository or subdirectory to your local machine.")
  .option("-d, --destination", "Path to destination directory.")
  .option("-v, --version", "Specific tarball version (optional).")
  .option("-c, --clone", "Perform clone after download is complete.")
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
    const fileName = fragments.split("/")[fragments.length - 1];
    console.log("url: ", { ownerId, repoId, nestedPath });

    // Options
    const destination = opts.d || opts.destination || "";
    const version = opts.v || opts.version || "";
    const clone = opts.c || opts.clone || false;
    console.log("options: ", { destination, version, clone });

    // Github Service
    const githubClient = new GithubService(GITHUB_TOKEN);
    console.log("Fetching repo...");
    const response = version
      ? await githubClient.getRepoVersionZip(ownerId, repoId, version)
      : await githubClient.getRepoZip(ownerId, repoId);
    if (response.status !== 200) {
      console.log("github: ", response);
      return response;
    }

    // Storage Service
    const basePath = destination || process.cwd();
    const storageClient = new StorageService({
      basePath,
      ownerId,
      repoId,
      nestedPath,
    });
    const valid = await storageClient.checkValid();
    if (!valid)
      return console.log("Please clear your destination directory first.");
    await storageClient.saveRepo(response.data);
    await storageClient.unzipRepo();
    await storageClient.cleanRepo();
    await storageClient.removeZip();
    console.log("Done.");
  });

cli.parse(process.argv);

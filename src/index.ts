#!/usr/bin/env node

const sade = require("sade");
import { GitService } from "./services/git-service";
import { GithubService } from "./services/github-service";
import { StorageService } from "./services/storage-service";
import { version } from "../package.json";

const token = import.meta.env.GITHUB_TOKEN;

const cli = sade("playbooks-tar <url>", true)
  .version(version)
  .describe("Download Github repository or subdirectory to your local machine.")
  .option("-d, --destination", "Path to destination directory.")
  .option("-v, --version", "Specify tarball version (optional).")
  .option("-c, --clone", "Perform clone after download is complete.")
  .example("fetch vercel/vercel")
  .example("fetch vercel/vercel/examples/angular")
  .example("fetch vercel/vercel/examples/angular --directory storage")
  .example("fetch vercel/vercel/examples/angular --directory ~/storage")
  .action(async (url: string, options: any) => {
    // Options
    const destination = options.d || options.destination || "";
    const version = options.v || options.version || "";
    const clone = options.c || options.clone || false;
    console.log("options: ", { destination, version, clone });

    // Path
    const paths = url.split("https://github.com/")[1];
    const ownerId = paths.split("/")[0];
    const repoId = paths.split("/")[1];
    const nestedPath = paths.split("/").slice(4, paths.length).join("/");

    const destinations = destination.split("/");
    const formattedName =
      destinations[destinations.length - 1] ||
      paths.split("/")[paths.length - 1];
    console.log("url: ", { ownerId, repoId, nestedPath });

    // Github Step
    console.log("Fetching repo...");
    const github = new GithubService({ token });
    const response = version
      ? await github.getRepoVersionZip(ownerId, repoId, version)
      : await github.getRepoZip(ownerId, repoId);
    if (response.status !== 200) {
      console.log("github: ", response);
      return response;
    }

    // Storage Step
    console.log("Storing repo...");
    const storage = new StorageService({
      basePath: destination || process.cwd(),
      ownerId,
      repoId: formattedName,
      nestedPath,
    });
    const valid = await storage.checkValid();
    if (!valid)
      return console.log("Please clear your destination directory first.");
    await storage.saveRepo(response.data);
    await storage.unzipRepo();
    await storage.cleanRepo();
    await storage.zipRepo();

    // Git Step
    if (clone) {
      console.log("Cloning repo...");
      const git = new GitService({
        basePath: destination || process.cwd(),
        token,
        ownerId: "playbooks-community",
        repoId: formattedName,
      });
      await github.createRepo("playbooks-community", formattedName);
      await git.cloneRepo("playbooks-community", formattedName);
    }

    // Cleanup
    await storage.removeZip();
    console.log("Done.");
  });

cli.parse(process.argv);

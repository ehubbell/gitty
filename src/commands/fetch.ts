import { GitService } from "src/services/git-service";
import { GithubService } from "src/services/github-service";
import { StorageService } from "src/services/storage-service";

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export const fetchCommand = async (url: string, options: any) => {
  // Globals
  const token = options.t || options.token || TOKEN;
  console.log("globals: ", { token });

  // Options
  const clone = options.c || options.clone || false;
  const destination = options.d || options.destination || null;
  const version = options.v || options.version || null;
  console.log("options: ", { clone, destination, version });

  // Path
  const paths = url.split("https://github.com/")[1];
  const ownerId = paths.split("/")[0];
  const repoId = paths.split("/")[1];
  const nestedPath = paths.split("/").slice(4, paths.length).join("/");

  const destinations = destination.split("/");
  const formattedName =
    destinations[destinations.length - 1] || paths.split("/")[paths.length - 1];
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
  const valid = await storage.checkEmpty();
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
};

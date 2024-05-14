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
  const basePath = destination || process.cwd();

  const destinations = destination.split("/");
  const formattedName =
    destinations[destinations.length - 1] || paths.split("/")[paths.length - 1];
  console.log("url: ", { ownerId, repoId, nestedPath });

  // Github Step
  console.log("Fetching repo...");
  const github = new GithubService({ token });
  const zipResponse = version
    ? await github.getRepoVersionZip(ownerId, repoId, version)
    : await github.getRepoZip(ownerId, repoId);
  if (zipResponse.status !== 200) return console.error("github: ", zipResponse);

  // Storage Step
  console.log("Storing repo...");
  const storage = new StorageService({
    basePath,
    ownerId,
    repoId: formattedName,
    nestedPath,
  });
  const valid = await storage.checkEmpty();
  if (!valid) return console.error("Please clear your destination directory.");
  await storage.saveRepo(zipResponse.data);
  await storage.unzipRepo();
  await storage.cleanRepo();
  await storage.zipRepo();

  // Git Step
  if (clone) {
    console.log("Checking repo...");
    const repoResponse = await github.getRepo(
      "playbooks-community",
      formattedName
    );
    if (repoResponse.data) return console.error("Repo already exists");

    console.log("Creating repo...");
    const orgResponse = await github.createOrgRepo("playbooks-community", {
      name: formattedName,
      private: false,
    });
    if (orgResponse.status !== 200)
      return console.error("github: ", orgResponse);

    console.log("Cloning repo...");
    const git = new GitService({ basePath, token });
    await git.create("playbooks-community", formattedName);
  }

  // Cleanup
  await storage.removeZip();
  console.log("Done.");
};

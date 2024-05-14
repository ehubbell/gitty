const SimpleGit = require("simple-git");

const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;
const GITHUB_EMAIL = import.meta.env.VITE_GITHUB_EMAIL;

class GitService {
  basePath: string;
  token: string;

  constructor(props: { basePath: string; token: string }) {
    this.basePath = props.basePath;
    this.token = props?.token;
    this.addConfig("user.name", GITHUB_USER);
    this.addConfig("user.email", GITHUB_EMAIL);
  }

  /* ----- Computed ----- */
  get client() {
    return SimpleGit({
      baseDir: this.basePath,
      binary: "git",
      maxConcurrentProcesses: 6,
    });
  }

  /* ----- Helpers ----- */
  addConfig(key: string, value: string) {
    return this.client.addConfig(
      key,
      value,
      false,
      SimpleGit.GitConfigScope.global
    );
  }

  /* ----- Methods ----- */
  async create(ownerId: string, repoId: string) {
    return await this.client
      .init()
      .add(".")
      .commit("Playbooks clone")
      .addRemote(
        "origin",
        `https://${this.token}@github.com/${ownerId}/${repoId}.git`
      )
      .branch(["-M", "main"])
      .push(["-u", "origin", "main"]);
  }

  async clone(remoteUrl, localPath) {
    return await this.client.clone(remoteUrl, localPath);
  }

  async fetch(options = {}) {
    await this.client.fetch(options);
  }

  async pull(options = {}) {
    await this.client.pull(options);
  }

  async push(options = {}) {
    await this.client.push(options);
  }

  async remove(branch = "origin/main") {
    await this.client.removeRemote(branch);
  }

  async resetRepo(branch = "origin/main") {
    await this.client.reset(SimpleGit.ResetMode.HARD, { branch: null });
  }
}

export { GitService };

// Docs
// https://www.npmjs.com/package/simple-git
// https://git-scm.com/docs/git-init

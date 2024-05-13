const SimpleGit = require("simple-git");

class GitService {
  basePath: string;
  ownerId: string;
  repoId: string;
  token: string;
  versionId?: string;
  nestedPath?: string;

  constructor(props: {
    basePath: string;
    ownerId: string;
    repoId: string;
    token: string;
    versionId?: string;
    nestedPath?: string;
  }) {
    this.basePath = props.basePath;
    this.token = props?.token;
    this.addConfig("user.name", "playbooks");
    this.addConfig("user.email", "git@playbooks.xyz");
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

  cloneUrl(ownerId: string, repoId: string) {
    return `https://${this.token}@github.com/${ownerId}/${repoId}.git`;
  }

  /* ----- Methods ----- */
  async cloneRepo(ownerId: string, repoId: string) {
    const cloneUrl = this.cloneUrl(ownerId, repoId);
    return await this.client
      .init()
      .add(".")
      .commit("Playbooks clone")
      .addRemote("origin", cloneUrl)
      .branch(["-M", "main"])
      .push(["-u", "origin", "main"]);
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

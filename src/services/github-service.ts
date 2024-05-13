import { Octokit } from "@octokit/core";

interface GithubService {
  token: string;
}

class GithubService {
  constructor(token: string) {
    this.token = token;
  }

  /* ----- Computes ----- */
  get client() {
    return new Octokit({ auth: this.token, userAgent: "gitto/v0.0.0" });
  }

  // Queries
  async getRepoZip(ownerId: string, repoId: string) {
    const endpoint = `/repos/${ownerId}/${repoId}/zipball`;
    const response = await this.client.request(`GET ${endpoint}`);
    return { status: response.status, data: response.data };
  }

  async getRepoVersionZip(ownerId: string, repoId: string, versionId?: string) {
    const endpoint = `/repos/${ownerId}/${repoId}/zipball/${versionId}`;
    const response = await this.client.request(`GET ${endpoint}`);
    return { status: response.status, data: response.data };
  }
}

export { GithubService };

// Docs
// https://docs.github.com/en/rest/repos/repos
// https://docs.github.com/en/rest/repos/repos#get-a-repository

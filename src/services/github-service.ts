import { Octokit } from "@octokit/core";

interface GithubService {
  token: string;
}

class GithubService {
  constructor(props: { token: string }) {
    this.token = props?.token;
  }

  /* ----- Computes ----- */
  get client() {
    return new Octokit({ auth: this.token, userAgent: "gitto/v0.0.0" });
  }

  async checkAuth() {
    const auth = await this.client.auth();
    console.log("Authenticated: ", auth.tokenType ? true : false);
  }

  // Queries
  async getRepoZip(ownerId: string, repoId: string) {
    try {
      await this.checkAuth();
      const endpoint = `/repos/${ownerId}/${repoId}/zipball`;
      const response = await this.client.request(`GET ${endpoint}`);
      return { status: response.status, data: response.data };
    } catch (e) {
      return { status: e.status, message: e.message };
    }
  }

  async getRepoVersionZip(ownerId: string, repoId: string, versionId?: string) {
    try {
      await this.checkAuth();
      const endpoint = `/repos/${ownerId}/${repoId}/zipball/${versionId}`;
      const response = await this.client.request(`GET ${endpoint}`);
      return { status: response.status, data: response.data };
    } catch (e) {
      return { status: e.status, message: e.message };
    }
  }

  async createRepo(ownerId: string, repoId: string) {
    try {
      await this.checkAuth();
      const endpoint = `/repos/${ownerId}/${repoId}/zipball`;
      const response = await this.client.request(`GET ${endpoint}`);
      return { status: response.status, data: response.data };
    } catch (e) {
      return { status: e.status, message: e.message };
    }
  }
}

export { GithubService };

// Docs
// https://docs.github.com/en/rest/repos/repos
// https://docs.github.com/en/rest/repos/repos#get-a-repository

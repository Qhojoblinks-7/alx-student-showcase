// GitHub OAuth Service
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/github/callback`;

export class GitHubOAuthService {
  static getAuthUrl() {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'read:user user:email repo',
      state: this.generateState()
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  static generateState() {
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('github_oauth_state', state);
    return state;
  }

  static validateState(state) {
    const savedState = localStorage.getItem('github_oauth_state');
    localStorage.removeItem('github_oauth_state');
    return state === savedState;
  }

  static async exchangeCodeForToken(code) {
    try {
      const response = await fetch('/api/auth/github/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          redirect_uri: GITHUB_REDIRECT_URI
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  static async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  static async getUserEmails(accessToken) {
    try {
      const response = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user emails');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user emails:', error);
      throw error;
    }
  }

  static async getRepositories(accessToken, username) {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  static async getRepositoryDetails(accessToken, owner, repo) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repository details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository details:', error);
      throw error;
    }
  }

  static async getRepositoryLanguages(accessToken, owner, repo) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repository languages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository languages:', error);
      throw error;
    }
  }

  static async getRepositoryCommits(accessToken, owner, repo, since) {
    try {
      const params = new URLSearchParams({
        since: since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        per_page: '100'
      });

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?${params}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repository commits');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository commits:', error);
      throw error;
    }
  }

  static async getRepositoryReadme(accessToken, owner, repo) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        return null; // README might not exist
      }

      const data = await response.json();
      return atob(data.content); // Decode base64 content
    } catch (error) {
      console.error('Error fetching repository README:', error);
      return null;
    }
  }

  static async searchRepositories(accessToken, query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        sort: filters.sort || 'updated',
        order: filters.order || 'desc',
        per_page: filters.per_page || '30'
      });

      if (filters.user) {
        params.append('user', filters.user);
      }

      const response = await fetch(`https://api.github.com/search/repositories?${params}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search repositories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching repositories:', error);
      throw error;
    }
  }

  static async getRateLimit(accessToken) {
    try {
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rate limit');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching rate limit:', error);
      throw error;
    }
  }

  static async createGist(accessToken, description, files, isPublic = false) {
    try {
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          public: isPublic,
          files
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create gist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating gist:', error);
      throw error;
    }
  }

  static async updateGist(accessToken, gistId, description, files) {
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          files
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update gist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating gist:', error);
      throw error;
    }
  }

  static async deleteGist(accessToken, gistId) {
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete gist');
      }

      return true;
    } catch (error) {
      console.error('Error deleting gist:', error);
      throw error;
    }
  }

  static async getGist(accessToken, gistId) {
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gist:', error);
      throw error;
    }
  }

  static async getUserGists(accessToken, username) {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/gists`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user gists');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user gists:', error);
      throw error;
    }
  }

  static async getStarredRepositories(accessToken) {
    try {
      const response = await fetch('https://api.github.com/user/starred', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch starred repositories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching starred repositories:', error);
      throw error;
    }
  }

  static async starRepository(accessToken, owner, repo) {
    try {
      const response = await fetch(`https://api.github.com/user/starred/${owner}/${repo}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to star repository');
      }

      return true;
    } catch (error) {
      console.error('Error starring repository:', error);
      throw error;
    }
  }

  static async unstarRepository(accessToken, owner, repo) {
    try {
      const response = await fetch(`https://api.github.com/user/starred/${owner}/${repo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unstar repository');
      }

      return true;
    } catch (error) {
      console.error('Error unstarring repository:', error);
      throw error;
    }
  }

  static async checkRepositoryStarred(accessToken, owner, repo) {
    try {
      const response = await fetch(`https://api.github.com/user/starred/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return response.status === 204; // 204 means starred, 404 means not starred
    } catch (error) {
      console.error('Error checking repository starred status:', error);
      return false;
    }
  }
}
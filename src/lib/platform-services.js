export const GitLabService = {
  async fetchUserRepositories(username) {
    // Placeholder for GitLab API integration
    console.log(`Fetching repositories for GitLab user: ${username}`);
    return [
      { id: 1, name: 'GitLab Project 1', description: 'Description for GitLab Project 1' },
      { id: 2, name: 'GitLab Project 2', description: 'Description for GitLab Project 2' },
    ];
  },
};

export const BitbucketService = {
  async fetchUserRepositories(username) {
    // Placeholder for Bitbucket API integration
    console.log(`Fetching repositories for Bitbucket user: ${username}`);
    return [
      { id: 1, name: 'Bitbucket Project 1', description: 'Description for Bitbucket Project 1' },
      { id: 2, name: 'Bitbucket Project 2', description: 'Description for Bitbucket Project 2' },
    ];
  },
};

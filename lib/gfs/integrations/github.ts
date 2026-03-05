// GFS Integrations - GitHub Connector

import { getSecret, hasSecrets } from './secrets';
import { IntegrationResponse, GitHubWebhookPayload } from './types';
import { EventBus, GFS_EVENT_TYPES } from '@/lib/gfs/event-bus';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubConnector {
  private pat: string | null = null;

  constructor() {
    this.pat = getSecret('github', 'pat');
  }

  /**
   * Check if GitHub is configured
   */
  isConfigured(): boolean {
    return !!this.pat;
  }

  /**
   * Get authenticated user info
   */
  async getUser(): Promise<IntegrationResponse> {
    if (!this.pat) {
      return { success: false, error: 'GitHub PAT not configured' };
    }

    try {
      const response = await fetch(`${GITHUB_API_BASE}/user`, {
        headers: {
          'Authorization': `Bearer ${this.pat}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GhostFoundry-Syndicate',
        },
      });

      const data = await response.json();

      return {
        success: response.ok,
        raw: data,
        error: response.ok ? undefined : data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Create a new repository
   */
  async createRepo(
    name: string,
    options?: {
      description?: string;
      private?: boolean;
      autoInit?: boolean;
    }
  ): Promise<IntegrationResponse> {
    if (!this.pat) {
      return { success: false, error: 'GitHub PAT not configured' };
    }

    try {
      const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pat}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GhostFoundry-Syndicate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: options?.description,
          private: options?.private ?? true,
          auto_init: options?.autoInit ?? true,
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        raw: data,
        error: response.ok ? undefined : data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Create or update a file in a repository
   */
  async upsertFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    options?: { branch?: string; sha?: string }
  ): Promise<IntegrationResponse> {
    if (!this.pat) {
      return { success: false, error: 'GitHub PAT not configured' };
    }

    try {
      // First, try to get the current file to get its SHA (for updates)
      let sha = options?.sha;
      if (!sha) {
        const existingFile = await this.getFile(owner, repo, path, options?.branch);
        const rawData = existingFile.raw as Record<string, unknown> | undefined;
        if (existingFile.success && rawData?.sha) {
          sha = rawData.sha as string;
        }
      }

      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.pat}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GhostFoundry-Syndicate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            content: Buffer.from(content).toString('base64'),
            branch: options?.branch,
            sha,
          }),
        }
      );

      const data = await response.json();

      return {
        success: response.ok,
        raw: data,
        error: response.ok ? undefined : data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get a file from a repository
   */
  async getFile(
    owner: string,
    repo: string,
    path: string,
    branch?: string
  ): Promise<IntegrationResponse> {
    if (!this.pat) {
      return { success: false, error: 'GitHub PAT not configured' };
    }

    try {
      const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`);
      if (branch) {
        url.searchParams.set('ref', branch);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.pat}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GhostFoundry-Syndicate',
        },
      });

      const data = await response.json();

      return {
        success: response.ok,
        raw: data,
        error: response.ok ? undefined : data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<IntegrationResponse> {
    if (!this.pat) {
      return { success: false, error: 'GitHub PAT not configured' };
    }

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.pat}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GhostFoundry-Syndicate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            head,
            base,
            body,
          }),
        }
      );

      const data = await response.json();

      return {
        success: response.ok,
        raw: data,
        error: response.ok ? undefined : data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Process a GitHub webhook
   */
  async processWebhook(
    event: string,
    payload: GitHubWebhookPayload
  ): Promise<void> {
    // Emit event to the event bus
    await EventBus.emit('integration', GFS_EVENT_TYPES.GITHUB_WEBHOOK_RECEIVED, {
      event,
      action: payload.action,
      repository: payload.repository?.full_name,
      sender: payload.sender?.login,
      payload,
    });
  }
}

// Singleton instance
export const githubConnector = new GitHubConnector();

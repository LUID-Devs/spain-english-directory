import React from 'react';
import { GitCommit, GitPullRequest, ExternalLink, Github } from 'lucide-react';
import { useGetTaskGitLinksQuery } from '@/hooks/useApi';
import { GitLink } from '@/services/apiService';

interface GitActivityProps {
  taskId: number;
}

const GitActivity: React.FC<GitActivityProps> = ({ taskId }) => {
  const { data: gitLinks, isLoading, error } = useGetTaskGitLinksQuery(taskId, { skip: !taskId });

  const commits = gitLinks?.filter((link) => link.type === 'commit') || [];
  const pullRequests = gitLinks?.filter((link) => link.type === 'pull_request') || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPrStatusColor = (state?: string) => {
    switch (state) {
      case 'merged':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'closed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'open':
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-muted-foreground">
        Failed to load Git activity
      </div>
    );
  }

  if (!gitLinks || gitLinks.length === 0) {
    return (
      <div className="text-xs text-muted-foreground py-2">
        No Git activity linked to this task yet.
        <br />
        <span className="text-muted-foreground/70">
          Reference this task in a commit message (#{taskId}) or PR to link it.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pull Requests Section */}
      {pullRequests.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <GitPullRequest className="h-3 w-3" />
            Pull Requests ({pullRequests.length})
          </h4>
          <div className="space-y-2">
            {pullRequests.map((pr) => (
              <GitLinkItem 
                key={pr.id} 
                link={pr} 
                formatDate={formatDate} 
                getPrStatusColor={getPrStatusColor} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Commits Section */}
      {commits.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <GitCommit className="h-3 w-3" />
            Commits ({commits.length})
          </h4>
          <div className="space-y-2">
            {commits.map((commit) => (
              <GitLinkItem 
                key={commit.id} 
                link={commit} 
                formatDate={formatDate}
                getPrStatusColor={getPrStatusColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface GitLinkItemProps {
  link: GitLink;
  formatDate: (date: string) => string;
  getPrStatusColor: (state?: string) => string;
}

const GitLinkItem: React.FC<GitLinkItemProps> = ({ link, formatDate, getPrStatusColor }) => {
  const isPR = link.type === 'pull_request';

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-2 rounded-md border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isPR ? (
            <GitPullRequest className="h-3.5 w-3.5 text-purple-500" />
          ) : (
            <GitCommit className="h-3.5 w-3.5 text-blue-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate">
              {link.title}
            </span>
            {isPR && link.prState && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getPrStatusColor(link.prState)}`}>
                {link.prState}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Github className="h-3 w-3" />
              {link.repository}
            </span>
            <span>•</span>
            <span>{link.authorUsername || link.authorName}</span>
            <span>•</span>
            <span>{formatDate(link.gitCreatedAt)}</span>
          </div>

          {/* Branch info for commits */}
          {!isPR && link.branch && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              branch: {link.branch}
            </div>
          )}

          {/* Ref */}
          <div className="text-[10px] font-mono text-muted-foreground mt-1">
            {isPR ? `PR #${link.prNumber}` : link.ref}
          </div>
        </div>

        {/* External link icon */}
        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </a>
  );
};

export default GitActivity;

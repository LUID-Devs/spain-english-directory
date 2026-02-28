export interface LibraryItem {
  id: string;
  type: 'project' | 'task' | 'goal' | 'document';
  title: string;
  description?: string;
  updatedAt: string;
  createdAt: string;
  isFavorited: boolean;
  isPrivate: boolean;
  isShared: boolean;
  owner: {
    id: string;
    username: string;
    profilePictureUrl?: string;
  };
  collaborators?: Array<{
    id: string;
    username: string;
    profilePictureUrl?: string;
  }>;
  teamspaceId?: string;
  teamspaceName?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
  thumbnailUrl?: string;
}

export interface LibraryFilters {
  search: string;
  sortBy: 'updated' | 'created' | 'name' | 'priority';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  teamspaceId?: string;
  tags?: string[];
}

export interface SidebarPreferences {
  showFavorites: boolean;
  showRecents: boolean;
  showPrivate: boolean;
  showShared: boolean;
  collapsedSections: string[];
  maxRecentItems: number;
}

export interface LibraryResponse {
  items: LibraryItem[];
  total: number;
  hasMore: boolean;
}

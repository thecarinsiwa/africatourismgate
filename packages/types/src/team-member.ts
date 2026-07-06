import type { AuditFields } from './index.js';

export type TeamMemberStatus = 'draft' | 'published';

export interface TeamMember extends AuditFields {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  sortOrder: number;
  status: TeamMemberStatus;
  locale: string;
}

export interface PublicTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  sortOrder: number;
  locale: string;
}

export interface CreateTeamMemberRequest {
  name: string;
  role: string;
  bio?: string | null;
  photoUrl?: string | null;
  sortOrder?: number;
  status?: TeamMemberStatus;
  locale?: string;
}

export type UpdateTeamMemberRequest = Partial<CreateTeamMemberRequest>;

export interface TeamMembersListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TeamMemberStatus;
  locale?: string;
}

export interface PublicTeamMembersListQuery {
  page?: number;
  limit?: number;
  locale?: string;
}

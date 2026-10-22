import type { AuditFields } from './index.js';

export type TeamMemberStatus = 'draft' | 'published';

/** Contact and social links shown on the public profile page. */
export interface TeamMemberContactFields {
  email: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
}

export interface TeamMember extends AuditFields, TeamMemberContactFields {
  id: string;
  name: string;
  /** Unique per locale; used in `/about/team/[slug]`. */
  slug: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  sortOrder: number;
  status: TeamMemberStatus;
  locale: string;
}

export interface PublicTeamMember extends TeamMemberContactFields {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  sortOrder: number;
  locale: string;
}

export interface CreateTeamMemberRequest {
  name: string;
  /** Generated from the name when omitted, null or empty. */
  slug?: string | null;
  role: string;
  bio?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
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

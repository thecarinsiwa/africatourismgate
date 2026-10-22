import { ConflictException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { slugify } from '../../src/common/constants/slug';
import type { TeamMembers } from '../../src/entities/team-member.entity';
import { TeamMembersService } from '../../src/modules/resources/team-members/team-members.service';

type Row = { id: string; slug: string; locale: string; name: string };

/** Minimal repository double: query builder counts rows matching slug/locale/excludeId. */
function createRepository(rows: Row[]) {
  const saved: Partial<TeamMembers>[] = [];

  const createQueryBuilder = () => {
    const params: Record<string, string> = {};
    const qb = {
      withDeleted: () => qb,
      where: (_sql: string, p: Record<string, string>) => (Object.assign(params, p), qb),
      andWhere: (_sql: string, p: Record<string, string>) => (Object.assign(params, p), qb),
      getCount: async () =>
        rows.filter(
          (row) =>
            row.slug === params.slug &&
            row.locale === params.locale &&
            (!params.excludeId || row.id !== params.excludeId),
        ).length,
    };
    return qb;
  };

  const repository = {
    createQueryBuilder,
    create: (dto: Partial<TeamMembers>) => dto,
    merge: (target: Partial<TeamMembers>, patch: Partial<TeamMembers>) => Object.assign(target, patch),
    save: async (entity: Partial<TeamMembers>) => {
      saved.push({ ...entity });
      return entity;
    },
    findOne: async ({ where }: { where: { id: string } }) => {
      const row = rows.find((r) => r.id === where.id);
      return row ? { ...row } : null;
    },
  };

  return { repository: repository as unknown as Repository<TeamMembers>, saved };
}

describe('slugify', () => {
  it('strips accents, ligatures and punctuation', () => {
    expect(slugify('Jean-Pierre Mwamba')).toBe('jean-pierre-mwamba');
    expect(slugify('  Élodie  Œuvre & Cie ')).toBe('elodie-oeuvre-cie');
    expect(slugify('Carin SIWA')).toBe('carin-siwa');
  });

  it('respects max length without trailing hyphen', () => {
    expect(slugify('abc def', 4)).toBe('abc');
  });

  it('returns an empty string when nothing is usable', () => {
    expect(slugify('—')).toBe('');
  });
});

describe('TeamMembersService slug handling', () => {
  it('generates the slug from the name when omitted', async () => {
    const { repository, saved } = createRepository([]);
    const service = new TeamMembersService(repository);

    await service.createFromDto({ name: 'Carin Siwa', role: 'CEO', locale: 'en' });

    expect(saved[0]?.slug).toBe('carin-siwa');
  });

  it('adds a numeric suffix when the generated slug is taken in the same locale', async () => {
    const { repository, saved } = createRepository([
      { id: 'a', slug: 'carin-siwa', locale: 'fr', name: 'Carin Siwa' },
      { id: 'b', slug: 'carin-siwa-2', locale: 'fr', name: 'Carin Siwa' },
    ]);
    const service = new TeamMembersService(repository);

    await service.createFromDto({ name: 'Carin Siwa', role: 'CEO', locale: 'fr' });

    expect(saved[0]?.slug).toBe('carin-siwa-3');
  });

  it('allows the same slug in another locale', async () => {
    const { repository, saved } = createRepository([
      { id: 'a', slug: 'carin-siwa', locale: 'fr', name: 'Carin Siwa' },
    ]);
    const service = new TeamMembersService(repository);

    await service.createFromDto({ name: 'Carin Siwa', slug: 'carin-siwa', role: 'CEO', locale: 'en' });

    expect(saved[0]?.slug).toBe('carin-siwa');
  });

  it('rejects an explicit slug already used in the locale', async () => {
    const { repository } = createRepository([
      { id: 'a', slug: 'carin-siwa', locale: 'fr', name: 'Carin Siwa' },
    ]);
    const service = new TeamMembersService(repository);

    await expect(
      service.createFromDto({ name: 'Other', slug: 'carin-siwa', role: 'CTO', locale: 'fr' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('keeps the slug stable when only the name changes', async () => {
    const { repository, saved } = createRepository([
      { id: 'a', slug: 'carin-siwa', locale: 'fr', name: 'Carin Siwa' },
    ]);
    const service = new TeamMembersService(repository);

    await service.updateFromDto('a', { name: 'Carin S. Siwa' });

    expect(saved[0]?.slug).toBe('carin-siwa');
  });

  it('regenerates the slug from the name when cleared, ignoring the row itself', async () => {
    const { repository, saved } = createRepository([
      { id: 'a', slug: 'old-slug', locale: 'fr', name: 'Carin Siwa' },
    ]);
    const service = new TeamMembersService(repository);

    await service.updateFromDto('a', { slug: '' });

    expect(saved[0]?.slug).toBe('carin-siwa');
  });

  it('normalizes empty contact fields to null', async () => {
    const { repository, saved } = createRepository([]);
    const service = new TeamMembersService(repository);

    await service.createFromDto({
      name: 'Carin Siwa',
      role: 'CEO',
      email: '  ',
      linkedinUrl: ' https://www.linkedin.com/in/carin ',
    });

    expect(saved[0]?.email).toBeNull();
    expect(saved[0]?.linkedinUrl).toBe('https://www.linkedin.com/in/carin');
  });
});

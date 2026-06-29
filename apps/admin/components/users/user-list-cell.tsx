import type { User } from '@africatourismgate/types';
import { Avatar } from '@africatourismgate/ui';

export function UserListCell({
  userId,
  usersById,
}: {
  userId: string;
  usersById: Map<string, User>;
}) {
  const user = usersById.get(userId);
  if (user) {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return (
      <div className="flex items-center gap-3">
        <Avatar
          email={user.email}
          firstName={user.firstName}
          lastName={user.lastName}
          size="sm"
        />
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium text-atg-fg">
            {fullName || user.email}
          </span>
          <span className="block truncate text-xs text-atg-muted">{user.email}</span>
        </div>
      </div>
    );
  }
  return <span className="font-mono text-xs">{userId.slice(0, 8)}…</span>;
}

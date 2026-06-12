import type { User } from '@africatourismgate/types';

export function UserListCell({
  userId,
  usersById,
}: {
  userId: string;
  usersById: Map<string, User>;
}) {
  const user = usersById.get(userId);
  if (user) {
    return (
      <span>
        {user.firstName} {user.lastName}
        <span className="block text-xs text-atg-muted">{user.email}</span>
      </span>
    );
  }
  return <span className="font-mono text-xs">{userId.slice(0, 8)}…</span>;
}

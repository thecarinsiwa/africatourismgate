'use client';

import { Avatar } from '@africatourismgate/ui';
import type { TourGuide } from '@africatourismgate/types';

type TourGuideAvatarProps = {
  guide: TourGuide;
  size?: 'md' | 'lg';
};

export function TourGuideAvatar({ guide, size = 'md' }: TourGuideAvatarProps) {
  const user = guide.user;

  if (user) {
    return (
      <Avatar
        email={user.email}
        firstName={user.firstName}
        lastName={user.lastName}
        src={guide.photoUrl}
        size={size}
      />
    );
  }

  return (
    <Avatar
      email={`${guide.id}@guide`}
      firstName={guide.displayName}
      src={guide.photoUrl}
      size={size}
      label={guide.displayName}
    />
  );
}

'use client';

import type { PublicContact } from '@africatourismgate/types';
import { DEFAULT_PUBLIC_CONTACT } from '@africatourismgate/types/organization-settings';
import { useEffect, useState } from 'react';
import { usePublicContact } from '../../components/contact-provider';

import { getWebApiUrl } from '../api/get-api-url';

export function useResolvedPublicContact(): PublicContact {
  const serverContact = usePublicContact();
  const [contact, setContact] = useState<PublicContact>(
    serverContact ?? DEFAULT_PUBLIC_CONTACT,
  );

  useEffect(() => {
    if (serverContact) {
      setContact(serverContact);
      return;
    }

    const apiUrl = getWebApiUrl();

    async function loadContact() {
      try {
        const response = await fetch(`${apiUrl}/organization-settings/public/contact`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!response.ok) return;
        const payload = (await response.json()) as PublicContact;
        setContact({
          phone: payload.phone ?? DEFAULT_PUBLIC_CONTACT.phone,
          email: payload.email ?? DEFAULT_PUBLIC_CONTACT.email,
          location: payload.location ?? DEFAULT_PUBLIC_CONTACT.location,
          facebookUrl: payload.facebookUrl ?? DEFAULT_PUBLIC_CONTACT.facebookUrl,
          twitterUrl: payload.twitterUrl ?? DEFAULT_PUBLIC_CONTACT.twitterUrl,
          instagramUrl: payload.instagramUrl ?? DEFAULT_PUBLIC_CONTACT.instagramUrl,
        });
      } catch {
        // Keep defaults if contact endpoint is unavailable.
      }
    }

    void loadContact();
  }, [serverContact]);

  return contact;
}

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PublicContact } from '@africatourismgate/types';

const ContactContext = createContext<PublicContact | null>(null);

export function ContactProvider({
  contact,
  children,
}: {
  contact: PublicContact;
  children: ReactNode;
}) {
  return <ContactContext.Provider value={contact}>{children}</ContactContext.Provider>;
}

export function usePublicContact(): PublicContact | null {
  return useContext(ContactContext);
}

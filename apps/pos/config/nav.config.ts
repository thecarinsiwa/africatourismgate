export type PosNavLinkConfig = {
  href: string;
  label: string;
  iconKey: string;
};

export const posNavConfig: PosNavLinkConfig[] = [
  { href: '/', label: 'Caisse', iconKey: 'dashboard' },
  { href: '/sale', label: 'Nouvelle vente', iconKey: 'payments' },
];

import Link from 'next/link';

const PRODUCT_LINKS = [
  { href: '/hotels', label: 'Hébergements' },
  { href: '#vols', label: 'Vols' },
  { href: '#voitures', label: 'Voitures' },
  { href: '#forfaits', label: 'Forfaits' },
  { href: '#activites', label: 'Activités' },
  { href: '#croisieres', label: 'Croisières' },
] as const;

const DESTINATION_LINKS = [
  { href: '/hotels?destination=Nairobi', label: 'Nairobi' },
  { href: '/hotels?destination=Le%20Cap', label: 'Le Cap' },
  { href: '/hotels?destination=Marrakech', label: 'Marrakech' },
  { href: '/hotels?destination=Zanzibar', label: 'Zanzibar' },
  { href: '/hotels?destination=Kigali', label: 'Kigali' },
  { href: '/hotels?destination=Lagos', label: 'Lagos' },
  { href: '/hotels?destination=Accra', label: 'Accra' },
  { href: '/hotels?destination=Le%20Caire', label: 'Le Caire' },
] as const;

const ABOUT_LINKS = [
  { href: '#about', label: 'Qui sommes-nous' },
  { href: '#careers', label: 'Carrières' },
  { href: '#press', label: 'Presse' },
] as const;

const SUPPORT_LINKS = [
  { href: '#help', label: 'Centre d\'aide' },
  { href: '#cancel', label: 'Annulations' },
  { href: '#contact', label: 'Nous contacter' },
] as const;

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<{ href: string; label: string }> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-atg-fg">{title}</h3>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-atg-muted hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HomeFooter() {
  return (
    <footer className="border-t border-atg-border bg-atg-elevated">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-bold text-atg-fg">Africa Tourism Gate</p>
            <p className="mt-2 text-sm text-atg-muted max-w-xs">
              Votre passerelle vers les meilleures expériences de voyage en Afrique.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="https://www.facebook.com/africatourismgate/"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b5998] text-white hover:opacity-90 transition-opacity"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
              </a>
              <a
                href="https://x.com/Congotourismga1"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#55acee] text-white hover:opacity-90 transition-opacity"
                aria-label="X"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
                  <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10C2.38 10 2.38 10 2.38 10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16.01 6.01 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/africatourismgate/"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#fd5949] to-[#d6249f] text-white hover:opacity-90 transition-opacity"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2.16C15.2 2.16 15.58 2.17 16.86 2.23C18.04 2.28 18.84 2.51 19.53 2.78C20.25 3.06 20.86 3.44 21.46 4.04C22.06 4.64 22.44 5.25 22.72 5.97C22.99 6.66 23.22 7.46 23.27 8.64C23.33 9.92 23.34 10.3 23.34 13.5C23.34 16.7 23.33 17.08 23.27 18.36C23.22 19.54 22.99 20.34 22.72 21.03C22.44 21.75 22.06 22.36 21.46 22.96C20.86 23.56 20.25 23.94 19.53 24.22C18.84 24.49 18.04 24.72 16.86 24.77C15.58 24.83 15.2 24.84 12 24.84C8.8 24.84 8.42 24.83 7.14 24.77C5.96 24.72 5.16 24.49 4.47 24.22C3.75 23.94 3.14 23.56 2.54 22.96C1.94 22.36 1.56 21.75 1.28 21.03C1.01 20.34 0.78 19.54 0.73 18.36C0.67 17.08 0.66 16.7 0.66 13.5C0.66 10.3 0.67 9.92 0.73 8.64C0.78 7.46 1.01 6.66 1.28 5.97C1.56 5.25 1.94 4.64 2.54 4.04C3.14 3.44 3.75 3.06 4.47 2.78C5.16 2.51 5.96 2.28 7.14 2.23C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33 0.01 7.05 0.07C5.77 0.13 4.9 0.33 4.14 0.63C3.35 0.94 2.68 1.34 2.01 2.01C1.34 2.68 0.94 3.35 0.63 4.14C0.33 4.9 0.13 5.77 0.07 7.05C0.01 8.33 0 8.74 0 12C0 15.26 0.01 15.67 0.07 16.95C0.13 18.23 0.33 19.1 0.63 19.86C0.94 20.65 1.34 21.32 2.01 21.99C2.68 22.66 3.35 23.06 4.14 23.37C4.9 23.67 5.77 23.87 7.05 23.93C8.33 23.99 8.74 24 12 24C15.26 24 15.67 23.99 16.95 23.93C18.23 23.87 19.1 23.67 19.86 23.37C20.65 23.06 21.32 22.66 21.99 21.99C22.66 21.32 23.06 20.65 23.37 19.86C23.67 19.1 23.87 18.23 23.93 16.95C23.99 15.67 24 15.26 24 12C24 8.74 23.99 8.33 23.93 7.05C23.87 5.77 23.67 4.9 23.37 4.14C23.06 3.35 22.66 2.68 21.99 2.01C21.32 1.34 20.65 0.94 19.86 0.63C19.1 0.33 18.23 0.13 16.95 0.07C15.67 0.01 15.26 0 12 0ZM12 5.84C8.6 5.84 5.84 8.6 5.84 12C5.84 15.4 8.6 18.16 12 18.16C15.4 18.16 18.16 15.4 18.16 12C18.16 8.6 15.4 5.84 12 5.84ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM18.41 4.15C17.62 4.15 16.97 4.79 16.97 5.59C16.97 6.38 17.62 7.03 18.41 7.03C19.2 7.03 19.84 6.38 19.84 5.59C19.84 4.79 19.2 4.15 18.41 4.15Z" />
                </svg>
              </a>
            </div>
          </div>

          <FooterColumn title="Produit" links={PRODUCT_LINKS} />
          <FooterColumn title="Destinations" links={DESTINATION_LINKS} />
          <FooterColumn title="À propos" links={ABOUT_LINKS} />

          {/* Support + Legal combined */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-atg-fg">Assistance</h3>
            <ul className="mt-4 space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-atg-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-atg-fg">Légal</h3>
            <ul className="mt-4 space-y-2 text-sm text-atg-muted">
              <li>
                <span className="cursor-default">Conditions générales</span>
              </li>
              <li>
                <span className="cursor-default">Politique de confidentialité</span>
              </li>
              <li>
                <Link href="/coming-soon" className="hover:text-primary transition-colors">
                  Version Coming Soon
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-atg-border pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-atg-muted">
            © {new Date().getFullYear()} Africa Tourism Gate. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-atg-muted flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Français
            </span>
            <Link
              href="/hotels"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Rechercher un hébergement →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

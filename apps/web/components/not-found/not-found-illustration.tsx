/** Illustration « hors parcours » pour la page 404. */
export function NotFoundIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={`text-primary ${className ?? ''}`}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Soft ground wash */}
      <ellipse cx="100" cy="128" rx="78" ry="18" fill="currentColor" fillOpacity="0.08" />

      {/* Distant hills */}
      <path
        d="M12 108c18-22 36-34 54-28 14 5 24 18 38 16 16-2 28-18 46-22 14-3 28 4 38 14v20H12v-0z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path
        d="M28 118c14-14 28-22 42-18 12 3 20 12 32 11 14-1 24-12 40-14 12-2 24 4 30 12v14H28v-5z"
        fill="currentColor"
        fillOpacity="0.18"
      />

      {/* Winding path that fades */}
      <path
        d="M72 138c8-10 14-18 18-28 4-10 6-18 4-28-2-12 4-22 14-30 8-6 16-8 24-6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 8"
        strokeOpacity="0.55"
      />
      <path
        d="M72 138c6-8 10-14 13-22"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Traveler pin at path end */}
      <circle cx="132" cy="46" r="14" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="132" cy="46" r="5" fill="currentColor" />
      <path
        d="M132 60v10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Broken waymark */}
      <path
        d="M48 72l6-14 6 4-4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.45"
      />
      <circle cx="54" cy="54" r="3" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

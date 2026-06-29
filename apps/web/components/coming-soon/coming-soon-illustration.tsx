/** Illustration légère partagée par les pages coming-soon (WEB-UX-18). */
export function ComingSoonIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={`text-primary ${className ?? ''}`}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="60" cy="60" r="54" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 6" />
      <path
        d="M60 28v8M60 84v8M28 60h8M84 60h8"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="60" r="6" fill="currentColor" />
      <path
        d="M78 42c8 4 12 12 12 18-6-2-12-4-18-8M42 78c-8-4-12-12-12-18 6 2 12 4 18 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M48 36l4 8 8 2-6 6 1 8-7-4-7 4 1-8-6-6 8-2 4-8z"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  );
}

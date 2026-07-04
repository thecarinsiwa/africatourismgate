export function BookingChatFabIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2C6.48 2 2 5.94 2 11c0 2.35 1.02 4.47 2.65 5.97L3 22l6.18-3.59C10.41 18.88 11.18 19 12 19c5.52 0 10-3.94 10-8s-4.48-8-10-8z"
        fill="currentColor"
      />
      <circle cx="8.5" cy="11" r="1.15" fill="var(--atg-primary)" />
      <circle cx="12" cy="11" r="1.15" fill="var(--atg-primary)" />
      <circle cx="15.5" cy="11" r="1.15" fill="var(--atg-primary)" />
    </svg>
  );
}

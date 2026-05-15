'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
      <p className="mt-2 max-w-md text-center text-sm text-slate-600">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Try again
      </button>
    </main>
  );
}

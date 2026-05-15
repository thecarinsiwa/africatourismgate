import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-slate-900">Page not found</h2>
      <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Back to admin home
      </Link>
    </main>
  );
}

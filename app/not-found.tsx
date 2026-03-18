import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6 font-sans">
      <div className="text-center">
        <h1 className="font-serif text-[48px] text-ink font-normal mb-2">404</h1>
        <p className="text-body text-ink-secondary mb-6">Page not found.</p>
        <Link href="/" className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition">Go home</Link>
      </div>
    </div>
  );
}

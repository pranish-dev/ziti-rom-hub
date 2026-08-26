import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-text flex flex-col items-start justify-center py-24 sm:py-32">
      <p className="eyebrow-accent">Error 404</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
        Not found
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        This ROM, release or guide does not exist — it may have been renamed
        or removed. Try the release archive instead.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          Home
        </Link>
        <Link href="/releases" className="btn-secondary">
          All releases
        </Link>
        <Link href="/guides" className="btn-secondary">
          Guides
        </Link>
      </div>
    </div>
  );
}

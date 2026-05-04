import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-6xl font-bold" style={{ color: "var(--md-primary)" }}>
        404
      </h1>
      <p className="text-lg" style={{ color: "var(--md-text-secondary)" }}>
        Page not found
      </p>
      <Link
        href="/"
        className="rounded-[28px] px-6 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
        style={{ backgroundColor: "var(--md-primary)", color: "var(--md-on-primary)" }}
      >
        Go home
      </Link>
    </div>
  );
}

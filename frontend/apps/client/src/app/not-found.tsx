import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-5xl">404</h1>
      <p className="text-muted-foreground">Cette page n'existe pas ou a été déplacée.</p>
      <Link
        href="/"
        className="rounded-full bg-ink px-6 py-2.5 font-semibold text-background transition-colors hover:bg-accent"
      >
        Retour à l'accueil
      </Link>
    </main>
  );
}

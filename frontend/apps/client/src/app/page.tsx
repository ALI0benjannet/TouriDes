import type { Metadata } from "next";
import Link from "next/link";

import fr from "@touribook/i18n/locales/fr/common.json";

import { ActivityCard } from "@/components/activities/ActivityCard";
import { ActivityImage } from "@/components/activities/ActivityImage";
import { HeroSearch } from "@/components/home/HeroSearch";
import { fetchActivities, fetchReviewStats } from "@/lib/server-api";
import { paths } from "@/routes/paths";

export const metadata: Metadata = {
  description: fr.home.heroSub,
  alternates: { canonical: "/" },
};

/* Régions mises en avant (design) — mènent au catalogue filtré */
const DESTINATIONS = [
  { name: "Tunis & Carthage", q: "Tunis", tag: fr.home.destTags.tunis },
  { name: "Djerba", q: "Djerba", tag: fr.home.destTags.djerba },
  { name: "Tozeur & le désert", q: "Tozeur", tag: fr.home.destTags.tozeur },
  { name: "Tabarka", q: "Tabarka", tag: fr.home.destTags.tabarka },
] as const;

const VALUES = [fr.home.values.cancel, fr.home.values.guides, fr.home.values.payment];

/** Page d'accueil — rendue côté serveur (SEO) ; recherche et cœurs = îlots client. */
export default async function HomePage() {
  const popular = await fetchActivities({ size: 4 });
  const stats = await fetchReviewStats(popular.items.map((a) => a.id));

  return (
    <div>
      {/* ---- Hero + recherche ---- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary to-[#D9E8E2]">
        <div
          aria-hidden
          className="absolute -top-32 end-[-80px] size-[420px] rounded-full bg-[radial-gradient(circle,rgba(228,169,62,.35),transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 start-[-60px] size-96 rounded-full bg-[radial-gradient(circle,rgba(15,124,140,.18),transparent_70%)]"
        />
        <div className="animate-fade-up relative mx-auto max-w-7xl px-4 pb-24 pt-16 text-center sm:px-8">
          <span className="inline-block rounded-full border border-primary/40 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wider text-primary">
            {fr.home.heroKicker}
          </span>
          <h1 className="font-display mx-auto mb-4 mt-6 max-w-3xl text-4xl leading-[1.08] sm:text-6xl">
            {fr.home.heroTitle}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-foreground/70">
            {fr.home.heroSub}
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* ---- Destinations ---- */}
      <section className="mx-auto max-w-7xl px-4 pb-3 pt-16 sm:px-8">
        <div className="mb-6">
          <h2 className="font-display text-3xl">{fr.home.destTitle}</h2>
          <p className="mt-2 text-muted-foreground">{fr.home.destSub}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.name}
              href={`${paths.activities}?search=${encodeURIComponent(dest.q)}`}
              className="group relative block h-52 overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(28,54,65,.16)]"
            >
              <ActivityImage label={`Photo — ${dest.name}`} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-3.5 pt-9">
                <div className="font-display text-xl text-white">{dest.name}</div>
                <div className="mt-0.5 text-[13px] text-white/85">{dest.tag}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Activités populaires (rendu serveur → indexable) ---- */}
      <section className="mx-auto max-w-7xl px-4 pb-5 pt-14 sm:px-8">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-3xl">{fr.home.popTitle}</h2>
            <p className="mt-2 text-muted-foreground">{fr.home.popSub}</p>
          </div>
          <Link
            href={paths.activities}
            className="rounded-full border border-input px-5 py-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            {fr.home.seeAll}
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {popular.items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} rating={stats[String(activity.id)]} />
          ))}
        </div>
      </section>

      {/* ---- Arguments ---- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="font-display mb-2 text-lg text-primary">{value.title}</div>
              <div className="text-sm leading-relaxed text-foreground/70">{value.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

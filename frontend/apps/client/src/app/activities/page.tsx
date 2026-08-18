import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import fr from "@touribook/i18n/locales/fr/common.json";

import { ActivityCard } from "@/components/activities/ActivityCard";
import { CatalogControls } from "@/components/catalog/CatalogControls";
import type { Activity } from "@/features/catalog/api";
import { formatPrice } from "@/features/catalog/format";
import { fetchActivities, fetchCategories, fetchReviewStats } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Activités",
  description:
    "Toutes les activités touristiques à réserver en Tunisie : mer, désert, culture, aventure et gastronomie. Filtrez par région, catégorie et prix.",
  alternates: { canonical: "/activities" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Positionne les activités dans la carte stylisée d'après leurs lat/lng réelles. */
function mapPins(activities: Activity[]) {
  const located = activities.filter((a) => a.latitude != null && a.longitude != null);
  if (located.length === 0) return [];
  const lats = located.map((a) => a.latitude as number);
  const lngs = located.map((a) => a.longitude as number);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const norm = (v: number, min: number, max: number) =>
    max === min ? 50 : 8 + ((v - min) / (max - min)) * 84; // marge 8-92 %
  return located.map((a) => ({
    activity: a,
    left: norm(a.longitude as number, minLng, maxLng),
    top: 100 - norm(a.latitude as number, minLat, maxLat), // nord en haut
  }));
}

/** Catalogue — rendu côté serveur pour chaque combinaison de filtres (SEO). */
export default async function ActivitiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = first(params.search) ?? "";
  const catParam = first(params.cat);
  const sort = first(params.sort) ?? "pop";
  const view = first(params.view) === "map" ? "map" : "grid";

  const [data, categories] = await Promise.all([
    fetchActivities({
      search: search || undefined,
      category_id: catParam ? Number(catParam) : undefined,
    }),
    fetchCategories(),
  ]);

  const items = [...data.items];
  if (sort === "asc") items.sort((a, b) => a.prix - b.prix);
  else if (sort === "desc") items.sort((a, b) => b.prix - a.prix);

  const stats = await fetchReviewStats(items.map((a) => a.id));

  const pins = view === "map" ? mapPins(items) : [];
  const resultLabel =
    items.length === 1 ? "1 expérience à réserver" : `${items.length} expériences à réserver`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">{fr.nav.activities}</h1>
          <p className="mt-2 text-muted-foreground">{resultLabel}</p>
        </div>
        <Suspense fallback={null}>
          <CatalogControls categories={categories} />
        </Suspense>
      </div>

      {view === "grid" ? (
        items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-input bg-card px-5 py-16 text-center">
            <div className="font-display mb-2 text-2xl">{fr.catalog.emptyTitle}</div>
            <div className="mb-5 text-muted-foreground">{fr.catalog.emptySub}</div>
            <Link
              href="/activities"
              className="inline-block rounded-full bg-ink px-6 py-2.5 font-semibold text-background hover:bg-accent"
            >
              {fr.catalog.reset}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {items.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} rating={stats[String(activity.id)]} />
            ))}
          </div>
        )
      ) : (
        <div className="relative h-[560px] overflow-hidden rounded-3xl border border-border bg-[linear-gradient(115deg,#BFDEDC_0%,#D8E6DA_30%,#EBDFC4_62%,#E3C795_100%)]">
          <div className="absolute bottom-4 start-4 z-10 rounded-xl bg-card/90 px-4 py-2.5 text-[13px] text-foreground/70 shadow-md">
            {fr.catalog.mapHint}
          </div>
          {pins.map(({ activity, left, top }) => (
            <Link
              key={activity.id}
              href={`/activities/${activity.id}`}
              style={{ left: `${left}%`, top: `${top}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-input bg-card px-3.5 py-2 text-[13px] shadow-[0_6px_16px_rgba(28,54,65,.18)] transition-transform hover:z-10 hover:scale-110"
            >
              <span className="font-bold">{formatPrice(activity.prix)}</span>
              <span className="opacity-80"> · {activity.localisation}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import fr from "@touribook/i18n/locales/fr/common.json";

import { ActivityImage } from "@/components/activities/ActivityImage";
import { BookingCard } from "@/components/activities/BookingCard";
import { FavoriteButton } from "@/components/activities/FavoriteButton";
import { formatDuration } from "@/features/catalog/format";
import { fetchActivities, fetchActivity, fetchReviewStats } from "@/lib/server-api";
import { SITE_URL } from "@/lib/site";

type Params = Promise<{ id: string }>;

/** Pré-génère les pages détail connues au build (ISR ensuite). */
export async function generateStaticParams() {
  const data = await fetchActivities({ size: 50 });
  return data.items.map((a) => ({ id: String(a.id) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const activity = await fetchActivity(Number(id));
  if (!activity) return { title: "Activité introuvable" };

  const description = activity.description.slice(0, 160);
  return {
    title: activity.titre,
    description,
    alternates: { canonical: `/activities/${activity.id}` },
    openGraph: {
      title: activity.titre,
      description,
      type: "article",
      url: `${SITE_URL}/activities/${activity.id}`,
    },
  };
}

/** Page détail — rendue côté serveur (SEO + JSON-LD) ; réservation = îlot client. */
export default async function ActivityDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const activityId = Number(id);
  if (!Number.isFinite(activityId)) notFound();

  const activity = await fetchActivity(activityId);
  if (!activity) notFound();

  const stats = (await fetchReviewStats([activityId]))[String(activityId)];

  // Données structurées schema.org (produit touristique)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: activity.titre,
    description: activity.description,
    url: `${SITE_URL}/activities/${activity.id}`,
    ...(activity.latitude != null && activity.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: activity.latitude,
            longitude: activity.longitude,
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: activity.localisation,
      addressCountry: "TN",
    },
    offers: {
      "@type": "Offer",
      price: activity.prix,
      priceCurrency: "TND",
      availability: "https://schema.org/InStock",
    },
    ...(stats && stats.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: stats.average,
            reviewCount: stats.count,
          },
        }
      : {}),
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-9 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/activities"
        className="mb-5 inline-block text-sm font-semibold text-primary hover:text-accent"
      >
        ← {fr.detail.back}
      </Link>

      {/* Image principale */}
      <div className="relative h-72 overflow-hidden rounded-3xl sm:h-96">
        <ActivityImage src={activity.photos} label={`Photo — ${activity.localisation}`} />
        <FavoriteButton activityId={activity.id} size="lg" />
      </div>

      <div className="mt-8 grid items-start gap-9 lg:grid-cols-[1fr_380px]">
        {/* Contenu indexable */}
        <article>
          {activity.category && (
            <span className="rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-semibold text-primary">
              {activity.category.nom}
            </span>
          )}
          <h1 className="font-display mb-2.5 mt-4 text-3xl leading-tight sm:text-4xl">
            {activity.titre}
          </h1>
          <div className="mb-2 text-[15px] text-muted-foreground">
            {activity.localisation} · {formatDuration(activity.duree)}
          </div>
          {stats && stats.count > 0 && (
            <div className="mb-6 text-[15px]">
              <span className="text-gold">★</span> <b>{stats.average.toFixed(1)}</b> ·{" "}
              {stats.count} avis
            </div>
          )}
          <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
            {activity.description}
          </p>
        </article>

        <BookingCard activityId={activity.id} prix={activity.prix} />
      </div>
    </main>
  );
}

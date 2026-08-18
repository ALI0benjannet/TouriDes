import Link from "next/link";

import { ActivityImage } from "@/components/activities/ActivityImage";
import { FavoriteButton } from "@/components/activities/FavoriteButton";
import type { Activity } from "@/features/catalog/api";
import { formatDuration, formatPrice } from "@/features/catalog/format";

type Labels = { book: string; perPerson: string; category?: string };

export type Rating = { average: number; count: number };

const FR: Labels = { book: "Réserver", perPerson: "/ pers." };

/**
 * Carte activité — composant partagé (sans hook) : rendu côté serveur pour le
 * SEO, réutilisable dans les pages client. Le cœur favori est un îlot client.
 */
export function ActivityCard({
  activity,
  lang = "fr",
  labels = FR,
  rating,
}: {
  activity: Activity;
  lang?: string;
  labels?: Labels;
  rating?: Rating;
}) {
  const detailPath = `/activities/${activity.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(28,54,65,0.13)]">
      <div className="relative h-44">
        <ActivityImage src={activity.photos} label={`Photo — ${activity.localisation}`} />
        <FavoriteButton activityId={activity.id} />
        {activity.category && (
          <span className="absolute bottom-3 start-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
            {labels.category ?? activity.category.nom}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Link
          href={detailPath}
          className="font-display text-lg leading-snug text-foreground transition-colors hover:text-accent"
        >
          {activity.titre}
        </Link>
        <div className="text-[13px] text-muted-foreground">
          {activity.localisation} · {formatDuration(activity.duree, lang)}
        </div>
        {rating && rating.count > 0 && (
          <div className="text-[13px] text-foreground/75">
            <span className="text-gold">★</span> <b>{rating.average.toFixed(1)}</b> ({rating.count})
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold">{formatPrice(activity.prix)}</span>
            <span className="text-xs text-muted-foreground"> {labels.perPerson}</span>
          </div>
          <Link
            href={detailPath}
            className="rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-background transition-colors hover:bg-accent"
          >
            {labels.book}
          </Link>
        </div>
      </div>
    </article>
  );
}

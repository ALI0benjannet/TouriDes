import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import { useAuth } from "@touribook/auth/hooks/use-auth";

import { ActivityCard } from "@/components/activities/ActivityCard";
import { useActivities } from "@/features/catalog/hooks";
import { useFavorites } from "@/features/favorites/hooks";
import { paths } from "@/routes/paths";

export default function FavoritesPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: favorites, isLoading } = useFavorites();
  // Les favoris renvoient id+titre+prix ; on résout les cartes complètes via le catalogue
  const { data: catalog } = useActivities({ size: 50 });

  const favoriteIds = new Set((favorites ?? []).map((f) => f.activity_id));
  const items = (catalog?.items ?? []).filter((a) => favoriteIds.has(a.id));

  const empty = (title: string, subtitle: string, cta: string, to: string) => (
    <div className="rounded-2xl border border-dashed border-input bg-card px-5 py-20 text-center">
      <Heart className="mx-auto mb-3 size-10 text-accent/35" />
      <div className="font-display mb-2 text-2xl">{title}</div>
      <div className="mb-6 text-muted-foreground">{subtitle}</div>
      <Link
        href={to}
        className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        {cta}
      </Link>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <h1 className="font-display mb-2 text-4xl">{t("nav.favorites")}</h1>
      <p className="mb-8 text-muted-foreground">{t("favorites.subtitle")}</p>

      {!isAuthenticated ? (
        empty(
          t("favorites.loginTitle"),
          t("favorites.loginSub"),
          t("nav.login"),
          paths.login,
        )
      ) : isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        empty(
          t("favorites.emptyTitle"),
          t("favorites.emptySub"),
          t("favorites.cta"),
          paths.activities,
        )
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {items.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              lang={i18n.resolvedLanguage}
              labels={{
                book: t("catalog.book"),
                perPerson: t("catalog.perPerson"),
                category: activity.category
                  ? t(`catalog.categories.${activity.category.nom}`, activity.category.nom)
                  : undefined,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

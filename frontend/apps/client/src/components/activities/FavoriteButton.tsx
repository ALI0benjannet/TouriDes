"use client";

import { Heart } from "lucide-react";

import { cn } from "@touribook/ui/lib/utils";

import { useToggleFavorite } from "@/features/favorites/hooks";

/** Îlot client : cœur favori posé sur les cartes/pages rendues côté serveur. */
export function FavoriteButton({
  activityId,
  size = "sm",
}: {
  activityId: number;
  size?: "sm" | "lg";
}) {
  const { isFavorite, toggle } = useToggleFavorite();
  const fav = isFavorite(activityId);

  return (
    <button
      type="button"
      aria-label="Favori"
      aria-pressed={fav}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(activityId);
      }}
      className={cn(
        "absolute end-3 top-3 flex items-center justify-center rounded-full bg-card/95 shadow-md transition-transform hover:scale-105",
        size === "lg" ? "size-11" : "size-9",
        fav ? "text-accent" : "text-foreground/30",
      )}
    >
      <Heart className={size === "lg" ? "size-5" : "size-4"} fill={fav ? "currentColor" : "none"} />
    </button>
  );
}

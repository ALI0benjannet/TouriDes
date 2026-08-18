"use client";

import { CalendarCheck, Heart, LogIn, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SUPPORTED_LANGUAGES, type Language } from "@touribook/i18n";
import { cn } from "@touribook/ui/lib/utils";
import { useAuth } from "@touribook/auth/hooks/use-auth";

import { UserMenu } from "./UserMenu";
import { useCategories } from "@/features/catalog/hooks";
import { useFavorites } from "@/features/favorites/hooks";
import { useMyBookings } from "@/features/bookings/hooks";
import { paths } from "@/routes/paths";

function Badge({ count, tone }: { count: number; tone: "accent" | "primary" }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "absolute -top-1.5 start-full -translate-x-1 rounded-full px-1.5 text-[10px] font-bold text-white",
        tone === "accent" ? "bg-accent" : "bg-primary",
      )}
    >
      {count}
    </span>
  );
}

function IconTab({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 text-foreground transition-colors hover:text-accent"
    >
      <span className="relative leading-none">
        {icon}
        {badge}
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: categories } = useCategories();
  const { data: favorites } = useFavorites();
  const { data: bookings } = useMyBookings();

  const currentLang = (i18n.resolvedLanguage ?? "fr") as Language;
  const activeCat = searchParams?.get("cat");

  const tabClass = (active: boolean) =>
    cn(
      "shrink-0 border-b-[3px] px-3.5 pb-3 pt-2.5 text-sm font-semibold transition-colors",
      active
        ? "border-accent text-accent"
        : "border-transparent text-foreground/75 hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      {/* Rangée 1 : logo + favoris/réservations/langues/profil */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pb-1 pt-3 sm:px-8">
        <Link href={paths.home} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="TouriBook" className="size-10 object-contain" />
          <span className="font-display text-[22px] tracking-wide">TouriBook</span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          <IconTab
            href={paths.favorites}
            icon={<Heart className="size-[19px]" />}
            label={t("nav.favorites")}
            badge={<Badge count={favorites?.length ?? 0} tone="accent" />}
          />
          <IconTab
            href={paths.bookings}
            icon={<CalendarCheck className="size-[18px]" />}
            label={t("nav.bookings")}
            badge={<Badge count={bookings?.total ?? 0} tone="primary" />}
          />

          {/* Sélecteur de langue en pilules (design) */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex overflow-hidden rounded-full border border-input">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => i18n.changeLanguage(lang)}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-semibold uppercase transition-colors",
                    currentLang === lang
                      ? "bg-ink text-background"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-foreground/55">
              {currentLang.toUpperCase()} / DT
            </span>
          </div>

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <button
              type="button"
              onClick={() => router.push(paths.login)}
              className="flex flex-col items-center gap-0.5 text-foreground transition-colors hover:text-accent"
            >
              <span className="flex size-[26px] items-center justify-center rounded-full bg-gradient-to-br from-gold to-accent text-white">
                <LogIn className="size-3.5" />
              </span>
              <span className="text-xs font-semibold">{t("nav.login")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Rangée 2 : Accueil / Activités / catégories */}
      <nav className="mx-auto flex max-w-7xl gap-0.5 overflow-x-auto px-3 sm:px-6">
        <Link href={paths.home} className={tabClass(pathname === "/")}>
          {t("nav.home")}
        </Link>
        <Link
          href={paths.activities}
          className={tabClass(pathname === paths.activities && !activeCat)}
        >
          {t("nav.activities")}
        </Link>
        {(categories ?? []).map((cat) => (
          <Link
            key={cat.id}
            href={`${paths.activities}?cat=${cat.id}`}
            className={tabClass(pathname === paths.activities && activeCat === String(cat.id))}
          >
            {t(`catalog.categories.${cat.nom}`, cat.nom)}
          </Link>
        ))}
        {isAuthenticated && (
          <Link
            href={paths.profile}
            className={cn(tabClass(pathname === paths.profile), "ms-auto hidden sm:block")}
          >
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5" />
              {t("nav.profile")}
            </span>
          </Link>
        )}
      </nav>
    </header>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import fr from "@touribook/i18n/locales/fr/common.json";

import { ActivityCard } from "@/components/activities/ActivityCard";
import { HeroSearch } from "@/components/home/HeroSearch";
import { fetchActivities, fetchReviewStats } from "@/lib/server-api";
import { paths } from "@/routes/paths";

import couverture from "@/assets/couv.png";
import djerba from "@/assets/Djerba.png";
import tabarka from "@/assets/Tbarka.png";
import tozeur from "@/assets/Touzeur&ledesert.png";
import tunis from "@/assets/Tunis&Carthage.png";

export const metadata: Metadata = {
  description: fr.home.heroSub,
  alternates: { canonical: "/" },
};

/* Régions mises en avant (design) — mènent au catalogue filtré */
const DESTINATIONS = [
  {
    name: "Tunis & Carthage",
    q: "Tunis",
    tag: fr.home.destTags.tunis,
    image: tunis,
  },
  {
    name: "Djerba",
    q: "Djerba",
    tag: fr.home.destTags.djerba,
    image: djerba,
  },
  {
    name: "Tozeur & le désert",
    q: "Tozeur",
    tag: fr.home.destTags.tozeur,
    image: tozeur,
  },
  {
    name: "Tabarka",
    q: "Tabarka",
    tag: fr.home.destTags.tabarka,
    image: tabarka,
  },
] as const;

const VALUES = [
  fr.home.values.cancel,
  fr.home.values.guides,
  fr.home.values.payment,
];

/** Page d'accueil — rendue côté serveur (SEO) ; recherche et cœurs = îlots client. */
export default async function HomePage() {
  const popular = await fetchActivities({ size: 4 });
  const stats = await fetchReviewStats(
    popular.items.map((a) => a.id),
  );

  return (
    <div>
      {/* ---- Hero + recherche ---- */}
      <section className="relative overflow-hidden">
        <Image
          src={couverture}
          alt="Couverture - Méditerranée"
          priority
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="animate-fade-up relative mx-auto max-w-7xl px-4 pb-24 pt-16 text-center sm:px-8">
          <span className="inline-block rounded-full border border-blue-100 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wider text-blue-100">
            {fr.home.heroKicker}
          </span>

          <h1 className="font-display mx-auto mb-8 mt-7 w-full text-center text-4xl leading-[1.08] text-white sm:whitespace-nowrap sm:text-7xl">
            {fr.home.heroTitle}
          </h1>

          <p className="jost mx-auto mb-10 w-full text-center text-lg font-normal leading-relaxed tracking-wide text-white/90 sm:whitespace-nowrap">
            {fr.home.heroSub}
          </p>

          <HeroSearch />
        </div>
      </section>

      {/* ---- Destinations ---- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-18 sm:px-8">
        <div className="mb-6 text-center">
          <h2 className="font-display text-4xl">
            {fr.home.destTitle}
          </h2>

          <p className="mt-2 text-muted-foreground">
            {fr.home.destSub}
          </p>
        </div>

        <div className="pt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.name}
              href={`${paths.activities}?search=${encodeURIComponent(dest.q)}`}
              className="group relative block h-[360px] overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(25,48,56,0.18)]"
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#1d3a3d]/75 via-[#1d3a3d]/15 to-transparent" />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-5 pt-10 text-white">
                <div className="font-display text-3xl leading-tight">
                  {dest.name}
                </div>

                <div className="mt-1 text-base text-white/85">
                  {dest.tag}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Activités populaires ---- */}
      <section className="mx-auto max-w-7xl px-4 pb-5 pt-14 sm:px-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div>
            <h2 className="font-display text-4xl">
              {fr.home.popTitle}
            </h2>

            <p className="mt-2 text-muted-foreground">
              {fr.home.popSub}
            </p>
          </div>

          <Link
            href={paths.activities}
            className="mt-4 rounded-full border border-input px-5 py-2 text-sm font-semibold transition-colors hover:border-blue-600 hover:text-blue-600"
          >
            {fr.home.seeAll}
          </Link>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {popular.items.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              rating={stats[String(activity.id)]}
            />
          ))}
        </div>
      </section>

      {/* ---- Arguments ---- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <div className="font-display mb-2 text-lg text-primary">
                {value.title}
              </div>

              <div className="text-sm leading-relaxed text-foreground/70">
                {value.body}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
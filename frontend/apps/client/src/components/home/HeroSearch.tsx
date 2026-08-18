"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { paths } from "@/routes/paths";

/** Barre de recherche du hero — îlot client de la page d'accueil (serveur). */
export function HeroSearch() {
  const { t } = useTranslation();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    router.push(`${paths.activities}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className="mx-auto flex max-w-3xl items-stretch gap-1 rounded-3xl border border-border bg-card p-2 text-start shadow-[0_18px_44px_rgba(28,54,65,.14)] sm:rounded-full"
    >
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("home.searchPh")}
        className="min-w-0 flex-[2] bg-transparent px-5 py-3.5 text-base text-foreground placeholder:text-foreground/40"
      />
      <div className="my-2 hidden w-px bg-border sm:block" />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label={t("detail.dateL")}
        className="hidden min-w-0 flex-1 bg-transparent px-3 py-3.5 text-[15px] text-foreground md:block"
      />
      <div className="my-2 hidden w-px bg-border md:block" />
      <select
        value={guests}
        onChange={(e) => setGuests(Number(e.target.value))}
        aria-label={t("detail.guestsL")}
        className="hidden min-w-0 flex-1 bg-transparent px-2 py-3.5 text-[15px] text-foreground sm:block"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <option key={n} value={n}>
            {t("home.guests", { count: n })}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-full bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-hover sm:px-8"
      >
        {t("actions.search")}
      </button>
    </form>
  );
}

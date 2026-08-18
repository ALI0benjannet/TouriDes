"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { cn } from "@touribook/ui/lib/utils";

import type { Category } from "@/features/catalog/api";

/** Contrôles du catalogue (recherche, catégories, tri, vue) — écrivent dans
 *  l'URL ; la liste elle-même est re-rendue côté serveur à chaque changement. */
export function CatalogControls({ categories }: { categories: Category[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams?.get("search") ?? "";
  const cat = searchParams?.get("cat");
  const sort = searchParams?.get("sort") ?? "pop";
  const view = searchParams?.get("view") ?? "grid";

  const [searchInput, setSearchInput] = useState(search);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setSearchInput(search), [search]);

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams?.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setParams({ search: value || null }), 350);
  };

  const segClass = (active: boolean) =>
    cn(
      "px-4 py-2 text-[13px] font-semibold transition-colors",
      active ? "bg-ink text-background" : "bg-card text-muted-foreground hover:text-foreground",
    );

  const chipClass = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
      active
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-input bg-card text-foreground/75 hover:border-blue-600 hover:text-blue-600",
    );

  return (
    <>
      <div className="flex items-center gap-2.5">
        <select
          value={sort}
          onChange={(e) => setParams({ sort: e.target.value === "pop" ? null : e.target.value })}
          aria-label={t("catalog.sortPop")}
          className="rounded-full border border-input bg-card px-4 py-2 text-sm"
        >
          <option value="pop">{t("catalog.sortPop")}</option>
          <option value="asc">{t("catalog.sortAsc")}</option>
          <option value="desc">{t("catalog.sortDesc")}</option>
        </select>
        <div className="flex overflow-hidden rounded-full border border-input">
          <button type="button" onClick={() => setParams({ view: null })} className={segClass(view === "grid")}>
            {t("catalog.viewGrid")}
          </button>
          <button type="button" onClick={() => setParams({ view: "map" })} className={segClass(view === "map")}>
            {t("catalog.viewMap")}
          </button>
        </div>
      </div>

      <div className="my-6 flex w-full flex-wrap items-center gap-3">
        <input
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("home.searchPh")}
          className="min-w-60 flex-1 rounded-full border border-input bg-card px-5 py-2.5 text-[15px] placeholder:text-foreground/40"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setParams({ cat: null })} className={chipClass(!cat)}>
            {t("catalog.allCategories")}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setParams({ cat: String(category.id) })}
              className={chipClass(cat === String(category.id))}
            >
              {t(`catalog.categories.${category.nom}`, category.nom)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

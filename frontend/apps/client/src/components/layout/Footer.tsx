"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";

import { env } from "@touribook/api/env";

import { paths } from "@/routes/paths";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <div className="mb-2.5 font-display text-2xl text-background">TouriBook</div>
          <p className="max-w-xs text-sm leading-relaxed text-ink-foreground/70">
            {t("app.tagline")}
          </p>
        </div>
        <div>
          <div className="mb-3.5 text-[13px] font-bold uppercase tracking-widest text-gold">
            {t("footer.discover")}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href={paths.activities} className="text-ink-foreground/80 hover:text-gold">
              {t("nav.activities")}
            </Link>
            <Link href={paths.favorites} className="text-ink-foreground/80 hover:text-gold">
              {t("nav.favorites")}
            </Link>
            <Link href={paths.bookings} className="text-ink-foreground/80 hover:text-gold">
              {t("nav.bookings")}
            </Link>
          </div>
        </div>
        <div>
          <div className="mb-3.5 text-[13px] font-bold uppercase tracking-widest text-gold">
            {t("footer.help")}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a href="#" className="text-ink-foreground/80 hover:text-gold">
              Contact
            </a>
            <a href="#" className="text-ink-foreground/80 hover:text-gold">
              FAQ
            </a>
            <Link href="/privacy" className="text-ink-foreground/80 hover:text-gold">
              {t("footer.privacy", "Confidentialité")}
            </Link>
            <a href={env.VITE_ADMIN_URL} className="text-ink-foreground/80 hover:text-gold">
              {t("footer.admin")}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <div className="mx-auto max-w-7xl px-4 py-4 text-[13px] text-ink-foreground/50 sm:px-8">
          © {new Date().getFullYear()} TouriBook
        </div>
      </div>
    </footer>
  );
}

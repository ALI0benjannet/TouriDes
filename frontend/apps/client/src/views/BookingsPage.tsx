import { CalendarCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import { useAuth } from "@touribook/auth/hooks/use-auth";
import { cn } from "@touribook/ui/lib/utils";

import { ActivityImage } from "@/components/activities/ActivityImage";
import { formatPrice } from "@/features/catalog/format";
import { useCancelBooking, useMyBookings, type BookingItem } from "@/features/bookings/hooks";
import { paths } from "@/routes/paths";

const STATUS_STYLES: Record<BookingItem["statut"], string> = {
  confirmed: "bg-primary/12 text-primary",
  pending: "bg-gold/20 text-[#9A6E14]",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function BookingsPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useMyBookings();
  const cancelBooking = useCancelBooking();

  const bookings = data?.items ?? [];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(
      i18n.resolvedLanguage === "en" ? "en-GB" : i18n.resolvedLanguage === "ar" ? "ar-TN" : "fr-FR",
      { day: "numeric", month: "short", year: "numeric" },
    );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <h1 className="font-display mb-2 text-4xl">{t("nav.bookings")}</h1>
      <p className="mb-8 text-muted-foreground">{t("bookingsPage.subtitle")}</p>

      {!isAuthenticated ? (
        <div className="rounded-2xl border border-dashed border-input bg-card px-5 py-20 text-center">
          <CalendarCheck className="mx-auto mb-3 size-10 text-primary/40" />
          <div className="font-display mb-2 text-2xl">{t("bookingsPage.loginTitle")}</div>
          <div className="mb-6 text-muted-foreground">{t("bookingsPage.loginSub")}</div>
          <Link
            href={paths.login}
            className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {t("nav.login")}
          </Link>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-input bg-card px-5 py-20 text-center">
          <div className="font-display mb-2 text-2xl">{t("bookingsPage.emptyTitle")}</div>
          <div className="mb-6 text-muted-foreground">{t("bookingsPage.emptySub")}</div>
          <Link
            href={paths.activities}
            className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {t("favorites.cta")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-[0_10px_26px_rgba(28,54,65,.1)]"
            >
              <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl sm:block">
                <ActivityImage label="Photo" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/activities/${booking.activity_id}`}
                  className="font-display text-lg hover:text-blue-600"
                >
                  {booking.activity ?? `#${booking.activity_id}`}
                </Link>
                <div className="mt-1 text-[13px] text-muted-foreground">
                  {formatDate(booking.date_reservation)} ·{" "}
                  {t("bookingsPage.guests", { count: booking.nb_places })}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    STATUS_STYLES[booking.statut],
                  )}
                >
                  {t(`bookingsPage.status.${booking.statut}`)}
                </span>
                <span className="text-lg font-bold">{formatPrice(booking.montant_total)}</span>
                {booking.statut === "pending" && (
                  <Link
                    href={`/bookings/${booking.id}/pay`}
                    className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    {t("payment.payNow", "Payer maintenant")}
                  </Link>
                )}
                {booking.statut === "confirmed" && (
                  <Link
                    href={`/bookings/${booking.id}/pay`}
                    className="rounded-full border border-primary px-4 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    {t("payment.showQr", "QR code")}
                  </Link>
                )}
                {booking.statut !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => cancelBooking.mutate(booking.id)}
                    disabled={cancelBooking.isPending}
                    className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-destructive hover:underline disabled:opacity-50"
                  >
                    {t("actions.cancel")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

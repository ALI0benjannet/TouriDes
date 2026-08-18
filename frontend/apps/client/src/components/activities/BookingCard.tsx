"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { api, getAuthErrorCode, toApiError } from "@touribook/api";
import { endpoints } from "@touribook/api/endpoints";
import { useAuth } from "@touribook/auth/hooks/use-auth";

import { formatPrice } from "@/features/catalog/format";
import { useAvailabilities } from "@/features/catalog/hooks";
import { useCreateBooking } from "@/features/bookings/hooks";
import { paths } from "@/routes/paths";

/** Carte de réservation (page détail) — créneaux réels + voyageurs + saga booking. */
export function BookingCard({ activityId, prix }: { activityId: number; prix: number }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: availabilities } = useAvailabilities(activityId);
  const createBooking = useCreateBooking();

  const [availabilityId, setAvailabilityId] = useState<number | null>(null);
  const [guests, setGuests] = useState(2);
  const [bookedId, setBookedId] = useState<number | null>(null);
  const booked = bookedId != null;
  const setBooked = (v: boolean) => setBookedId(v ? bookedId : null);
  const [error, setError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; reduction: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoChecking(true);
    setPromoError(null);
    try {
      const { data } = await api.post<{ code: string; reduction: number }>(
        endpoints.bookings.validatePromo,
        { code },
      );
      setPromo({ code: data.code, reduction: data.reduction });
    } catch {
      setPromo(null);
      setPromoError(t("detail.promoInvalid", "Code promo invalide ou expiré."));
    } finally {
      setPromoChecking(false);
    }
  };

  const openSlots = useMemo(
    () => (availabilities ?? []).filter((slot) => slot.places_disponibles > 0),
    [availabilities],
  );
  const selectedSlot =
    openSlots.find((slot) => slot.id === availabilityId) ?? openSlots[0] ?? null;

  const formatSlot = (date: string, seats: number) => {
    const label = new Date(`${date}T12:00:00`).toLocaleDateString(
      i18n.resolvedLanguage === "en" ? "en-GB" : i18n.resolvedLanguage === "ar" ? "ar-TN" : "fr-FR",
      { weekday: "short", day: "numeric", month: "short" },
    );
    return `${label} · ${t("detail.seatsLeft", { count: seats })}`;
  };

  const baseTotal = prix * guests;
  const total = promo ? Math.round(baseTotal * (1 - promo.reduction / 100) * 100) / 100 : baseTotal;

  const confirm = async () => {
    if (!isAuthenticated) {
      router.push(`${paths.login}?next=${encodeURIComponent(`/activities/${activityId}`)}`);
      return;
    }
    if (!selectedSlot) return;
    setError(null);
    try {
      const created = await createBooking.mutateAsync({
        activity_id: activityId,
        availability_id: selectedSlot.id,
        guests,
        ...(promo ? { promo_code: promo.code } : {}),
      });
      setBookedId(created.id);
    } catch (err) {
      const code = getAuthErrorCode(err);
      const { status } = toApiError(err);
      if (status === 409) setError(t("detail.noSeats"));
      else if (code === "rate_limited") setError(t("auth.errors.rate_limited"));
      else setError(t("errors.unknown"));
    }
  };

  return (
    <aside className="rounded-3xl border border-border bg-card p-6 shadow-[0_14px_36px_rgba(28,54,65,.1)] lg:sticky lg:top-32">
      <div className="mb-5 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold">{formatPrice(prix)}</span>
        <span className="text-sm text-muted-foreground">{t("catalog.perPerson")}</span>
      </div>

      <label className="mb-1.5 block text-[13px] font-semibold">{t("detail.dateL")}</label>
      {openSlots.length === 0 ? (
        <div className="mb-4 rounded-xl border border-dashed border-input px-4 py-3 text-sm text-muted-foreground">
          {t("detail.noAvailability")}
        </div>
      ) : (
        <select
          value={selectedSlot?.id ?? ""}
          onChange={(e) => setAvailabilityId(Number(e.target.value))}
          className="mb-4 w-full rounded-xl border border-input bg-white px-3.5 py-3 text-[15px] dark:bg-muted"
        >
          {openSlots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {formatSlot(slot.date, slot.places_disponibles)}
            </option>
          ))}
        </select>
      )}

      <label className="mb-1.5 block text-[13px] font-semibold">{t("detail.guestsL")}</label>
      <div className="mb-5 flex items-center gap-3.5 rounded-xl border border-input px-3 py-2">
        <button
          type="button"
          aria-label="-"
          onClick={() => {
            setGuests((g) => Math.max(1, g - 1));
            setBooked(false);
          }}
          className="flex size-8 items-center justify-center rounded-full border border-input bg-white hover:border-accent hover:text-accent dark:bg-muted"
        >
          <Minus className="size-4" />
        </button>
        <span className="flex-1 text-center text-lg font-bold">{guests}</span>
        <button
          type="button"
          aria-label="+"
          onClick={() => {
            setGuests((g) => Math.min(8, selectedSlot?.places_disponibles ?? 8, g + 1));
            setBooked(false);
          }}
          className="flex size-8 items-center justify-center rounded-full border border-input bg-white hover:border-accent hover:text-accent dark:bg-muted"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <label className="mb-1.5 block text-[13px] font-semibold">
        {t("detail.promoLabel", "Code promo")}
      </label>
      <div className="mb-1 flex gap-2">
        <input
          value={promoInput}
          onChange={(e) => {
            setPromoInput(e.target.value);
            setPromo(null);
            setPromoError(null);
          }}
          placeholder="BIENVENUE10"
          className="min-w-0 flex-1 rounded-xl border border-input bg-white px-3.5 py-2.5 text-[14px] uppercase placeholder:normal-case placeholder:text-foreground/30 dark:bg-muted"
        />
        <button
          type="button"
          onClick={applyPromo}
          disabled={promoChecking || !promoInput.trim()}
          className="rounded-xl border border-input px-4 text-[13px] font-semibold hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {t("detail.promoApply", "Appliquer")}
        </button>
      </div>
      {promoError && <p className="mb-2 text-[13px] font-medium text-destructive">{promoError}</p>}
      {promo && (
        <p className="mb-2 text-[13px] font-semibold text-primary">
          {t("detail.promoApplied", "Code {{code}} appliqué : -{{reduction}} %", {
            code: promo.code,
            reduction: promo.reduction,
          })}
        </p>
      )}

      <div className="mb-4 flex justify-between border-t border-border py-3.5">
        <span className="font-semibold">{t("detail.total")}</span>
        <span className="text-end">
          {promo && (
            <span className="me-2 text-sm text-muted-foreground line-through">
              {formatPrice(baseTotal)}
            </span>
          )}
          <span className="text-lg font-bold">{formatPrice(total)}</span>
        </span>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {booked ? (
        <>
          <div className="mb-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3.5 text-center font-semibold text-primary">
            {t("detail.bookedPayMsg", "Réservation enregistrée — payez pour la confirmer")}
          </div>
          <Link
            href={`/bookings/${bookedId}/pay`}
            className="mb-2 block w-full rounded-full bg-accent py-3.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            {t("payment.payNow", "Payer maintenant")}
          </Link>
          <Link
            href={paths.bookings}
            className="block w-full rounded-full border border-input py-3 text-center text-[14px] font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            {t("detail.seeBookings")}
          </Link>
        </>
      ) : (
        <button
          type="button"
          onClick={confirm}
          disabled={createBooking.isPending || openSlots.length === 0}
          className="w-full rounded-full bg-accent py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {createBooking.isPending
            ? t("states.loading")
            : isAuthenticated
              ? t("detail.confirm")
              : t("detail.loginToBook")}
        </button>
      )}
      <div className="mt-3.5 text-center text-[13px] text-muted-foreground">
        {t("detail.freeCancel")}
      </div>
    </aside>
  );
}

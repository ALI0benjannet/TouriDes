"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { CalendarCheck, CreditCard, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { api } from "@touribook/api/axios";
import { endpoints } from "@touribook/api/endpoints";
import { useAuth } from "@touribook/auth/hooks/use-auth";
import { FullPageLoader } from "@touribook/ui/components/feedback/FullPageLoader";

import { formatPrice } from "@/features/catalog/format";
import { useBooking, useBookingQr } from "@/features/bookings/hooks";
import { paths } from "@/routes/paths";

type IntentResponse =
  | { mode: "mock"; payment_id: number; amount: number }
  | {
      mode: "stripe";
      payment_id: number;
      client_secret: string;
      publishable_key: string;
      amount: number;
    };

/* ---------- Écran de succès : récapitulatif + QR code ---------- */

function SuccessView({ bookingId }: { bookingId: number }) {
  const { t } = useTranslation();
  const { data: booking } = useBooking(bookingId);
  const { data: qrSvg } = useBookingQr(bookingId, booking?.statut === "confirmed");

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="size-7" />
      </div>
      <h1 className="font-display mb-2 text-3xl">
        {t("payment.successTitle", "Réservation confirmée !")}
      </h1>
      <p className="mb-6 text-muted-foreground">
        {t(
          "payment.successSub",
          "Un e-mail de confirmation vous a été envoyé. Présentez ce QR code le jour de l'activité.",
        )}
      </p>

      {booking && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 text-start">
          <div className="font-display text-lg">{booking.activity ?? `#${booking.activity_id}`}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {t("bookingsPage.guests", { count: booking.nb_places })} ·{" "}
            <b className="text-foreground">{formatPrice(booking.montant_total)}</b>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {t("payment.reference", "Référence")} : {booking.qr_code}
          </div>
        </div>
      )}

      {qrSvg && (
        <div
          className="mx-auto mb-6 w-52 rounded-2xl border border-border bg-white p-4 [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      )}

      <Link
        href={paths.bookings}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-background transition-colors hover:bg-blue-600"
      >
        <CalendarCheck className="size-4" />
        {t("detail.seeBookings")}
      </Link>
    </div>
  );
}

/* ---------- Formulaire Stripe (mode réel) ---------- */

function StripeForm({ bookingId, amount }: { bookingId: number; amount: number }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/bookings/${bookingId}/pay` },
    });
    if (stripeError) {
      setError(stripeError.message ?? t("errors.unknown"));
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={pay}
        disabled={submitting || !stripe}
        className="w-full rounded-full bg-blue-600 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting
          ? t("states.loading")
          : t("payment.payBtn", "Payer {{amount}}", { amount: formatPrice(amount) })}
      </button>
    </div>
  );
}

/* ---------- Page ---------- */

export default function PayBookingPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const bookingId = Number(params?.id);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Après un paiement Stripe avec redirection, on revient avec redirect_status
  const [stripeReturned] = useState(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("redirect_status") === "succeeded",
  );

  // Poll tant que le webhook n'a pas confirmé
  const { data: booking, isLoading } = useBooking(bookingId, {
    refetchInterval: stripeReturned ? 2000 : false,
  });

  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Création de l'intention de paiement dès que la réservation est en attente
  useEffect(() => {
    if (!booking || booking.statut !== "pending" || intent || stripeReturned) return;
    api
      .post<IntentResponse>(endpoints.payments.createIntent, { booking_id: bookingId })
      .then((r) => {
        setIntent(r.data);
        if (r.data.mode === "stripe") {
          setStripePromise(loadStripe(r.data.publishable_key));
        }
      })
      .catch(() => setIntentError(t("errors.unknown")));
  }, [booking, bookingId, intent, stripeReturned, t]);

  const simulate = async () => {
    if (!intent || intent.mode !== "mock") return;
    setSimulating(true);
    setIntentError(null);
    try {
      await api.post(endpoints.payments.mockConfirm, { payment_id: intent.payment_id });
      window.location.reload();
    } catch {
      setIntentError(t("errors.unknown"));
      setSimulating(false);
    }
  };

  if (authLoading || isLoading) return <FullPageLoader />;

  if (!isAuthenticated || !booking) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display mb-3 text-2xl">{t("errors.http.404")}</h1>
          <Link href={paths.bookings} className="font-semibold text-primary hover:text-blue-600">
          ← {t("nav.bookings")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
      {booking.statut === "confirmed" ? (
        <SuccessView bookingId={bookingId} />
      ) : booking.statut === "cancelled" ? (
        <div className="text-center">
          <h1 className="font-display mb-3 text-3xl">
            {t("payment.cancelledTitle", "Réservation annulée")}
          </h1>
          <Link href={paths.activities} className="font-semibold text-primary hover:text-blue-600">
            {t("favorites.cta")}
          </Link>
        </div>
      ) : stripeReturned ? (
        <div className="text-center">
          <FullPageLoader />
          <p className="text-muted-foreground">
            {t("payment.confirming", "Paiement reçu — confirmation en cours…")}
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-display mb-2 text-3xl">{t("payment.title", "Paiement")}</h1>
          <p className="mb-8 text-muted-foreground">
            {t("payment.subtitle", "Réglez votre réservation pour la confirmer.")}
          </p>

          {/* Récapitulatif */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-5">
            <div className="font-display text-lg">
              {booking.activity ?? `#${booking.activity_id}`}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                {t("bookingsPage.guests", { count: booking.nb_places })}
              </span>
              <span className="text-2xl font-bold">{formatPrice(booking.montant_total)}</span>
            </div>
          </div>

          {intentError && (
            <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
              {intentError}
            </p>
          )}

          {!intent ? (
            <FullPageLoader />
          ) : intent.mode === "stripe" && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: intent.client_secret, locale: "fr" }}
            >
              <StripeForm bookingId={bookingId} amount={intent.amount} />
            </Elements>
          ) : (
            /* ---- Mode simulation (aucune clé Stripe configurée) ---- */
            <div className="rounded-2xl border border-dashed border-gold bg-gold/10 p-5 text-center">
              <p className="mb-1 text-sm font-bold uppercase tracking-wide text-[#9A6E14]">
                {t("payment.demoBadge", "Mode démonstration")}
              </p>
              <p className="mb-4 text-sm text-foreground/70">
                {t(
                  "payment.demoHint",
                  "Aucune clé Stripe configurée — ce bouton simule un paiement réussi (webhook inclus).",
                )}
              </p>
              <button
                type="button"
                onClick={simulate}
                disabled={simulating}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <CreditCard className="size-4" />
                {simulating
                  ? t("states.loading")
                  : t("payment.simulateBtn", "Simuler le paiement de {{amount}}", {
                      amount: formatPrice(booking.montant_total),
                    })}
              </button>
            </div>
          )}

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            {t("detail.freeCancel")}
          </p>
        </>
      )}
    </main>
  );
}

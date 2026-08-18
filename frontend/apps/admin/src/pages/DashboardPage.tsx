import { AlertCircle, CalendarCheck, MapPin, RefreshCw, Users, Wallet } from "lucide-react";

import { Button } from "@touribook/ui/components/ui/button";
import { useAdminStats } from "@/features/admin/hook/use-admin";
import { formatCurrency, formatDateTime, formatNumber } from "@touribook/ui/lib/format";
import { cn } from "@touribook/ui/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmée",
  pending: "En attente",
  cancelled: "Annulée",
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      {loading ? (
        <div className="mt-2 h-7 w-24 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      )}
      {hint && !loading && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminStats();

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 size-5 text-destructive" />
          <div className="space-y-2">
            <p className="font-medium text-destructive">
              Impossible de charger les statistiques
            </p>
            <p className="text-sm text-muted-foreground">
              {(error as Error)?.message ?? "Erreur inconnue"}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {formatDateTime(data.generated_at)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Réservations"
          icon={CalendarCheck}
          loading={isLoading}
          value={formatNumber(data?.bookings.total ?? 0)}
          hint={`${formatNumber(data?.bookings.last_30_days ?? 0)} sur 30 jours · ${formatNumber(
            data?.bookings.pending ?? 0,
          )} en attente`}
        />
        <StatCard
          label="Chiffre d'affaires"
          icon={Wallet}
          loading={isLoading}
          value={formatCurrency(data?.revenue.total ?? 0)}
          hint={`${formatCurrency(data?.revenue.last_30_days ?? 0)} sur 30 jours · panier moyen ${formatCurrency(
            data?.revenue.average_basket ?? 0,
          )}`}
        />
        <StatCard
          label="Clients"
          icon={Users}
          loading={isLoading}
          value={formatNumber(data?.users.total ?? 0)}
          hint={`${formatNumber(data?.users.active ?? 0)} actifs · ${formatNumber(
            data?.users.new_30_days ?? 0,
          )} nouveaux`}
        />
        <StatCard
          label="Activités"
          icon={MapPin}
          loading={isLoading}
          value={formatNumber(data?.activities.total ?? 0)}
          hint={`${formatNumber(data?.activities.categories ?? 0)} catégories · ${formatNumber(
            data?.activities.upcoming_availabilities ?? 0,
          )} créneaux à venir`}
        />
      </div>

      <section className="rounded-lg border bg-card">
        <header className="border-b px-4 py-3">
          <h2 className="font-semibold">Dernières réservations</h2>
        </header>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : data && data.recent_bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Client</th>
                  <th className="px-4 py-2 font-medium">Activité</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                  <th className="px-4 py-2 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_bookings.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{booking.client}</div>
                      <div className="text-xs text-muted-foreground">{booking.email}</div>
                    </td>
                    <td className="px-4 py-3">{booking.activity}</td>
                    <td className="px-4 py-3">
                      {formatDateTime(booking.date_reservation)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_STYLES[booking.statut] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {STATUS_LABELS[booking.statut] ?? booking.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(booking.montant_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Aucune réservation enregistrée pour le moment.
          </p>
        )}
      </section>
    </div>
  );
}
import { DataTable, type Column } from "@touribook/ui/components/admin/DataTable";
import { useAdminBookings } from "@/features/admin/hook/use-admin";
import type { AdminBookingRow } from "@/features/admin/types/admin.types";
import { formatCurrency, formatDateTime } from "@touribook/ui/lib/format";

const columns: Column<AdminBookingRow>[] = [
  { key: "id", header: "#", render: (b) => b.id },
  { key: "client", header: "Client", render: (b) => b.client },
  { key: "activity", header: "Activité", render: (b) => b.activity },
  { key: "date", header: "Date", render: (b) => formatDateTime(b.date_reservation) },
  { key: "statut", header: "Statut", render: (b) => b.statut },
  {
    key: "montant",
    header: "Montant",
    align: "end",
    render: (b) => formatCurrency(b.montant_total),
  },
];

export default function BookingsPage() {
  const { data, isLoading } = useAdminBookings({ page: 1, size: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Réservations</h1>

      <div className="rounded-lg border bg-card">
        <DataTable
          columns={columns}
          rows={data?.items}
          isLoading={isLoading}
          getRowId={(b) => b.id}
          emptyLabel="Aucune réservation."
        />
      </div>
    </div>
  );
}
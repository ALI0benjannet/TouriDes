import { DataTable, type Column } from "@touribook/ui/components/admin/DataTable";
import { useAdminPayments } from "@/features/admin/hook/use-admin";
import type { AdminPaymentRow } from "@/features/admin/types/admin.types";
import { formatCurrency, formatDateTime } from "@touribook/ui/lib/format";

const columns: Column<AdminPaymentRow>[] = [
  { key: "id", header: "#", render: (p) => p.id },
  { key: "client", header: "Client", render: (p) => p.client },
  { key: "booking", header: "Réservation", render: (p) => `#${p.booking_id}` },
  { key: "methode", header: "Méthode", render: (p) => p.methode },
  { key: "statut", header: "Statut", render: (p) => p.statut },
  { key: "date", header: "Date", render: (p) => formatDateTime(p.date_paiement) },
  { key: "montant", header: "Montant", align: "end", render: (p) => formatCurrency(p.montant) },
];

export default function PaymentsPage() {
  const { data, isLoading } = useAdminPayments({ page: 1, size: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Paiements</h1>

      <div className="rounded-lg border bg-card">
        <DataTable
          columns={columns}
          rows={data?.items}
          isLoading={isLoading}
          getRowId={(p) => p.id}
          emptyLabel="Aucun paiement."
        />
      </div>
    </div>
  );
}
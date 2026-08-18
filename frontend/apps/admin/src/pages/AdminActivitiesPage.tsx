import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { DataTable, type Column } from "@touribook/ui/components/admin/DataTable";

import { useAdminActivities } from "@/features/admin/hook/use-admin";
import type { AdminActivityRow } from "@/features/admin/types/admin.types";
import { useActivityMutations } from "@/features/catalog/hooks";
import { formatCurrency } from "@touribook/ui/lib/format";

export default function AdminActivitiesPage() {
  const { data, isLoading } = useAdminActivities({ page: 1, size: 50 });
  const { remove } = useActivityMutations();

  const confirmDelete = (row: AdminActivityRow) => {
    if (row.bookings_count > 0) {
      window.alert(
        `« ${row.titre} » a ${row.bookings_count} réservation(s) — suppression impossible.`,
      );
      return;
    }
    if (window.confirm(`Supprimer définitivement « ${row.titre} » ?`)) {
      remove.mutate(row.id);
    }
  };

  const columns: Column<AdminActivityRow>[] = [
    { key: "titre", header: "Titre", render: (a) => a.titre },
    { key: "category", header: "Catégorie", render: (a) => a.category ?? "—" },
    { key: "localisation", header: "Lieu", render: (a) => a.localisation },
    { key: "duree", header: "Durée", render: (a) => `${a.duree} min` },
    { key: "bookings", header: "Réservations", render: (a) => a.bookings_count },
    { key: "prix", header: "Prix", align: "end", render: (a) => formatCurrency(a.prix) },
    {
      key: "actions",
      header: "Actions",
      align: "end",
      render: (a) => (
        <span className="inline-flex gap-1">
          <Link
            to={`/activities/${a.id}/edit`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Modifier ${a.titre}`}
          >
            <Pencil className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => confirmDelete(a)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Supprimer ${a.titre}`}
          >
            <Trash2 className="size-4" />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">Activités</h1>
        <Link
          to="/activities/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="size-4" />
          Nouvelle activité
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <DataTable
          columns={columns}
          rows={data?.items}
          isLoading={isLoading}
          getRowId={(a) => a.id}
          emptyLabel="Aucune activité — créez la première !"
        />
      </div>
    </div>
  );
}

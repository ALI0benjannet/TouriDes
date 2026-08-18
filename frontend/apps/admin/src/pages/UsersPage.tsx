import { useState } from "react";

import { DataTable, type Column } from "@touribook/ui/components/admin/DataTable";
import { useAdminUsers } from "@/features/admin/hook/use-admin";
import type { AdminUserRow } from "@/features/admin/types/admin.types";
import { formatDateTime } from "@touribook/ui/lib/format";

const columns: Column<AdminUserRow>[] = [
  { key: "nom", header: "Nom", render: (u) => `${u.prenom} ${u.nom}` },
  { key: "email", header: "E-mail", render: (u) => u.email },
  { key: "role", header: "Rôle", render: (u) => u.role },
  {
    key: "statut",
    header: "Statut",
    render: (u) =>
      !u.is_active ? "Désactivé" : u.is_verified ? "Vérifié" : "Non vérifié",
  },
  {
    key: "date",
    header: "Inscription",
    render: (u) => formatDateTime(u.date_inscription),
  },
];

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminUsers({ page, size: 20, search: search || undefined });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Utilisateurs</h1>

      <input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder="Rechercher un nom ou un e-mail…"
        className="w-full max-w-sm rounded-md border px-3 py-2 text-sm"
      />

      <div className="rounded-lg border bg-card">
        <DataTable
          columns={columns}
          rows={data?.items}
          isLoading={isLoading}
          getRowId={(u) => u.id}
          emptyLabel="Aucun utilisateur."
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {data?.total ?? 0} utilisateur(s)
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-1 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-40"
            disabled={!data || page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
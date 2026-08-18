import { ShieldAlert } from "lucide-react";

import { Button } from "@touribook/ui/components/ui/button";
import { useAuth } from "@touribook/auth/hooks/use-auth";
import { env } from "@touribook/api/env";

export default function ForbiddenPage() {
  const { logout } = useAuth();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldAlert className="size-12 text-destructive" />
      <h1 className="text-2xl font-semibold">Accès réservé</h1>
      <p className="text-muted-foreground">
        Ce compte n'a pas les droits administrateur.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => window.location.assign(env.VITE_CLIENT_URL)}>
          Retour au site
        </Button>
        <Button
          onClick={async () => {
            await logout();
            window.location.assign("/admin/login");
          }}
        >
          Changer de compte
        </Button>
      </div>
    </div>
  );
}

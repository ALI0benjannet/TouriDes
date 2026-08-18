import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MapPin, Tags, CalendarCheck,
  CreditCard, Users, ExternalLink, LogOut,
} from "lucide-react";
import { Button } from "@touribook/ui/components/ui/button";
import { useAuth } from "@touribook/auth/hooks/use-auth";
import { cn } from "@touribook/ui/lib/utils";
import { env } from "@touribook/api/env";

const NAV = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/activities", label: "Activités", icon: MapPin },
  { to: "/categories", label: "Catégories", icon: Tags },
  { to: "/bookings", label: "Réservations", icon: CalendarCheck },
  { to: "/payments", label: "Paiements", icon: CreditCard },
  { to: "/users", label: "Utilisateurs", icon: Users },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-e bg-background md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b px-4 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
            <img src="/admin/logo.png" alt="" className="size-full object-contain" />
          </span>
          <span>TouriBook Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}

          <a
            href={env.VITE_CLIENT_URL}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            Voir le site
          </a>
        </nav>

        <div className="border-t p-3">
          <p className="truncate px-3 pb-2 text-xs text-muted-foreground">
            {user?.email}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut className="size-4" />
            <span className="ms-2">Déconnexion</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

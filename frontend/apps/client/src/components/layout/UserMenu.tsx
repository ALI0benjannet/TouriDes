"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CalendarCheck, Heart, LayoutDashboard, LogOut, Settings, UserRound } from "lucide-react";

import { Avatar } from "@touribook/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@touribook/ui/components/ui/dropdown-menu";
import { useAuth } from "@touribook/auth/hooks/use-auth";
import { env } from "@touribook/api/env";

import { paths } from "@/routes/paths";

export function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push(paths.login);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("nav.account", "Mon compte")}
          className="group inline-flex items-center gap-2 rounded-full p-0.5 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar
            src={user?.avatar_url}
            name={user?.full_name}
            email={user?.email}
            size="md"
            className="ring-2 ring-transparent transition group-hover:ring-primary/30"
          />
          <span className="me-1 hidden max-w-[10rem] truncate text-sm font-medium text-foreground lg:inline">
            {user?.full_name ?? user?.email}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <div className="flex items-center gap-3 border-b border-border px-3 pb-3 pt-1">
          <Avatar src={user?.avatar_url} name={user?.full_name} email={user?.email} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {user?.full_name ?? t("nav.account", "Mon compte")}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="pt-2">
          <DropdownMenuItem onSelect={() => router.push(paths.profile)}>
            <span className="flex items-center gap-2">
              <UserRound className="size-4 text-muted-foreground" />
              {t("nav.profile", "Mon profil")}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => router.push(paths.bookings)}>
            <span className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-muted-foreground" />
              {t("nav.bookings", "Mes réservations")}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => router.push(paths.favorites)}>
            <span className="flex items-center gap-2">
              <Heart className="size-4 text-muted-foreground" />
              {t("nav.favorites", "Mes favoris")}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => router.push(paths.profile)}>
            <span className="flex items-center gap-2">
              <Settings className="size-4 text-muted-foreground" />
              {t("nav.settings", "Paramètres")}
            </span>
          </DropdownMenuItem>

          {user?.role === "admin" && (
            <DropdownMenuItem onSelect={() => window.location.assign(env.VITE_ADMIN_URL)}>
              <span className="flex items-center gap-2">
                <LayoutDashboard className="size-4 text-muted-foreground" />
                Tableau de bord admin
              </span>
            </DropdownMenuItem>
          )}
        </div>

        <div className="mt-2 border-t border-border pt-2">
          <DropdownMenuItem
            className="text-destructive hover:bg-destructive/10"
            onSelect={() => void handleLogout()}
          >
            <span className="flex items-center gap-2">
              <LogOut className="size-4" />
              {t("nav.logout", "Déconnexion")}
            </span>
          </DropdownMenuItem>
        </div>

        <Link href={paths.profile} className="sr-only">
          {t("nav.profile", "Mon profil")}
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthCard } from "@touribook/ui/components/auth/AuthCards";
import { TextField } from "@touribook/ui/components/form/TextField";
import { Button } from "@touribook/ui/components/ui/button";
import { Alert } from "@touribook/ui/components/ui/alert";
import { useAuth } from "@touribook/auth/hooks/use-auth";
import { getAuthErrorCode } from "@touribook/api/api-error";
import { env } from "@touribook/api/env";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  email_not_verified: "Confirmez votre e-mail avant de vous connecter.",
  account_disabled: "Ce compte est désactivé.",
  rate_limited: "Trop de tentatives. Réessayez dans une minute.",
};

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Déjà connecté ? (session partagée en prod : même domaine)
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/dashboard", { replace: true });
    }
    // connecté mais pas admin → il peut se reconnecter avec un autre compte
  }, [isAuthenticated, isAdmin, location.state, navigate]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      if (user.role !== "admin") {
        setError("Ce compte n'a pas les droits administrateur.");
        return;
      }
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/dashboard", { replace: true });
    } catch (err) {
      const code = getAuthErrorCode(err);
      setError(ERROR_MESSAGES[code] ?? "Connexion impossible. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      icon={
        <span className="flex size-9 items-center justify-center rounded-lg bg-white p-1">
          <img src="/admin/logo.png" alt="" className="size-full object-contain" />
        </span>
      }
      title="Espace administrateur"
      subtitle="Connectez-vous avec un compte administrateur TouriBook."
      footer={
        <a href={env.VITE_CLIENT_URL} className="text-slate-600 underline-offset-4 hover:underline">
          ← Retour au site
        </a>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}

        <TextField
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Se connecter
        </Button>
      </form>
    </AuthCard>
  );
}

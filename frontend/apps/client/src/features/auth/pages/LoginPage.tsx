import { useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { AuthCard } from "@touribook/ui/components/auth/AuthCards";
import { Alert } from "@touribook/ui/components/ui/alert";
import { Button } from "@touribook/ui/components/ui/button";
import { TextField } from "@touribook/ui/components/form/TextField";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";
import { paths } from "@/routes/paths";

export default function LoginPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { form, onSubmit } = useLoginForm();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const serverError = errors.root?.serverError?.message;

  return (
    <AuthCard
      icon={<LogIn aria-hidden className="size-5" />}
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      footer={
        <>
          {t("login.no_account")}{" "}
          <Link
            href={paths.register}
            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
          >
            {t("login.register")}
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} aria-busy={isSubmitting} className="space-y-5">
        {serverError && <Alert>{t(serverError, { defaultValue: serverError })}</Alert>}

        <fieldset disabled={isSubmitting} className="space-y-5 border-0 p-0">
          <TextField
            {...register("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            label={t("login.email")}
            error={errors.email?.message ? t(errors.email.message) : undefined}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-700">{t("login.password")}</span>
              <Link
                href={paths.forgotPassword}
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                {t("auth.forgotPassword.title")}
              </Link>
            </div>

            <div className="relative">
              <TextField
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                label={<span className="sr-only">{t("login.password")}</span>}
                aria-label={t("login.password")}
                error={errors.password?.message ? t(errors.password.message) : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("login.hide_password", "Masquer") : t("login.show_password", "Afficher")}
                className="absolute end-3 top-2.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </fieldset>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          {isSubmitting ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>
    </AuthCard>
  );
}
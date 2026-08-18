import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@touribook/auth/api/auth.api";
import { getAuthErrorCode } from "@touribook/api/api-error";
import { toApiError } from "@touribook/api/errors";
import { paths } from "@/routes/paths";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas/authSchemas";

export default function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegisterInput) => {
    try {
      await authApi.register({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password: data.password,
      });
      router.push(`${paths.verifyEmail}?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const apiError = toApiError(error);

      if (apiError.fieldErrors) {
        for (const [field, message] of Object.entries(apiError.fieldErrors)) {
          setError(field as keyof RegisterInput, {
            type: "server",
            message: t(message, { defaultValue: message }),
          });
        }
        return;
      }

      const code = getAuthErrorCode(error);
      toast.error(t(`auth.errors.${code}`, { defaultValue: t("errors.unexpected") }));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("register.title")}</h1>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <input {...register("prenom")} placeholder={t("register.first_name")} aria-label={t("register.first_name")} className="w-full border rounded p-2" />
          <p role="alert" className="text-red-600 text-sm">
            {errors.prenom?.message ? t(errors.prenom.message) : null}
          </p>
        </div>
        <div>
          <input {...register("nom")} placeholder={t("register.last_name")} aria-label={t("register.last_name")} className="w-full border rounded p-2" />
          <p role="alert" className="text-red-600 text-sm">
            {errors.nom?.message ? t(errors.nom.message) : null}
          </p>
        </div>
      </div>
      <input {...register("email")} placeholder={t("register.email")} aria-label={t("register.email")} className="w-full border rounded p-2" />
      <p role="alert" className="text-red-600 text-sm">
        {errors.email?.message ? t(errors.email.message) : null}
      </p>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          {...register("password")}
          placeholder={t("register.password")}
          aria-label={t("register.password")}
          className="w-full border rounded p-2"
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? t("login.hide_password", "Masquer") : t("login.show_password", "Afficher")}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <p role="alert" className="text-red-600 text-sm">{errors.password?.message ? t(errors.password.message) : null}</p>
      <input type={showPassword ? "text" : "password"} {...register("confirm")} placeholder={t("register.confirm_password")} aria-label={t("register.confirm_password")} className="w-full border rounded p-2" />
      <p role="alert" className="text-red-600 text-sm">{errors.confirm?.message ? t(errors.confirm.message) : null}</p>
      <button disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded p-2">
        {isSubmitting ? t("register.submitting") : t("register.submit")}
      </button>
      <Link href={paths.login} className="text-sm underline">{t("register.already_account")} {t("register.login")}</Link>
    </form>
  );
}
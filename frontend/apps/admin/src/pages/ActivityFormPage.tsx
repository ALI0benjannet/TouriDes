import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useActivity,
  useActivityMutations,
  useAvailabilities,
  useAvailabilityMutations,
  useCategories,
  type ActivityPayload,
} from "@/features/catalog/hooks";

const EMPTY: ActivityPayload = {
  titre: "",
  description: "",
  prix: 0,
  duree: 60,
  localisation: "",
  latitude: null,
  longitude: null,
  category_id: 0,
};

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[13px] font-semibold">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-white px-3 py-2 text-sm dark:bg-muted";

/** Création (/activities/new) et édition (/activities/:id/edit) d'une activité. */
export default function ActivityFormPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activityId = params.id ? Number(params.id) : null;
  const isEdit = activityId != null;

  const { data: categories } = useCategories();
  const { data: activity, isLoading } = useActivity(activityId);
  const { data: slots } = useAvailabilities(activityId);
  const { create, update, uploadPhoto, deletePhoto } = useActivityMutations();
  const slotMutations = useAvailabilityMutations();

  const [form, setForm] = useState<ActivityPayload>(EMPTY);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Nouveau créneau
  const [slotDate, setSlotDate] = useState("");
  const [slotHour, setSlotHour] = useState("09:00");
  const [slotSeats, setSlotSeats] = useState(8);

  useEffect(() => {
    if (activity) {
      setForm({
        titre: activity.titre,
        description: activity.description,
        prix: activity.prix,
        duree: activity.duree,
        localisation: activity.localisation,
        latitude: activity.latitude,
        longitude: activity.longitude,
        category_id: activity.category_id,
      });
    }
  }, [activity]);

  const set = <K extends keyof ActivityPayload>(key: K, value: ActivityPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.category_id) {
      toast.error("Choisissez une catégorie");
      return;
    }
    if (isEdit) {
      update.mutate({ id: activityId, payload: form });
    } else {
      create.mutate(form, {
        onSuccess: (created) => {
          toast.success("Activité créée — ajoutez une photo et des créneaux");
          navigate(`/activities/${created.id}/edit`, { replace: true });
        },
      });
    }
  };

  const onPhotoPicked = (file?: File) => {
    if (!file || !isEdit) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("5 Mo maximum");
      return;
    }
    uploadPhoto.mutate({ id: activityId, file });
    if (fileRef.current) fileRef.current.value = "";
  };

  const addSlot = () => {
    if (!isEdit || !slotDate) {
      toast.error("Choisissez une date");
      return;
    }
    slotMutations.create.mutate(
      {
        activity_id: activityId as number,
        date: slotDate,
        heure: `${slotHour}:00`,
        places_disponibles: slotSeats,
      },
      { onSuccess: () => setSlotDate("") },
    );
  };

  if (isEdit && isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/activities"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Retour aux activités"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">
          {isEdit ? `Modifier — ${activity?.titre ?? ""}` : "Nouvelle activité"}
        </h1>
      </div>

      {/* ---- Informations ---- */}
      <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-5">
        <Field label="Titre">
          <input
            required
            minLength={3}
            value={form.titre}
            onChange={(e) => set("titre", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            minLength={10}
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Prix (DT / pers.)">
            <input
              required
              type="number"
              min={1}
              step="0.5"
              value={form.prix || ""}
              onChange={(e) => set("prix", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Durée (minutes)">
            <input
              required
              type="number"
              min={15}
              step={15}
              value={form.duree || ""}
              onChange={(e) => set("duree", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Catégorie">
            <select
              required
              value={form.category_id || ""}
              onChange={(e) => set("category_id", Number(e.target.value))}
              className={inputClass}
            >
              <option value="" disabled>
                Choisir…
              </option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Localisation (ville)">
            <input
              required
              value={form.localisation}
              onChange={(e) => set("localisation", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Latitude (carte)">
            <input
              type="number"
              step="any"
              value={form.latitude ?? ""}
              onChange={(e) => set("latitude", e.target.value === "" ? null : Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Longitude (carte)">
            <input
              type="number"
              step="any"
              value={form.longitude ?? ""}
              onChange={(e) => set("longitude", e.target.value === "" ? null : Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={create.isPending || update.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Save className="size-4" />
            {isEdit ? "Enregistrer" : "Créer l'activité"}
          </button>
        </div>
      </form>

      {/* ---- Photo (édition uniquement) ---- */}
      {isEdit && (
        <section className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-semibold">Photo</h2>
          <div className="flex items-center gap-4">
            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-md border bg-muted">
              {activity?.photos ? (
                <img src={activity.photos} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  Aucune photo
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadPhoto.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary disabled:opacity-50"
              >
                <ImagePlus className="size-4" />
                {uploadPhoto.isPending ? "Envoi…" : activity?.photos ? "Remplacer" : "Ajouter"}
              </button>
              {activity?.photos && (
                <button
                  type="button"
                  onClick={() => deletePhoto.mutate(activityId)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  Supprimer
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => onPhotoPicked(e.target.files?.[0])}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            JPG, PNG ou WebP — visible immédiatement sur le site client.
          </p>
        </section>
      )}

      {/* ---- Créneaux (édition uniquement) ---- */}
      {isEdit && (
        <section className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-semibold">Créneaux de disponibilité</h2>

          <div className="mb-4 flex flex-wrap items-end gap-2">
            <Field label="Date">
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Heure">
              <input
                type="time"
                value={slotHour}
                onChange={(e) => setSlotHour(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Places">
              <input
                type="number"
                min={1}
                max={100}
                value={slotSeats}
                onChange={(e) => setSlotSeats(Number(e.target.value))}
                className={`${inputClass} w-24`}
              />
            </Field>
            <button
              type="button"
              onClick={addSlot}
              disabled={slotMutations.create.isPending}
              className="inline-flex h-[38px] items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="size-4" />
              Ajouter
            </button>
          </div>

          {(slots ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun créneau — l'activité n'est pas réservable tant qu'il n'y en a pas.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Heure</th>
                  <th className="py-2 font-medium">Places restantes</th>
                  <th className="py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(slots ?? []).map((slot) => (
                  <tr key={slot.id} className="border-b last:border-0">
                    <td className="py-2">
                      {new Date(`${slot.date}T12:00:00`).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2">{slot.heure.slice(0, 5)}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={slot.places_disponibles}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== slot.places_disponibles) {
                            slotMutations.update.mutate({
                              id: slot.id,
                              payload: { places_disponibles: v },
                            });
                          }
                        }}
                        className="w-20 rounded-md border border-input bg-white px-2 py-1 text-sm dark:bg-muted"
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Supprimer ce créneau ?")) {
                            slotMutations.remove.mutate(slot.id);
                          }
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Supprimer le créneau"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

import { cn } from "@touribook/ui/lib/utils";

/** Photo de l'activité, ou placeholder dégradé (équivalent de l'image-slot du design). */
export function ActivityImage({
  src,
  label,
  className,
}: {
  src?: string | null;
  label: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={label} className={cn("size-full object-cover", className)} />;
  }
  return (
    <div
      aria-hidden
      className={cn(
        "flex size-full items-center justify-center bg-gradient-to-br from-[#DCEAE6] to-[#EAD9B8]",
        className,
      )}
    >
      <span className="px-4 text-center text-sm font-medium text-foreground/40">{label}</span>
    </div>
  );
}

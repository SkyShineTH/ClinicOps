import { MessageCircle } from "lucide-react";

type Props = { href?: string; className?: string; label?: string };

/** Placeholder LINE CTA — replace `href` with real OA URL in production */
export function LineButton({
  href = "#",
  className = "",
  label = "คุยทาง LINE",
}: Props) {
  return (
    <a
      href={href}
      className={`group marketing-pressable inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white/78 px-5 py-2.5 text-sm font-semibold text-ink shadow-sm backdrop-blur-md hover:border-teal/40 hover:bg-sky-soft/70 ${className}`}
    >
      <MessageCircle
        className="size-4 text-teal transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:group-hover:scale-100"
        aria-hidden
      />
      {label}
    </a>
  );
}

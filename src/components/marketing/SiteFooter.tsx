import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Link as LocalizedLink } from "@/i18n/navigation";
import { brand } from "@/lib/mock-data";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";
import { PrivacyPolicyModalTrigger } from "@/components/marketing/PrivacyPolicyModal";

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  const legal = [
    { href: "/privacy" as const, labelKey: "privacy" as const, modal: true as const },
    { href: "/terms" as const, labelKey: "terms" as const },
    { href: "/cookies" as const, labelKey: "cookies" as const },
  ] as const;

  return (
    <footer className="mt-auto border-t border-line bg-surface/92 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="font-semibold text-ink">{brand.nameTh}</p>
          <p className="mt-1 text-sm text-ink-muted">{brand.nameEn} — demo</p>
          <p className="mt-4 text-sm text-ink-muted">{t("hoursBlurb")}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{t("linksTitle")}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <LocalizedLink href="/booking" className="marketing-footer-link hover:text-teal">
                {t("booking")}
              </LocalizedLink>
            </li>
            <li>
              <Link href="/app/reception" className="marketing-footer-link hover:text-teal">
                {t("staffReception")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{t("legalTitle")}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            {legal.map((l) => (
              <li key={l.href}>
                {"modal" in l && l.modal ? (
                  <PrivacyPolicyModalTrigger className="marketing-footer-link cursor-pointer bg-transparent p-0 text-left text-sm font-inherit text-inherit text-ink-muted hover:text-teal">
                    {t(l.labelKey)}
                  </PrivacyPolicyModalTrigger>
                ) : (
                  <LocalizedLink href={l.href} className="marketing-footer-link hover:text-teal">
                    {t(l.labelKey)}
                  </LocalizedLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line/80 py-5">
        <div className="flex flex-col items-center gap-3">
          <div className="hidden flex-wrap items-center justify-center gap-2 text-xs text-ink-muted md:flex">
            <span className="font-medium">{t("languageLabel")}</span>
            <LanguageSwitcher />
          </div>
          <p className="text-center text-xs text-ink-faint">
            © {new Date().getFullYear()} {brand.nameEn} — {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

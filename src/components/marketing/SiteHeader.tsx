import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { brand } from "@/lib/mock-data";
import { marketingNavItems } from "@/lib/marketing-nav";
import { LanguageSwitcher, MarketingHomeLink } from "./LanguageSwitcher";
import { LineButton } from "./LineButton";
import { MarketingMobileMenu } from "./MarketingMobileMenu";

export async function SiteHeader() {
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const navItems = marketingNavItems.map((item) => ({
    href: item.href,
    label: tNav(item.messageKey),
  }));

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-surface/88 shadow-[0_18px_44px_-36px_rgba(8,127,122,0.42)] backdrop-blur-xl supports-[backdrop-filter]:bg-surface/78">
      <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-1.5 px-4 py-3 sm:gap-4 sm:px-6">
        <MarketingHomeLink className="group flex min-w-0 flex-col leading-tight transition-colors duration-200">
          <span className="text-sm font-semibold text-ink transition-colors duration-200 group-hover:text-teal">
            {brand.nameTh}
          </span>
          <span className="text-xs text-ink-muted transition-colors duration-200 group-hover:text-ink">
            {brand.nameEn}
          </span>
        </MarketingHomeLink>
        <nav className="hidden items-center gap-1 md:flex" aria-label={tNav("ariaMain")}>
          {marketingNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="marketing-nav-link rounded-full px-3 py-1.5 text-sm text-ink-muted hover:bg-sky-soft/60 hover:text-ink"
            >
              {tNav(item.messageKey)}
            </Link>
          ))}
          <div className="ml-1 flex items-center pl-1 md:border-l md:border-line/80 md:pl-3">
            <LanguageSwitcher />
          </div>
        </nav>
        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <LineButton label={tCommon("lineChat")} />
          </div>
          <div className="hidden sm:block">
            <Link
              href="/booking"
              className="marketing-pressable clinical-cta inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            >
              {tCommon("bookOnline")}
            </Link>
          </div>

          <MarketingMobileMenu items={navItems} />
        </div>
      </div>
      <p className="border-t border-line/60 bg-sky-soft/35 px-4 py-1 text-center text-[11px] text-ink-muted sm:text-xs">
        {tCommon("demoBanner")}
      </p>
    </header>
  );
}

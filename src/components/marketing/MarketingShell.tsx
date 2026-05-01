import { ClinicalFuturesLayer } from "./ClinicalFuturesLayer";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export async function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-site relative isolate flex min-h-full flex-1 flex-col">
      <ClinicalFuturesLayer />
      <SiteHeader />
      <div className="relative z-[1] flex min-h-0 w-full min-w-0 flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}

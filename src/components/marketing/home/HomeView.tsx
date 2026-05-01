import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Camera,
  Cpu,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ReviewCarousel } from "@/components/marketing/ReviewCarousel";
import { SmileArcDivider } from "@/components/marketing/SmileArcDivider";
import { LineButton } from "@/components/marketing/LineButton";
import { branches } from "@/lib/mock-data";
import { heroPhoto } from "@/lib/hero-photo";
import { StockFigure } from "@/components/media/StockFigure";
import {
  branchPhotos,
  galleryPhotos,
  homeServicePhotos,
  reviewSlides,
  teamGroupPhoto,
  techPhotos,
} from "@/lib/stock-photos";

export async function HomeView() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const tCommon = await getTranslations("Common");
  const heroAlt = locale === "en" && heroPhoto.altEn ? heroPhoto.altEn : heroPhoto.altTh;
  const heroSignals =
    locale === "en"
      ? ["Digital scan planning", "Sterile workflow", "Demo booking"]
      : ["วางแผนด้วยสแกนดิจิทัล", "เวิร์กโฟลว์สะอาดปลอดภัย", "จองนัดโหมดสาธิต"];
  const heroInterfaceLabel =
    locale === "en" ? "Digital treatment planning cockpit" : "ระบบวางแผนรอยยิ้มดิจิทัล";

  return (
    <>
      <section className="relative min-h-[76svh] overflow-hidden bg-ink text-white">
        <Image
          src={heroPhoto.src}
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,31,29,0.82)_0%,rgba(6,31,29,0.54)_38%,rgba(6,31,29,0.12)_70%,rgba(6,31,29,0.22)_100%)]" />
        <div className="clinical-frame absolute inset-x-4 bottom-4 top-4 rounded-[1.5rem] border border-white/16 sm:inset-x-6 sm:rounded-[2rem]" />
        <div className="absolute left-1/2 top-6 hidden w-[min(46rem,72vw)] -translate-x-1/2 rounded-full border border-white/18 bg-white/8 px-5 py-2 text-center text-xs font-medium text-white/82 backdrop-blur-md lg:block">
          {heroInterfaceLabel}
        </div>
        <div className="relative z-[2] mx-auto flex min-h-[76svh] max-w-6xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 sm:pb-16 lg:pb-20">
          <div className="max-w-3xl clinical-reveal">
            <p className="inline-flex rounded-full border border-white/18 bg-white/12 px-3 py-1 text-xs font-semibold uppercase text-sky-soft backdrop-blur-md">
              {t("hero.eyebrow")}
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4.75rem]">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/82 sm:text-lg">{t("hero.body")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/booking"
                className="marketing-pressable clinical-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
              >
                {tCommon("bookOnline")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <LineButton label={tCommon("lineChat")} />
            </div>
            <ul className="mt-10 grid max-w-2xl gap-3 text-sm text-white/82 sm:grid-cols-2">
              <li className="clinical-chip flex items-center gap-2 rounded-full px-3 py-2 text-ink">
                <ShieldCheck className="size-4 shrink-0 text-teal" aria-hidden />
                <span>{t("hero.bulletSterilization")}</span>
              </li>
              <li className="clinical-chip flex items-center gap-2 rounded-full px-3 py-2 text-ink">
                <Cpu className="size-4 shrink-0 text-teal" aria-hidden />
                <span>{t("hero.bulletDigital")}</span>
              </li>
            </ul>
          </div>
          <div className="mt-10 grid gap-2 text-xs text-white/75 sm:grid-cols-3 lg:max-w-3xl">
            {heroSignals.map((signal) => (
              <div key={signal} className="rounded-2xl border border-white/16 bg-white/10 px-4 py-3 backdrop-blur-md">
                {signal}
              </div>
            ))}
          </div>
        </div>
        <figcaption className="absolute bottom-2 right-4 z-[3] max-w-[18rem] text-right text-[10px] leading-snug text-white/66 sm:right-6">
          <span>{t("hero.photoCredit")} </span>
          <a href={heroPhoto.photoUrl} target="_blank" rel="noopener noreferrer" className="underline">
            {heroPhoto.title}
          </a>
          <span> · {t("hero.photoBy")} </span>
          <a href={heroPhoto.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline">
            {heroPhoto.photographer}
          </a>
          <span> · </span>
          <a href={heroPhoto.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Unsplash License
          </a>
        </figcaption>
      </section>
      <SmileArcDivider />

      <HomeServices />
      <HomeTech />
      <HomeTeam />
      <HomeGallery />
      <HomeReviews />
      <HomeBranches />
      <HomeFaqTeaser />
      <HomeTrustStrip />
    </>
  );
}

async function HomeServices() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const label = locale === "en" ? "Treatment matrix" : "แผนบริการดิจิทัล";
  return (
    <section className="clinical-reveal mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-20" id="services">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase text-teal">{label}</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">{t("services.title")}</h2>
        <p className="mt-2 text-ink-muted">{t("services.subtitle")}</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="clinical-card group overflow-hidden rounded-[1.5rem] transition hover:-translate-y-1 hover:border-teal/40 lg:col-span-7">
          <Link href="/services#implants" className="block">
            <StockFigure
              meta={homeServicePhotos.implants}
              aspectClassName="aspect-[16/10]"
              frameClassName="clinical-frame rounded-none border-0 bg-line"
              imageClassName="transition duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 60vw"
              showCredit={false}
            />
            <div className="flex min-w-0 flex-col gap-4 p-6 pt-5 sm:p-8 sm:pt-6 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gold">{t("services.focus")}</p>
                <h3 className="mt-2 text-xl font-semibold text-ink group-hover:text-teal">{t("services.implantsTitle")}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">{t("services.implantsBody")}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto md:self-start">
                <Stethoscope className="hidden size-9 text-teal/70 md:block" aria-hidden />
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-8 pb-6 text-sm font-semibold text-teal">
              {t("services.seeDetails")} <ArrowRight className="size-4" />
            </span>
          </Link>
          <p className="border-t border-line px-8 py-3 text-[10px] text-ink-faint">
            <a
              href={homeServicePhotos.implants.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-teal"
            >
              {t("services.creditUnsplash")}
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="clinical-panel group flex flex-1 flex-col overflow-hidden rounded-[1.5rem] transition hover:-translate-y-1">
            <Link href="/services#veneers" className="flex flex-1 flex-col">
              <StockFigure
                meta={homeServicePhotos.veneers}
                aspectClassName="aspect-[16/9]"
                frameClassName="clinical-frame rounded-none border-0 bg-line"
                imageClassName="transition duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 40vw"
                showCredit={false}
              />
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <h3 className="font-semibold text-ink">{t("services.veneersTitle")}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{t("services.veneersBody")}</p>
                </div>
                <Sparkles className="mt-4 size-6 text-gold" aria-hidden />
              </div>
            </Link>
            <p className="border-t border-line px-6 py-3 text-[10px] text-ink-faint">
              <a
                href={homeServicePhotos.veneers.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-teal"
              >
                Unsplash
              </a>
            </p>
          </div>
          <div className="clinical-card group overflow-hidden rounded-[1.5rem] transition hover:-translate-y-1 hover:border-teal/40">
            <Link href="/services#ortho" className="block">
              <StockFigure
                meta={homeServicePhotos.ortho}
                aspectClassName="aspect-[16/9]"
                frameClassName="clinical-frame rounded-none border-0 bg-line"
                imageClassName="transition duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 40vw"
                showCredit={false}
              />
              <div className="p-6 pt-4">
                  <h3 className="font-semibold text-ink">{t("services.orthoTitle")}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{t("services.orthoBody")}</p>
              </div>
            </Link>
            <p className="border-t border-dashed border-line px-6 py-3 text-[10px] text-ink-faint">
              <a
                href={homeServicePhotos.ortho.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-teal"
              >
                Unsplash
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

async function HomeTech() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const label = locale === "en" ? "Digital studio" : "สตูดิโอดิจิทัล";
  const items = [
    { icon: Camera, titleKey: "scanTitle" as const, bodyKey: "scanBody" as const, photo: techPhotos[0]! },
    { icon: Cpu, titleKey: "cadTitle" as const, bodyKey: "cadBody" as const, photo: techPhotos[1]! },
    { icon: Sparkles, titleKey: "dsdTitle" as const, bodyKey: "dsdBody" as const, photo: techPhotos[2]! },
  ];
  return (
    <section className="border-y border-line bg-surface/82 py-18 backdrop-blur-xl sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase text-teal">{label}</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">{t("tech.title")}</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">{t("tech.subtitle")}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.titleKey} className="clinical-card group rounded-[1.5rem] p-4 transition hover:-translate-y-1 sm:p-5">
              <StockFigure
                meta={item.photo}
                aspectClassName="aspect-[16/10]"
                frameClassName="clinical-frame rounded-[1.1rem] border-0 bg-line"
                imageClassName="transition duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, 33vw"
                showCredit={false}
              />
              <item.icon className="mt-5 size-8 text-teal" aria-hidden />
              <h3 className="mt-4 font-semibold text-ink">{t(`tech.${item.titleKey}`)}</h3>
              <p className="mt-2 text-sm text-ink-muted">{t(`tech.${item.bodyKey}`)}</p>
              <p className="mt-2 text-[10px] text-ink-faint">
                <a
                  href={item.photo.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-teal"
                >
                  Unsplash
                </a>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/technology" className="text-sm font-semibold text-teal hover:underline">
            {t("tech.readMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}

async function HomeTeam() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const label = locale === "en" ? "Care team" : "ทีมดูแล";
  const doctors = [
    { nameKey: "d1name" as const, roleKey: "d1role" as const },
    { nameKey: "d2name" as const, roleKey: "d2role" as const },
    { nameKey: "d3name" as const, roleKey: "d3role" as const },
  ];
  return (
    <section className="w-full py-18 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-teal">{label}</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">{t("team.title")}</h2>
            <p className="mt-2 text-ink-muted">{t("team.subtitle")}</p>
          </div>
          <Link href="/team" className="text-sm font-semibold text-teal hover:underline">
            {t("team.seeAll")}
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        <div className="clinical-card overflow-hidden rounded-[1.5rem] transition hover:-translate-y-1 hover:border-teal/35 focus-within:border-teal/35">
          <Link
            href="/team"
            className="group block text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
            aria-label={t("team.cardAria")}
          >
            <StockFigure
              meta={teamGroupPhoto}
              aspectClassName="aspect-[16/9] lg:aspect-[2/1]"
              frameClassName="clinical-frame rounded-none border-0 bg-line"
              imageClassName="transition duration-700 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 1152px"
              showCredit={false}
            />
            <div className="grid gap-px bg-line sm:grid-cols-3">
              {doctors.map((d) => (
                <div key={d.nameKey} className="bg-surface p-5 transition-colors group-hover:bg-sky-soft/25">
                  <p className="font-semibold text-ink group-hover:text-teal">{t(`team.${d.nameKey}`)}</p>
                  <p className="mt-1 text-sm text-ink-muted">{t(`team.${d.roleKey}`)}</p>
                </div>
              ))}
            </div>
          </Link>
          <p className="border-t border-line px-5 py-3 text-[10px] text-ink-faint">
            <a
              href={teamGroupPhoto.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-teal"
            >
              {t("team.creditLine")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

async function HomeGallery() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const label = locale === "en" ? "Smile archive" : "แกลเลอรี่รอยยิ้ม";
  return (
    <section className="bg-sky-soft/35 py-18 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase text-teal">{label}</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">{t("gallery.title")}</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">{t("gallery.body")}</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {galleryPhotos.slice(0, 4).map((meta, i) => (
            <div key={meta.src + i} className="clinical-card group overflow-hidden rounded-[1.25rem]">
              <StockFigure
                meta={meta}
                aspectClassName="aspect-square"
                frameClassName="clinical-frame rounded-none border-0 bg-line"
                imageClassName="transition duration-700 ease-out group-hover:scale-[1.05]"
                sizes="(max-width: 640px) 50vw, 25vw"
                showCredit={false}
              />
              <p className="border-t border-line py-2 text-center text-[10px] text-ink-faint">
                <a href={meta.pageUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Unsplash
                </a>
              </p>
            </div>
          ))}
        </div>
        <Link href="/gallery" className="mt-6 inline-block text-sm font-semibold text-teal hover:underline">
          {t("gallery.cta")}
        </Link>
      </div>
    </section>
  );
}

async function HomeReviews() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const label = locale === "en" ? "Patient signal" : "เสียงตอบรับ";
  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-18 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold uppercase text-teal">{label}</p>
      <h2 className="mt-3 text-3xl font-semibold text-ink">{t("reviews.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t("reviews.subtitle")}</p>
      <div className="mt-8 min-w-0">
        <ReviewCarousel slides={reviewSlides} />
      </div>
    </section>
  );
}

async function HomeBranches() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const label = locale === "en" ? "Bangkok access" : "สาขาในกรุงเทพฯ";
  return (
    <section className="border-t border-line bg-surface/88 py-18 backdrop-blur-xl sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase text-teal">{label}</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">{t("branches.title")}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {branches.map((b) => (
            <div key={b.id} className="clinical-card group overflow-hidden rounded-[1.5rem] transition hover:-translate-y-1">
              <StockFigure
                meta={branchPhotos[b.id]!}
                aspectClassName="aspect-[4/3]"
                frameClassName="clinical-frame rounded-none border-0 bg-line"
                imageClassName="transition duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, 33vw"
                showCredit={false}
              />
              <div className="p-6">
                <p className="font-semibold text-ink">{b.nameTh}</p>
                <p className="text-sm text-ink-muted">{b.area}</p>
                <p className="mt-3 text-sm text-ink-muted">{b.hours}</p>
                <p className="mt-2 text-sm text-teal">{b.phone}</p>
                <p className="mt-2 text-[10px] text-ink-faint">
                  <a
                    href={branchPhotos[b.id]!.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-teal"
                  >
                    Unsplash
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/branches" className="text-sm font-semibold text-teal hover:underline">
            {t("branches.mapCta")}
          </Link>
          <Link href="/booking" className="text-sm font-semibold text-teal hover:underline">
            {t("branches.bookCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}

async function HomeFaqTeaser() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const label = locale === "en" ? "Before treatment" : "ก่อนเริ่มรักษา";
  return (
    <section className="mx-auto max-w-3xl px-4 py-18 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold uppercase text-teal">{label}</p>
      <h2 className="mt-3 text-3xl font-semibold text-ink">{t("faqTeaser.title")}</h2>
      <dl className="mt-8 space-y-4">
        <div className="clinical-panel rounded-[1.25rem] p-5">
          <dt className="font-semibold text-ink">{t("faqTeaser.q1")}</dt>
          <dd className="mt-2 text-sm text-ink-muted">{t("faqTeaser.a1")}</dd>
        </div>
        <div className="clinical-panel rounded-[1.25rem] p-5">
          <dt className="font-semibold text-ink">{t("faqTeaser.q2")}</dt>
          <dd className="mt-2 text-sm text-ink-muted">{t("faqTeaser.a2")}</dd>
        </div>
      </dl>
      <Link href="/faq" className="mt-6 inline-block text-sm font-semibold text-teal hover:underline">
        {t("faqTeaser.seeAll")}
      </Link>
    </section>
  );
}

async function HomeTrustStrip() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const tags = ["t1", "t2", "t3", "t4"] as const;
  return (
    <section className="border-t border-line py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {techPhotos.map((meta, i) => (
            <div
              key={meta.src + i}
              className="clinical-frame relative size-14 overflow-hidden rounded-xl border border-line opacity-90 shadow-sm sm:size-16"
            >
              <Image
                src={meta.src}
                alt={locale === "en" && meta.altEn ? meta.altEn : meta.altTh}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 opacity-70 sm:gap-x-8 sm:gap-y-3">
          {tags.map((k) => (
            <span key={k} className="text-center text-xs font-medium uppercase tracking-wide text-ink-muted">
              {t(`trustStrip.${k}`)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

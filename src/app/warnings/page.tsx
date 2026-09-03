import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Warnings — Read Before Flashing",
  description:
    "Mandatory warnings and flashing steps for the OnePlus Nord CE 3 5G (ziti): OOS 15.0.0.1301/1601 rules, hard-brick risks, and how to flash custom ROMs safely.",
  alternates: { canonical: "/warnings" },
  openGraph: buildOpenGraph({
    title: "Warnings — Read Before Flashing",
    description:
      "Mandatory warnings and flashing steps for the OnePlus Nord CE 3 5G (ziti): OOS 15.0.0.1301/1601 rules, hard-brick risks, and how to flash custom ROMs safely.",
    path: "/warnings",
  }),
  twitter: buildTwitter({
    title: "Warnings — Read Before Flashing",
    description:
      "OOS 15.0.0.1301/1601 rules, hard-brick risks and safe flashing steps for the OnePlus Nord CE 3 5G (ziti).",
  }),
};

const REQUIREMENTS = [
  {
    label: "OOS 15.0.0.1301 / 1601 OTA file",
    url: "https://t.me/OnePlusNordCE35G/76910",
  },
  {
    label: "ADB & fastboot drivers",
    url: "https://github.com/fawazahmed0/Latest-adb-fastboot-installer-for-windows",
  },
  {
    label: "Recovery and files",
    url: "https://sourceforge.net/projects/evox-unofficial-ziti/files/Extra/",
  },
];

const SUPPORT_LINKS = [
  {
    label: "Telegram support group",
    url: "https://t.me/OnePlusNordCE35G",
  },
  {
    label: "Telegram update channel",
    url: "https://t.me/oneplusnordce3channel",
  },
  {
    label: "XDA — warning on future Oplus OTAs",
    url: "https://xdaforums.com/t/final-warning-permanent-bootloader-lock-incoming-for-oppo-oneplus-realme-devices.4776062/",
  },
];

function StepNumber({ n }: { n: string }) {
  return (
    <span className="mt-0.5 shrink-0 font-mono text-[13px] font-semibold text-accent">
      {n}
    </span>
  );
}

export default function WarningsPage() {
  return (
    <div className="container-text pb-16 pt-10 sm:pt-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Warnings" }]} />

      <header className="border-b border-line pb-6">
        <p className="eyebrow-accent">Read before you flash</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Warnings
        </h1>
      </header>

      {/* Hard-brick banner */}
      <div className="mt-8 border border-accent/50 bg-accent/10 px-4 py-4 sm:px-5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          Hard brick warning
        </p>
        <p className="mt-2 text-[14.5px] font-medium leading-relaxed text-fg">
          Missing any of the points below can{" "}
          <strong className="text-accent">hard brick</strong> your device — the
          only solution then is a <strong>service center</strong>.
        </p>
      </div>

      {/* 1301 users */}
      <section aria-labelledby="warn-1301" className="mt-12">
        <SectionHead label="For OOS 15.0.0.1301+ users" />
        <ol className="space-y-5">
          {[
            <>
              Only update to 1301+ with <strong>with a locked
              bootloader</strong>, flash 1301(same oos version that you are currently on) to the other slot too (reinstall same oos using local install option) — and only then flash custom ROMs shipped
              without firmware. This way both slots will contain the same firmware.
            </>,
            <>
              <strong>DO NOT</strong> flash custom ROMs or downgrade to previous
              ROMs with older firmware. Be careful of the other slot as well —
              read point 1 again.
            </>,
            <>
              <strong>DO NOT</strong> update OxygenOS with an unlocked
              bootloader.
            </>,
          ].map((item, index) => (
            <li key={index} className="flex gap-4">
              <StepNumber n={`${index + 1}.`} />
              <p className="text-[14.5px] leading-relaxed text-fg/90">{item}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 border-l-2 border-accent bg-surface px-4 py-3.5">
          <p className="text-[13.5px] leading-relaxed text-muted">
            Reverting back to stock OOS 15.0.0.1301 has been tested by a 1301
            user (@shaktiraj on Telegram). Your only possibility is reverting on{" "}
            <strong className="text-fg">this same version (1301)</strong> — or,
            on future updates, reverting on the same version you flashed ROMs
            from.
          </p>
        </div>
      </section>

      {/* Non-1301 users */}
      <section aria-labelledby="warn-non1301" className="mt-12">
        <SectionHead label="If you never updated to OOS 15.0.0.1301" />
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-fg/90">
          <strong>Neither update to OOS 15.0.0.1301</strong> if you haven&apos;t
          already, <strong>nor revert back to this version</strong> from custom
          ROMs. Other than that, you can use your device as you wish.
        </p>
      </section>

      {/* Newcomers */}
      <section aria-labelledby="warn-newcomers" className="mt-12">
        <SectionHead label="For newcomers" />
        <ol className="space-y-3.5">
          {[
            "Go through the warnings above, the guides, and the tutorial videos for ziti before you begin.",
            "Before flashing, make sure proper adb/fastboot drivers are installed on your PC.",
            "Downgrading is dead for OOS 15.0.0.1301+ users. If you haven't updated, do NOT downgrade to OOS 13.1 in an unlocked-bootloader state — OOS 13.1's bootloader is corrupt.",
          ].map((item, index) => (
            <li key={index} className="flex gap-4">
              <StepNumber n={`${index + 1}.`} />
              <p className="text-[14.5px] leading-relaxed text-fg/90">{item}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Flashing steps */}
      <section aria-labelledby="warn-steps" className="mt-14 border-t border-line pt-10">
        <p className="eyebrow-accent">Flashing steps for 1301/1601+ users</p>
        <h2
          id="warn-steps"
          className="mt-3 font-display text-2xl font-bold tracking-tight"
        >
          How to flash custom ROMs on 1301+
        </h2>

        {/* Requirements */}
        <h3 className="mt-8 font-display text-[15px] font-semibold text-fg">
          You&apos;ll be needing
        </h3>
        <ul className="mt-3 space-y-2">
          {REQUIREMENTS.map((item) => (
            <li key={item.url} className="flex items-center gap-2.5 text-[14px] leading-relaxed">
              <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 bg-accent" />
              <span className="text-fg/90">
                {item.label}{" "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  ↗
                </a>
              </span>
            </li>
          ))}
        </ul>

        {/* Step 1 */}
        <h3 className="mt-10 flex items-baseline gap-3 font-display text-[15px] font-semibold text-fg">
          <span className="font-mono text-accent">Step 1</span>
          Fill the other slot with your current firmware
        </h3>

        <div className="mt-4 border border-line bg-surface px-4 py-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Method 1 — Local install
          </p>
          <p className="mt-2.5 text-[14px] leading-relaxed text-fg/90">
            Download the full OTA of the{" "}
            <strong>same version (not a downgraded version)</strong> you are on
            (1301/1601/1604/1800+) and use <strong>Local install</strong> from
            the updater to install it.
          </p>
        </div>

        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-faint">
          — or —
        </p>

        <div className="mt-4 border border-line bg-surface px-4 py-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Method 2 — Reverting method
          </p>
          <p className="mt-2.5 text-[14px] leading-relaxed text-fg/90">
            Flash recovery first, then flash the 1301/1601{" "}
            <strong>same-version stock ROM you are on</strong> (just like
            reverting from custom ROMs to OxygenOS) to fill the other slot with
            this same version firmware.
          </p>

          <ol className="mt-4 space-y-2.5 border-t border-line-soft pt-4">
            {[
              <>Flash recovery from bootloader.</>,
              <>Format from recovery.</>,
              <>
                Sideload 1601 from adb.
              </>,
              <>
                If it asks <em>&ldquo;verification fails, install anyway?&rdquo;</em> →{" "}
                <strong className="text-accent">Yes</strong>.
              </>,
              <>
                After the sideload reaches <strong>47%</strong> it asks for
                rebooting to recovery to flash the additional file →{" "}
                <strong className="text-accent">NO</strong>.
              </>,
              <>Reboot to bootloader from Advanced.</>,
              <>
                Flash the{" "}
                <a
                  href="https://sourceforge.net/projects/evox-unofficial-ziti/files/Extra/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  my_shit script ↗
                </a>
                .
              </>,
            ].map((item, index) => (
              <li key={index} className="flex gap-3.5">
                <StepNumber n={`${index + 1}.`} />
                <p className="text-[14px] leading-relaxed text-fg/90">{item}</p>
              </li>
            ))}
          </ol>

          <p className="mt-4 border-t border-line-soft pt-4 text-[14px] leading-relaxed text-fg">
            Your other slot will now reboot into this same OOS.
          </p>
        </div>

        {/* Step 2 */}
        <h3 className="mt-10 flex items-baseline gap-3 font-display text-[15px] font-semibold text-fg">
          <span className="font-mono text-accent">Step 2</span>
          Now you can flash custom ROMs
        </h3>

        <ol className="mt-4 space-y-2.5">
          {[
            <>Flash recovery again.</>,
            <>Format from recovery.</>,
            <>Sideload the custom ROM.</>,
            <>Reboot to system.</>,
          ].map((item, index) => (
            <li key={index} className="flex gap-3.5">
              <StepNumber n={`${index + 1}.`} />
              <p className="text-[14px] leading-relaxed text-fg/90">{item}</p>
            </li>
          ))}
          <li className="flex gap-3.5">
            <StepNumber n="✓" />
            <p className="text-[14px] font-semibold leading-relaxed text-fg">
              Done.
            </p>
          </li>
        </ol>

        <p className="mt-6 border-l-2 border-accent bg-surface px-4 py-3 text-[13px] text-muted">
          Tested by <span className="font-mono text-fg">@r0ckstar126</span>
        </p>
      </section>

      {/* Support */}
      <section aria-labelledby="warn-support" className="mt-14">
        <SectionHead label="Support" />
        <ul id="warn-support" className="border-t border-line">
          {SUPPORT_LINKS.map((resource) => (
            <li key={resource.url} className="border-b border-line">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group -mx-2 flex items-center justify-between gap-4 px-2 py-3.5 transition-colors hover:bg-surface sm:-mx-3 sm:px-3"
              >
                <span className="text-[14px] text-fg transition-colors group-hover:text-accent">
                  {resource.label}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-12 border-t border-line pt-6 text-[13px] leading-relaxed text-faint">
        Flash at your own risk — the community is not responsible for any of
        your mishaps.
      </p>
    </div>
  );
}

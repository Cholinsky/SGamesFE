import { useEffect } from "react";
import {
  getActiveDesignTheme,
  type PublicDesignTheme,
} from "../services/publicDesignThemeService";

const adminSeasonThemeCss = String.raw`
body.sgames-admin-theme-active {
  --sg-admin-border: color-mix(in srgb, var(--sg-border) 72%, transparent);
  --sg-admin-border-strong: color-mix(in srgb, var(--sg-primary) 24%, var(--sg-border) 76%);
  --sg-admin-card-bg: color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%);
  --sg-admin-card-bg-soft: color-mix(in srgb, var(--sg-surface) 48%, var(--sg-background) 52%);
  --sg-admin-input-bg: color-mix(in srgb, var(--sg-background) 82%, #000000 18%);
  --sg-admin-hover-bg: color-mix(in srgb, var(--sg-primary) 7%, transparent);
  --sg-admin-primary-soft: color-mix(in srgb, var(--sg-primary) 12%, transparent);
  --sg-admin-primary-softer: color-mix(in srgb, var(--sg-primary) 7%, transparent);
  --sg-admin-secondary-soft: color-mix(in srgb, var(--sg-secondary) 12%, transparent);
  --sg-admin-accent-soft: color-mix(in srgb, var(--sg-accent) 11%, transparent);
  --sg-admin-muted-soft: color-mix(in srgb, var(--sg-muted-text) 68%, transparent);
  --sg-admin-shadow: color-mix(in srgb, var(--sg-background) 74%, transparent);
  --sg-admin-glow-primary: color-mix(in srgb, var(--sg-primary) 14%, transparent);
  --sg-admin-glow-accent: color-mix(in srgb, var(--sg-accent) 12%, transparent);

  background:
    radial-gradient(circle at 14% 8%, color-mix(in srgb, var(--sg-primary) 8%, transparent), transparent 30rem),
    radial-gradient(circle at 90% 10%, color-mix(in srgb, var(--sg-accent) 7%, transparent), transparent 32rem),
    linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 28%, var(--sg-background) 72%) 0%, var(--sg-background) 52%, var(--sg-background) 100%);
  color: var(--sg-text);
}

html[data-admin-season-theme="Autumn"] body.sgames-admin-theme-active {
  --sg-admin-border: rgba(249, 115, 22, 0.18);
  --sg-admin-border-strong: rgba(249, 115, 22, 0.28);
  --sg-admin-primary-soft: rgba(249, 115, 22, 0.11);
  --sg-admin-primary-softer: rgba(249, 115, 22, 0.065);
  --sg-admin-secondary-soft: rgba(245, 158, 11, 0.10);
  --sg-admin-accent-soft: rgba(185, 28, 28, 0.10);
  --sg-admin-glow-primary: rgba(249, 115, 22, 0.10);
  --sg-admin-glow-accent: rgba(185, 28, 28, 0.09);

  background:
    radial-gradient(circle at 14% 8%, rgba(249, 115, 22, 0.09), transparent 30rem),
    radial-gradient(circle at 90% 10%, rgba(185, 28, 28, 0.075), transparent 32rem),
    radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.045), transparent 34rem),
    linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 30%, var(--sg-background) 70%) 0%, var(--sg-background) 52%, var(--sg-background) 100%);
}

html[data-admin-season-theme="Winter"] body.sgames-admin-theme-active {
  --sg-admin-border: rgba(103, 232, 249, 0.17);
  --sg-admin-border-strong: rgba(103, 232, 249, 0.28);
  --sg-admin-primary-soft: rgba(103, 232, 249, 0.10);
  --sg-admin-primary-softer: rgba(103, 232, 249, 0.06);
  --sg-admin-secondary-soft: rgba(59, 130, 246, 0.10);
  --sg-admin-accent-soft: rgba(196, 181, 253, 0.095);
  --sg-admin-glow-primary: rgba(103, 232, 249, 0.10);
  --sg-admin-glow-accent: rgba(196, 181, 253, 0.08);

  background:
    radial-gradient(circle at 14% 8%, rgba(103, 232, 249, 0.08), transparent 30rem),
    radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.075), transparent 32rem),
    radial-gradient(circle at 50% 100%, rgba(196, 181, 253, 0.045), transparent 34rem),
    linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 30%, var(--sg-background) 70%) 0%, var(--sg-background) 52%, var(--sg-background) 100%);
}

.sgames-admin-page {
  min-height: 100%;
  color: var(--sg-text);
}

.sgames-admin-theme-active main,
.sgames-admin-theme-active [data-radix-scroll-area-viewport] {
  color: var(--sg-text);
}

.sgames-admin-theme-active .sgames-admin-card,
.sgames-admin-theme-active .admin-season-card,
.sgames-admin-theme-active [class*="bg-gray-900"],
.sgames-admin-theme-active [class*="bg-slate-900"],
.sgames-admin-theme-active [class*="bg-[#10182b]"] {
  border-color: var(--sg-admin-border) !important;
  background: var(--sg-admin-card-bg) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--sg-text) 2.5%, transparent),
    0 18px 46px var(--sg-admin-shadow),
    0 0 26px var(--sg-admin-glow-accent) !important;
  backdrop-filter: blur(14px);
}

.sgames-admin-theme-active [class*="bg-gray-950"],
.sgames-admin-theme-active [class*="bg-slate-950"],
.sgames-admin-theme-active [class*="bg-[#070817]"],
.sgames-admin-theme-active [class*="bg-[#050713]"],
.sgames-admin-theme-active [class*="bg-[#0b1022]"] {
  background: var(--sg-background) !important;
}

.sgames-admin-theme-active [class*="bg-gray-800"],
.sgames-admin-theme-active [class*="bg-slate-800"] {
  background: var(--sg-admin-input-bg) !important;
}

.sgames-admin-theme-active [class*="border-gray-800"],
.sgames-admin-theme-active [class*="border-gray-700"],
.sgames-admin-theme-active [class*="border-slate-800"],
.sgames-admin-theme-active [class*="border-violet-500/20"],
.sgames-admin-theme-active [class*="border-purple-500/20"] {
  border-color: var(--sg-admin-border) !important;
}

.sgames-admin-theme-active [class*="divide-gray-800"] > :not([hidden]) ~ :not([hidden]),
.sgames-admin-theme-active [class*="divide-violet-500"] > :not([hidden]) ~ :not([hidden]) {
  border-color: var(--sg-admin-border) !important;
}

.sgames-admin-theme-active [class*="text-white"],
.sgames-admin-theme-active [class*="text-gray-100"],
.sgames-admin-theme-active [class*="text-slate-100"] {
  color: var(--sg-text) !important;
}

.sgames-admin-theme-active [class*="text-gray-300"],
.sgames-admin-theme-active [class*="text-gray-400"],
.sgames-admin-theme-active [class*="text-slate-300"],
.sgames-admin-theme-active [class*="text-slate-400"] {
  color: var(--sg-muted-text) !important;
}

.sgames-admin-theme-active [class*="text-gray-500"],
.sgames-admin-theme-active [class*="text-slate-500"] {
  color: var(--sg-admin-muted-soft) !important;
}

.sgames-admin-theme-active [class*="text-cyan-"],
.sgames-admin-theme-active [class*="text-blue-"] {
  color: var(--sg-primary) !important;
}

.sgames-admin-theme-active [class*="text-purple-"],
.sgames-admin-theme-active [class*="text-violet-"] {
  color: var(--sg-secondary) !important;
}

.sgames-admin-theme-active [class*="text-pink-"],
.sgames-admin-theme-active [class*="text-fuchsia-"] {
  color: var(--sg-accent) !important;
}

.sgames-admin-theme-active [class*="bg-cyan-"],
.sgames-admin-theme-active [class*="bg-blue-"] {
  background-color: var(--sg-admin-primary-soft) !important;
}

.sgames-admin-theme-active [class*="bg-purple-"],
.sgames-admin-theme-active [class*="bg-violet-"] {
  background-color: var(--sg-admin-secondary-soft) !important;
}

.sgames-admin-theme-active [class*="bg-pink-"],
.sgames-admin-theme-active [class*="bg-fuchsia-"] {
  background-color: var(--sg-admin-accent-soft) !important;
}

.sgames-admin-theme-active [class*="border-cyan-"],
.sgames-admin-theme-active [class*="border-blue-"],
.sgames-admin-theme-active [class*="border-purple-"],
.sgames-admin-theme-active [class*="border-violet-"],
.sgames-admin-theme-active [class*="border-pink-"],
.sgames-admin-theme-active [class*="border-fuchsia-"] {
  border-color: var(--sg-admin-border-strong) !important;
}

.sgames-admin-theme-active input,
.sgames-admin-theme-active textarea,
.sgames-admin-theme-active select,
.sgames-admin-theme-active [role="combobox"] {
  border-color: var(--sg-admin-border) !important;
  background: var(--sg-admin-input-bg) !important;
  color: var(--sg-text) !important;
}

.sgames-admin-theme-active input::placeholder,
.sgames-admin-theme-active textarea::placeholder {
  color: color-mix(in srgb, var(--sg-muted-text) 58%, transparent) !important;
}

.sgames-admin-theme-active [data-radix-popper-content-wrapper] [role="listbox"],
.sgames-admin-theme-active [data-radix-popper-content-wrapper] [cmdk-list],
.sgames-admin-theme-active [role="dialog"] {
  border-color: var(--sg-admin-border) !important;
  background: color-mix(in srgb, var(--sg-surface) 82%, #000000 18%) !important;
  color: var(--sg-text) !important;
}

.sgames-admin-theme-active table thead tr,
.sgames-admin-theme-active [class*="TableHeader"],
.sgames-admin-theme-active [class*="bg-white/5"] {
  background: color-mix(in srgb, var(--sg-text) 4%, transparent) !important;
}

.sgames-admin-theme-active tr,
.sgames-admin-theme-active [class*="border-b"] {
  border-color: color-mix(in srgb, var(--sg-admin-border) 88%, transparent) !important;
}

.sgames-admin-theme-active tr:hover,
.sgames-admin-theme-active [class*="hover:bg-white/5"]:hover,
.sgames-admin-theme-active [class*="hover:bg-cyan-500/5"]:hover {
  background: var(--sg-admin-hover-bg) !important;
}

.sgames-admin-theme-active button[class*="bg-gradient-to-r"],
.sgames-admin-theme-active button[class*="bg-gradient-to-br"],
.sgames-admin-theme-active [class*="from-cyan-"],
.sgames-admin-theme-active [class*="from-blue-"],
.sgames-admin-theme-active [class*="from-purple-"],
.sgames-admin-theme-active [class*="from-violet-"],
.sgames-admin-theme-active [class*="from-pink-"],
.sgames-admin-theme-active [class*="from-fuchsia-"] {
  background-image:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--sg-primary) 76%, var(--sg-surface) 24%),
      color-mix(in srgb, var(--sg-secondary) 70%, var(--sg-surface) 30%),
      color-mix(in srgb, var(--sg-accent) 68%, var(--sg-surface) 32%)
    ) !important;
}

.sgames-admin-theme-active button[class*="border-cyan"],
.sgames-admin-theme-active button[class*="border-purple"],
.sgames-admin-theme-active button[class*="border-violet"],
.sgames-admin-theme-active button[class*="border-pink"] {
  border-color: var(--sg-admin-border-strong) !important;
  color: var(--sg-primary) !important;
}

.sgames-admin-theme-active button[class*="border-cyan"]:hover,
.sgames-admin-theme-active button[class*="border-purple"]:hover,
.sgames-admin-theme-active button[class*="border-violet"]:hover,
.sgames-admin-theme-active button[class*="border-pink"]:hover {
  background: var(--sg-admin-hover-bg) !important;
  color: var(--sg-text) !important;
}

.sgames-admin-theme-active .recharts-cartesian-grid line,
.sgames-admin-theme-active .recharts-polar-grid-angle line,
.sgames-admin-theme-active .recharts-polar-grid-concentric path {
  stroke: var(--sg-admin-border) !important;
}

.sgames-admin-theme-active .recharts-text,
.sgames-admin-theme-active .recharts-legend-item-text {
  fill: var(--sg-muted-text) !important;
  color: var(--sg-muted-text) !important;
}

.sgames-admin-theme-active .recharts-tooltip-wrapper {
  color: var(--sg-text) !important;
}
.sgames-admin-theme-active .sgames-admin-primary-button {
  border: 1px solid color-mix(in srgb, var(--sg-primary) 34%, transparent) !important;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--sg-primary) 78%, var(--sg-surface) 22%),
      color-mix(in srgb, var(--sg-secondary) 72%, var(--sg-surface) 28%),
      color-mix(in srgb, var(--sg-accent) 68%, var(--sg-surface) 32%)
    ) !important;
  color: #ffffff !important;
  box-shadow: 0 0 22px var(--sg-admin-glow-accent);
}

.sgames-admin-theme-active .sgames-admin-primary-button:hover {
  filter: brightness(1.1);
}

`;

function ensureAdminThemeStyles() {
  if (typeof document === "undefined") {
    return;
  }

  const styleId =
    "sgames-admin-season-theme-styles";

  const existingStyle =
    document.getElementById(styleId);

  if (existingStyle) {
    existingStyle.textContent =
      adminSeasonThemeCss;
    return;
  }

  const style =
    document.createElement("style");

  style.id = styleId;
  style.textContent =
    adminSeasonThemeCss;

  document.head.appendChild(style);
}

function normalizeAdminSeasonKey(
  seasonKey?: string | null
) {
  const cleanSeason =
    seasonKey?.trim();

  if (
    cleanSeason === "Winter" ||
    cleanSeason === "Autumn" ||
    cleanSeason === "Summer"
  ) {
    return cleanSeason;
  }

  return "Summer";
}

function applyAdminTheme(
  theme: PublicDesignTheme | null
) {
  const root =
    document.documentElement;

  const seasonKey =
    normalizeAdminSeasonKey(
      theme?.seasonKey
    );

  root.dataset.adminSeasonTheme =
    seasonKey;

  document.body.classList.add(
    "sgames-admin-theme-active"
  );

  root.style.setProperty(
    "--sg-primary",
    theme?.primaryColor ?? "#22d3ee"
  );
  root.style.setProperty(
    "--sg-secondary",
    theme?.secondaryColor ?? "#8b5cf6"
  );
  root.style.setProperty(
    "--sg-accent",
    theme?.accentColor ?? "#ec4899"
  );
  root.style.setProperty(
    "--sg-background",
    theme?.backgroundColor ?? "#070817"
  );
  root.style.setProperty(
    "--sg-surface",
    theme?.surfaceColor ?? "#10182b"
  );
  root.style.setProperty(
    "--sg-text",
    theme?.textColor ?? "#ffffff"
  );
  root.style.setProperty(
    "--sg-muted-text",
    theme?.mutedTextColor ?? "#94a3b8"
  );
  root.style.setProperty(
    "--sg-border",
    theme?.borderColor ?? "rgba(139, 92, 246, 0.22)"
  );

  if (theme?.heroGradient) {
    root.style.setProperty(
      "--sg-hero-gradient",
      theme.heroGradient
    );
  }

  if (theme?.cardGradient) {
    root.style.setProperty(
      "--sg-card-gradient",
      theme.cardGradient
    );
  }
}

export function useAdminSeasonTheme() {
  useEffect(() => {
    ensureAdminThemeStyles();

    let isMounted = true;

    async function loadTheme() {
      try {
        const theme =
          await getActiveDesignTheme();

        if (!isMounted) {
          return;
        }

        applyAdminTheme(theme);
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        applyAdminTheme(null);
      }
    }

    function handleThemeRefresh() {
      loadTheme();
    }

    loadTheme();

    window.addEventListener(
      "sgames:admin-theme-refresh",
      handleThemeRefresh
    );

    window.addEventListener(
      "sgames:season-theme-updated",
      handleThemeRefresh
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        "sgames:admin-theme-refresh",
        handleThemeRefresh
      );

      window.removeEventListener(
        "sgames:season-theme-updated",
        handleThemeRefresh
      );
    };
  }, []);
}
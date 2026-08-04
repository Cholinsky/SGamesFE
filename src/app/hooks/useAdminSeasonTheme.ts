import { useEffect } from "react";
import {
  getActiveDesignTheme,
  type PublicDesignTheme,
} from "../services/publicDesignThemeService";


const adminSeasonThemeCss = String.raw`body.sgames-admin-theme-active {
  background:
    radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--sg-primary) 14%, transparent), transparent 30rem),
    radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--sg-accent) 12%, transparent), transparent 32rem),
    linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 58%, var(--sg-background) 42%) 0%, var(--sg-background) 46%, var(--sg-background) 100%);
  color: var(--sg-text);
}

html[data-admin-season-theme="Autumn"] body.sgames-admin-theme-active {
  background:
    radial-gradient(circle at 12% 8%, rgba(249, 115, 22, 0.17), transparent 30rem),
    radial-gradient(circle at 88% 12%, rgba(185, 28, 28, 0.14), transparent 32rem),
    radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.08), transparent 34rem),
    linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
}

html[data-admin-season-theme="Winter"] body.sgames-admin-theme-active {
  background:
    radial-gradient(circle at 12% 8%, rgba(103, 232, 249, 0.16), transparent 30rem),
    radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.16), transparent 32rem),
    radial-gradient(circle at 50% 100%, rgba(196, 181, 253, 0.08), transparent 34rem),
    linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
}

.sgames-admin-page {
  min-height: 100%;
  color: var(--sg-text);
}

.sgames-admin-theme-active main,
.sgames-admin-theme-active [data-radix-scroll-area-viewport] {
  color: var(--sg-text);
}

.sgames-admin-theme-active [class*="bg-gray-950"],
.sgames-admin-theme-active [class*="bg-slate-950"],
.sgames-admin-theme-active [class*="bg-[#070817]"],
.sgames-admin-theme-active [class*="bg-[#050713]"],
.sgames-admin-theme-active [class*="bg-[#0b1022]"] {
  background: var(--sg-background) !important;
}

.sgames-admin-theme-active [class*="bg-gray-900"],
.sgames-admin-theme-active [class*="bg-slate-900"],
.sgames-admin-theme-active [class*="bg-[#10182b]"] {
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--sg-surface) 76%, transparent),
      color-mix(in srgb, var(--sg-background) 86%, transparent)
    ) !important;
}

.sgames-admin-theme-active [class*="bg-gray-800"],
.sgames-admin-theme-active [class*="bg-slate-800"] {
  background:
    color-mix(in srgb, var(--sg-background) 76%, #000000 24%) !important;
}

.sgames-admin-theme-active [class*="border-gray-800"],
.sgames-admin-theme-active [class*="border-gray-700"],
.sgames-admin-theme-active [class*="border-slate-800"],
.sgames-admin-theme-active [class*="border-violet-500/20"],
.sgames-admin-theme-active [class*="border-violet-500/30"],
.sgames-admin-theme-active [class*="border-purple-500/20"],
.sgames-admin-theme-active [class*="border-purple-500/30"] {
  border-color: var(--sg-border) !important;
}

.sgames-admin-theme-active [class*="divide-gray-800"] > :not([hidden]) ~ :not([hidden]),
.sgames-admin-theme-active [class*="divide-violet-500"] > :not([hidden]) ~ :not([hidden]) {
  border-color: color-mix(in srgb, var(--sg-secondary) 18%, transparent) !important;
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
.sgames-admin-theme-active [class*="text-slate-500"],
.sgames-admin-theme-active [class*="placeholder:text-gray-500"],
.sgames-admin-theme-active [class*="placeholder:text-slate-500"] {
  color: color-mix(in srgb, var(--sg-muted-text) 70%, transparent) !important;
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
  background-color: color-mix(in srgb, var(--sg-primary) 13%, transparent) !important;
}

.sgames-admin-theme-active [class*="bg-purple-"],
.sgames-admin-theme-active [class*="bg-violet-"] {
  background-color: color-mix(in srgb, var(--sg-secondary) 13%, transparent) !important;
}

.sgames-admin-theme-active [class*="bg-pink-"],
.sgames-admin-theme-active [class*="bg-fuchsia-"] {
  background-color: color-mix(in srgb, var(--sg-accent) 13%, transparent) !important;
}

.sgames-admin-theme-active [class*="border-cyan-"],
.sgames-admin-theme-active [class*="border-blue-"] {
  border-color: color-mix(in srgb, var(--sg-primary) 38%, transparent) !important;
}

.sgames-admin-theme-active [class*="border-purple-"],
.sgames-admin-theme-active [class*="border-violet-"] {
  border-color: color-mix(in srgb, var(--sg-secondary) 38%, transparent) !important;
}

.sgames-admin-theme-active [class*="border-pink-"],
.sgames-admin-theme-active [class*="border-fuchsia-"] {
  border-color: color-mix(in srgb, var(--sg-accent) 38%, transparent) !important;
}

.sgames-admin-theme-active input,
.sgames-admin-theme-active textarea,
.sgames-admin-theme-active select,
.sgames-admin-theme-active [role="combobox"] {
  border-color: var(--sg-border) !important;
  background:
    color-mix(in srgb, var(--sg-background) 78%, #000000 22%) !important;
  color: var(--sg-text) !important;
}

.sgames-admin-theme-active input::placeholder,
.sgames-admin-theme-active textarea::placeholder {
  color: color-mix(in srgb, var(--sg-muted-text) 58%, transparent) !important;
}

.sgames-admin-theme-active [data-radix-popper-content-wrapper] [role="listbox"],
.sgames-admin-theme-active [data-radix-popper-content-wrapper] [cmdk-list],
.sgames-admin-theme-active [role="dialog"] {
  border-color: var(--sg-border) !important;
  background:
    color-mix(in srgb, var(--sg-surface) 88%, #000000 12%) !important;
  color: var(--sg-text) !important;
}

.sgames-admin-theme-active table thead tr,
.sgames-admin-theme-active [class*="TableHeader"],
.sgames-admin-theme-active [class*="bg-white/5"] {
  background: color-mix(in srgb, var(--sg-text) 5%, transparent) !important;
}

.sgames-admin-theme-active tr {
  border-color: color-mix(in srgb, var(--sg-secondary) 18%, transparent) !important;
}

.sgames-admin-theme-active tr:hover,
.sgames-admin-theme-active [class*="hover:bg-white/5"]:hover,
.sgames-admin-theme-active [class*="hover:bg-cyan-500/5"]:hover {
  background: color-mix(in srgb, var(--sg-primary) 6%, transparent) !important;
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
      var(--sg-primary),
      var(--sg-secondary),
      var(--sg-accent)
    ) !important;
}

.sgames-admin-theme-active button[class*="border-cyan"],
.sgames-admin-theme-active button[class*="border-purple"],
.sgames-admin-theme-active button[class*="border-violet"],
.sgames-admin-theme-active button[class*="border-pink"] {
  border-color: color-mix(in srgb, var(--sg-primary) 42%, transparent) !important;
  color: var(--sg-primary) !important;
}

.sgames-admin-theme-active button[class*="border-cyan"]:hover,
.sgames-admin-theme-active button[class*="border-purple"]:hover,
.sgames-admin-theme-active button[class*="border-violet"]:hover,
.sgames-admin-theme-active button[class*="border-pink"]:hover {
  background: color-mix(in srgb, var(--sg-accent) 10%, transparent) !important;
  color: var(--sg-accent) !important;
}

.sgames-admin-theme-active .recharts-cartesian-grid line,
.sgames-admin-theme-active .recharts-polar-grid-angle line,
.sgames-admin-theme-active .recharts-polar-grid-concentric path {
  stroke: color-mix(in srgb, var(--sg-border) 75%, transparent) !important;
}

.sgames-admin-theme-active .recharts-text,
.sgames-admin-theme-active .recharts-legend-item-text {
  fill: var(--sg-muted-text) !important;
  color: var(--sg-muted-text) !important;
}

.sgames-admin-theme-active .recharts-tooltip-wrapper {
  color: var(--sg-text) !important;
}

.sgames-admin-theme-active .admin-season-card,
.sgames-admin-theme-active .sgames-admin-card {
  border: 1px solid var(--sg-border) !important;
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--sg-surface) 76%, transparent),
      color-mix(in srgb, var(--sg-background) 86%, transparent)
    ) !important;
  box-shadow:
    0 0 32px color-mix(in srgb, var(--sg-accent) 12%, transparent);
  backdrop-filter: blur(14px);
}
`;

function ensureAdminThemeStyles() {
  if (typeof document === "undefined") {
    return;
  }

  const styleId =
    "sgames-admin-season-theme-styles";

  if (document.getElementById(styleId)) {
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
    theme?.borderColor ?? "rgba(139,92,246,0.22)"
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
    let isMounted =
      true;

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

    loadTheme();

    window.addEventListener(
      "sgames:admin-theme-refresh",
      loadTheme
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        "sgames:admin-theme-refresh",
        loadTheme
      );
    };
  }, []);
}
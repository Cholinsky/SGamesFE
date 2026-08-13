import { useEffect } from "react";
import {
  getActiveDesignTheme,
  type PublicDesignTheme,
} from "../services/publicDesignThemeService";
import "../styles/adminSeasonTheme.css";

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

  if (cleanSeason === "Fall") {
    return "Autumn";
  }

  return "Summer";
}

function getFallbackTheme(
  seasonKey: string
) {
  if (seasonKey === "Winter") {
    return {
      primaryColor: "#12DD78",
      secondaryColor: "#0A5B6D",
      accentColor: "#1AE7CA",
      backgroundColor: "#012D3A",
      surfaceColor: "#118087",
      textColor: "#F2FBFF",
      mutedTextColor: "#B7D7DE",
      borderColor: "rgba(26,231,202,0.24)",
    };
  }

  if (seasonKey === "Autumn") {
    return {
      primaryColor: "#EF4444",
      secondaryColor: "#334155",
      accentColor: "#F97316",
      backgroundColor: "#05070C",
      surfaceColor: "#111827",
      textColor: "#F8FAFC",
      mutedTextColor: "#94A3B8",
      borderColor: "rgba(239,68,68,0.24)",
    };
  }

  return {
    primaryColor: "#22D3EE",
    secondaryColor: "#8B5CF6",
    accentColor: "#EC4899",
    backgroundColor: "#070817",
    surfaceColor: "#10182B",
    textColor: "#F8F7FF",
    mutedTextColor: "#93A4BD",
    borderColor: "rgba(34,211,238,0.24)",
  };
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

  const fallback =
    getFallbackTheme(
      seasonKey
    );

  const background =
    theme?.backgroundColor ?? fallback.backgroundColor;

  const surface =
    theme?.surfaceColor ?? fallback.surfaceColor;

  const secondary =
    theme?.secondaryColor ?? fallback.secondaryColor;

  const primary =
    theme?.primaryColor ?? fallback.primaryColor;

  const accent =
    theme?.accentColor ?? fallback.accentColor;

  root.dataset.adminSeasonTheme =
    seasonKey;

  root.dataset.seasonTheme =
    seasonKey;

  document.body.classList.add(
    "sgames-admin-theme-active"
  );

  root.style.setProperty(
    "--sg-primary",
    primary
  );
  root.style.setProperty(
    "--sg-secondary",
    secondary
  );
  root.style.setProperty(
    "--sg-accent",
    accent
  );
  root.style.setProperty(
    "--sg-background",
    background
  );
  root.style.setProperty(
    "--sg-surface",
    surface
  );
  root.style.setProperty(
    "--sg-text",
    theme?.textColor ?? fallback.textColor
  );
  root.style.setProperty(
    "--sg-muted-text",
    theme?.mutedTextColor ?? fallback.mutedTextColor
  );
  root.style.setProperty(
    "--sg-border",
    theme?.borderColor ?? fallback.borderColor
  );

  /*
   * Tokens explícitos de 5 colores para futuras pantallas,
   * overlays o componentes que necesiten leer la paleta completa.
   */
  root.style.setProperty(
    "--sg-palette-1",
    background
  );
  root.style.setProperty(
    "--sg-palette-2",
    surface
  );
  root.style.setProperty(
    "--sg-palette-3",
    secondary
  );
  root.style.setProperty(
    "--sg-palette-4",
    primary
  );
  root.style.setProperty(
    "--sg-palette-5",
    accent
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

  root.style.setProperty(
    "--sg-glow-primary",
    `color-mix(in srgb, ${primary} 30%, transparent)`
  );

  root.style.setProperty(
    "--sg-glow-secondary",
    `color-mix(in srgb, ${accent} 18%, transparent)`
  );
}

export function useAdminSeasonTheme() {
  useEffect(() => {
    let isMounted =
      true;

    async function loadTheme() {
      try {
        const theme =
          await getActiveDesignTheme();

        if (isMounted) {
          applyAdminTheme(theme);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          applyAdminTheme(null);
        }
      }
    }

    loadTheme();

    return () => {
      isMounted =
        false;
    };
  }, []);
}
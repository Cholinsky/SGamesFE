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
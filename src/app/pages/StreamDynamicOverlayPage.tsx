import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Clock,
  Gamepad2,
  Radio,
  User,
  Users,
} from "lucide-react";
import { API_URL } from "../config/api";
import {
  getStreamPanelPublic,
  type StreamPanelData,
  type StreamQueueItem,
} from "../services/streamPanelService";

type DisplayData = {
  runnerName?: string;
  runner2Name?: string;
  gameName?: string;
  categoryName?: string;
  platformName?: string;
  consoleName?: string;
  releaseDate?: string;
  gameReleaseDate?: string;
  estimate?: string;
  commentators?: string;
  language?: string;
  pronouns?: string;
  note?: string;
};

type PublicScheduleEntry = {
  id?: string;
  dayDate?: string;
  DayDate?: string;
  startTime?: string;
  StartTime?: string;
  durationMinutes?: number;
  DurationMinutes?: number;
  runnerName?: string | null;
  RunnerName?: string | null;
  game?: string | null;
  Game?: string | null;
  category?: string | null;
  Category?: string | null;
  platform?: string | null;
  Platform?: string | null;
  runStatus?: string | null;
  RunStatus?: string | null;
};

type PublicScheduleResponse = {
  eventActive?: boolean;
  EventActive?: boolean;
  isPublished?: boolean;
  IsPublished?: boolean;
  event?: string;
  Event?: string;
  eventId?: string;
  EventId?: string;
  entries?: PublicScheduleEntry[];
  Entries?: PublicScheduleEntry[];
};

const overlayStyles = `
  @font-face {
    font-family: "SGamesOverlayFont";
    src: url("/fonts/OVERLAY_FONT_NAME.OVERLAY_FONT_EXT") format("OVERLAY_FONT_FORMAT");
    font-weight: 400;
    font-style: normal;
    font-display: block;
  }

  html,
  body,
  #root {
    margin: 0 !important;
    width: 100%;
    min-height: 100%;
    overflow: hidden !important;
    background: transparent !important;
  }

  .dynamic-overlay-root {
    min-height: 100vh;
    width: 100vw;
    background: transparent;
    color: #f8fafc;
    font-family:
      "SGamesOverlayFont",
      "Berani",
      "Arial Black",
      Impact,
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    --overlay-primary: #22d3ee;
    --overlay-secondary: #d946ef;
    --overlay-accent: #facc15;
    --overlay-bg: rgba(12, 10, 50, 0.84);
    --overlay-border: rgba(34, 211, 238, 0.46);
    --overlay-text: #f8fafc;
    --overlay-muted: #cbd5e1;
    --overlay-shadow: rgba(0, 0, 0, 0.86);
  }

  .dynamic-overlay-root * {
    box-sizing: border-box;
  }

  .theme-summer {
    --overlay-primary: #22d3ee;
    --overlay-secondary: #d946ef;
    --overlay-accent: #facc15;
    --overlay-bg: rgba(12, 10, 50, 0.84);
    --overlay-border: rgba(34, 211, 238, 0.46);
    --overlay-shadow-color: rgba(34, 211, 238, 0.42);
  }

  .theme-autumn {
    --overlay-primary: #ef4444;
    --overlay-secondary: #f97316;
    --overlay-accent: #facc15;
    --overlay-bg: rgba(5, 7, 12, 0.84);
    --overlay-border: rgba(239, 68, 68, 0.50);
    --overlay-shadow-color: rgba(249, 115, 22, 0.38);
  }

  .theme-winter {
    --overlay-primary: #1ae7ca;
    --overlay-secondary: #12dd78;
    --overlay-accent: #f2fbff;
    --overlay-bg: rgba(1, 45, 58, 0.84);
    --overlay-border: rgba(26, 231, 202, 0.52);
    --overlay-shadow-color: rgba(26, 231, 202, 0.38);
  }

  .sg-text-only {
    width: 100vw;
    height: 100vh;
    display: flex;
    padding: 4.6vh 5vw;
    background: transparent;
    pointer-events: none;
  }

  .sg-text-only.center {
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .sg-text-only.left {
    align-items: center;
    justify-content: flex-start;
    text-align: left;
  }

  .sg-text-stack {
    width: min(1600px, 92vw);
  }

  .sg-kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.55em;
    margin-bottom: 0.45em;
    color: var(--overlay-primary);
    font-size: clamp(22px, 2vw, 42px);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    text-shadow:
      4px 4px 0 var(--overlay-shadow),
      0 0 18px var(--overlay-shadow-color);
  }

  .sg-text-title {
    margin: 0;
    color: var(--overlay-text);
    font-size: clamp(54px, 8.8vw, 158px);
    font-weight: 400;
    line-height: 0.95;
    letter-spacing: -0.02em;
    text-wrap: balance;
    text-shadow:
      7px 7px 0 var(--overlay-shadow),
      0 0 26px var(--overlay-shadow-color),
      0 0 46px rgba(0, 0, 0, 0.75);
  }

  .sg-text-subtitle {
    margin: 0.35em 0 0;
    color: var(--overlay-secondary);
    font-size: clamp(26px, 4.2vw, 78px);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: 0.02em;
    text-shadow:
      5px 5px 0 var(--overlay-shadow),
      0 0 22px var(--overlay-shadow-color);
  }

  .sg-text-meta {
    margin: 0.45em 0 0;
    color: var(--overlay-muted);
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    font-size: clamp(18px, 2vw, 36px);
    font-weight: 900;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    text-shadow:
      3px 3px 0 var(--overlay-shadow),
      0 0 18px rgba(0, 0, 0, 0.9);
  }

  .sg-runner-tag-text {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1vh 3vw;
    background: transparent;
    pointer-events: none;
  }

  .sg-runner-tag-text h1 {
    margin: 0;
    color: var(--overlay-text);
    font-size: clamp(40px, 14vw, 160px);
    font-weight: 400;
    line-height: 0.92;
    letter-spacing: -0.02em;
    white-space: nowrap;
    text-shadow:
      6px 6px 0 var(--overlay-shadow),
      0 0 24px var(--overlay-shadow-color),
      0 0 42px rgba(0, 0, 0, 0.85);
  }

  .sg-next-run-text .sg-text-title {
    font-size: clamp(42px, 7vw, 118px);
  }

  .sg-next-run-text .sg-text-subtitle {
    font-size: clamp(22px, 3.2vw, 58px);
  }

  .sg-single-field {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3vw;
    background: transparent;
    pointer-events: none;
    overflow: hidden;
  }

  .sg-single-field.align-left {
    justify-content: flex-start;
  }

  .sg-single-field h1 {
    margin: 0;
    max-width: 100%;
    color: var(--overlay-text);
    font-size: clamp(32px, 13vw, 148px);
    font-weight: 400;
    line-height: 0.92;
    letter-spacing: -0.02em;
    white-space: nowrap;
    text-align: center;
    text-transform: uppercase;
    text-shadow:
      6px 6px 0 var(--overlay-shadow),
      0 0 24px var(--overlay-shadow-color),
      0 0 44px rgba(0, 0, 0, 0.85);
  }

  .sg-single-field.is-secondary h1 {
    color: var(--overlay-secondary);
  }

  .sg-single-field.is-accent h1 {
    color: var(--overlay-accent);
    font-family:
      "Arial Black",
      Impact,
      "SGamesOverlayFont",
      Inter,
      system-ui,
      sans-serif;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  .sg-single-field.is-small h1 {
    font-size: clamp(28px, 9vw, 108px);
  }

  .sg-single-field.is-estimate h1 {
    font-size: clamp(32px, 10vw, 128px);
  }

  .sg-schedule-root {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    padding: 0;
    background: transparent;
    pointer-events: none;
  }

  .sg-schedule-card {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr;
    border: 2px solid var(--overlay-border);
    border-radius: 18px;
    background:
      linear-gradient(90deg, rgba(249, 115, 22, 0.20), transparent 36%),
      radial-gradient(circle at 0% 50%, var(--overlay-shadow-color), transparent 36%),
      rgba(5, 7, 12, 0.88);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.04),
      0 0 28px var(--overlay-shadow-color);
    overflow: hidden;
  }

  .sg-schedule-header {
    min-height: 46px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 20px;
    padding: 8px 22px 7px;
    border-bottom: 1px solid color-mix(in srgb, var(--overlay-border) 70%, transparent);
  }

  .sg-schedule-header h1 {
    margin: 0;
    color: var(--overlay-text);
    font-size: clamp(22px, 3.4vw, 42px);
    font-weight: 400;
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;
    text-shadow:
      4px 4px 0 var(--overlay-shadow),
      0 0 16px var(--overlay-shadow-color);
  }

  .sg-schedule-header span {
    color: var(--overlay-primary);
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    font-size: clamp(11px, 1.5vw, 18px);
    font-weight: 1000;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .sg-schedule-list {
    min-height: 0;
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }

  .sg-schedule-row {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(110px, 0.24fr) minmax(0, 1fr) minmax(130px, 0.42fr);
    align-items: center;
    gap: clamp(10px, 2vw, 26px);
    padding: 8px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  }

  .sg-schedule-row:nth-child(2n) {
    background: rgba(255, 255, 255, 0.035);
  }

  .sg-schedule-time {
    color: var(--overlay-accent);
    font-family:
      "Arial Black",
      Impact,
      Inter,
      system-ui,
      sans-serif;
    font-size: clamp(24px, 4.4vw, 50px);
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    text-shadow:
      4px 4px 0 var(--overlay-shadow),
      0 0 18px var(--overlay-shadow-color);
  }

  .sg-schedule-main {
    min-width: 0;
  }

  .sg-schedule-main h2 {
    margin: 0;
    color: var(--overlay-text);
    font-size: clamp(20px, 3.5vw, 42px);
    font-weight: 400;
    line-height: 0.98;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    text-shadow:
      4px 4px 0 var(--overlay-shadow),
      0 0 18px rgba(0, 0, 0, 0.85);
  }

  .sg-schedule-main p {
    margin: 5px 0 0;
    color: var(--overlay-muted);
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    font-size: clamp(10px, 1.6vw, 18px);
    font-weight: 1000;
    line-height: 1.1;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sg-schedule-runner {
    color: var(--overlay-secondary);
    font-size: clamp(16px, 2.5vw, 32px);
    font-weight: 400;
    line-height: 1;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    text-shadow:
      4px 4px 0 var(--overlay-shadow),
      0 0 18px var(--overlay-shadow-color);
  }

  .sg-schedule-empty {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    padding: 18px;
    color: var(--overlay-muted);
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    font-size: clamp(18px, 2.8vw, 34px);
    font-weight: 900;
    text-align: center;
  }

  .sg-schedule-footer {
    display: none;
  }


  .sg-schedule-ticker-root {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: stretch;
    background: transparent;
    pointer-events: none;
    overflow: hidden;
  }

  .sg-schedule-ticker {
    width: 100vw;
    min-height: 58px;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: stretch;
    border: 2px solid rgba(0, 0, 0, 0.75);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.18), transparent 42%),
      linear-gradient(90deg, color-mix(in srgb, var(--overlay-primary) 80%, #111827), color-mix(in srgb, var(--overlay-secondary) 88%, #111827));
    box-shadow:
      0 0 16px var(--overlay-shadow-color),
      inset 0 0 0 1px rgba(255,255,255,0.12);
    overflow: hidden;
  }

  .sg-ticker-label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 20px;
    background:
      linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.18)),
      color-mix(in srgb, var(--overlay-secondary) 78%, #111827);
    color: var(--overlay-text);
    font-family:
      "Arial Black",
      Impact,
      Inter,
      system-ui,
      sans-serif;
    font-size: clamp(16px, 2.4vw, 30px);
    font-weight: 1000;
    line-height: 1;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
    text-shadow:
      3px 3px 0 var(--overlay-shadow),
      0 0 14px rgba(0,0,0,0.9);
  }

  .sg-ticker-items {
    min-width: 0;
    display: flex;
    align-items: stretch;
    overflow: hidden;
  }

  .sg-ticker-segment {
    position: relative;
    min-width: 0;
    flex: 1 1 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    column-gap: 12px;
    padding: 6px 22px 6px 28px;
    clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 50%, calc(100% - 22px) 100%, 0 100%, 22px 50%);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.30), rgba(0,0,0,0.10)),
      color-mix(in srgb, var(--overlay-primary) 70%, #111827);
    border-left: 2px solid rgba(0,0,0,0.65);
    border-right: 2px solid rgba(255,255,255,0.16);
  }

  .sg-ticker-segment:nth-child(2n) {
    background:
      linear-gradient(180deg, rgba(255,255,255,0.24), rgba(0,0,0,0.14)),
      color-mix(in srgb, var(--overlay-secondary) 74%, #111827);
  }

  .sg-ticker-time {
    color: var(--overlay-accent);
    font-family:
      "Arial Black",
      Impact,
      Inter,
      system-ui,
      sans-serif;
    font-size: clamp(18px, 2.8vw, 34px);
    font-weight: 1000;
    line-height: 1;
    white-space: nowrap;
    text-shadow:
      3px 3px 0 rgba(0,0,0,0.75),
      0 0 12px rgba(0,0,0,0.85);
  }

  .sg-ticker-main {
    min-width: 0;
    color: var(--overlay-text);
  }

  .sg-ticker-game {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--overlay-text);
    font-size: clamp(14px, 2.25vw, 28px);
    font-weight: 400;
    line-height: 1;
    white-space: nowrap;
    text-transform: uppercase;
    text-shadow:
      3px 3px 0 rgba(0,0,0,0.75),
      0 0 10px rgba(0,0,0,0.85);
  }

  .sg-ticker-meta {
    display: block;
    max-width: 100%;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(248, 250, 252, 0.88);
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    font-size: clamp(9px, 1.25vw, 15px);
    font-weight: 1000;
    line-height: 1;
    letter-spacing: 0.04em;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .sg-ticker-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 58px;
    padding: 0 22px;
    color: var(--overlay-text);
    font-size: clamp(16px, 2.3vw, 28px);
    font-weight: 400;
    text-transform: uppercase;
  }

  @media (max-width: 700px) {
    .sg-schedule-header {
      grid-template-columns: 1fr;
      gap: 4px;
    }

    .sg-schedule-header span {
      display: none;
    }

    .sg-schedule-row {
      grid-template-columns: 90px 1fr;
      padding: 7px 16px;
    }

    .sg-schedule-runner {
      display: none;
    }
  }
`;

function getView() {
  if (typeof window === "undefined") {
    return "current-run";
  }

  return new URLSearchParams(
    window.location.search
  ).get("view") ?? "current-run";
}

function getQueryParam(
  key: string,
  fallback = ""
) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return new URLSearchParams(
    window.location.search
  ).get(key) ?? fallback;
}

function sanitizeFontName(
  value: string
) {
  const clean =
    String(value || "Berani")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "");

  return clean || "Berani";
}

function sanitizeFontExt(
  value: string
) {
  const clean =
    String(value || "ttf")
      .trim()
      .toLowerCase();

  if (
    clean === "ttf" ||
    clean === "otf" ||
    clean === "woff" ||
    clean === "woff2"
  ) {
    return clean;
  }

  return "ttf";
}

function getFontFormat(
  extension: string
) {
  switch (extension) {
    case "otf":
      return "opentype";
    case "woff":
      return "woff";
    case "woff2":
      return "woff2";
    default:
      return "truetype";
  }
}

function getThemeClass(
  seasonKey?: string | null
) {
  if (seasonKey === "Winter") {
    return "theme-winter";
  }

  if (
    seasonKey === "Autumn" ||
    seasonKey === "Fall"
  ) {
    return "theme-autumn";
  }

  return "theme-summer";
}

function parseDisplayData(
  item?: StreamQueueItem | null
): DisplayData {
  if (!item?.displayDataJson) {
    return {};
  }

  try {
    const parsed =
      JSON.parse(item.displayDataJson);

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return parsed as DisplayData;
    }
  } catch {
    return {};
  }

  return {};
}

function getNextItem(
  panelData: StreamPanelData
) {
  return panelData.queue.find(
    (item) =>
      item.id !== panelData.currentItem?.id
  ) ?? null;
}

function getMainTitle(
  item?: StreamQueueItem | null,
  data?: DisplayData
) {
  return data?.gameName ||
    item?.title ||
    "SGames";
}

function getSubtitle(
  item?: StreamQueueItem | null,
  data?: DisplayData
) {
  const pieces = [
    data?.categoryName,
    data?.platformName,
  ].filter(Boolean);

  if (pieces.length > 0) {
    return pieces.join(" · ");
  }

  return item?.subtitle ||
    "Speedrun Event";
}

function getRunnerLine(
  item?: StreamQueueItem | null,
  data?: DisplayData
) {
  if (data?.runnerName && data?.runner2Name) {
    return `${data.runnerName} vs ${data.runner2Name}`;
  }

  return data?.runnerName ||
    item?.sourceLabel ||
    "Runner";
}

function getGameName(
  item?: StreamQueueItem | null,
  data?: DisplayData
) {
  return data?.gameName ||
    item?.title ||
    "Juego";
}

function getCategoryName(
  item?: StreamQueueItem | null,
  data?: DisplayData
) {
  return data?.categoryName ||
    item?.subtitle ||
    "Categoría";
}

function getEstimateText(
  data?: DisplayData
) {
  return data?.estimate ||
    "00:00:00";
}

function getPlatformName(
  item?: StreamQueueItem | null,
  data?: DisplayData
) {
  return data?.consoleName ||
    data?.platformName ||
    "Consola";
}

function formatReleaseDateText(
  value?: string
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "es-MX",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  );
}

function getReleaseDateText(
  data?: DisplayData
) {
  const value =
    data?.gameReleaseDate ||
    data?.releaseDate ||
    "";

  const formatted =
    formatReleaseDateText(value);

  return formatted ||
    "Fecha por definir";
}

function normalizeScheduleEntries(
  response?: PublicScheduleResponse | null
) {
  const entries =
    response?.entries ??
    response?.Entries ??
    [];

  return entries
    .map((entry) => {
      const dayDate =
        entry.dayDate ??
        entry.DayDate ??
        "";

      const startTime =
        entry.startTime ??
        entry.StartTime ??
        "";

      return {
        id:
          entry.id ??
          `${dayDate}-${startTime}-${entry.game ?? entry.Game ?? ""}`,

        dayDate:
          String(dayDate),

        startTime:
          String(startTime).slice(0, 5),

        durationMinutes:
          Number(
            entry.durationMinutes ??
            entry.DurationMinutes ??
            0),

        runnerName:
          entry.runnerName ??
          entry.RunnerName ??
          "Runner",

        game:
          entry.game ??
          entry.Game ??
          "Run",

        category:
          entry.category ??
          entry.Category ??
          "Categoría",

        platform:
          entry.platform ??
          entry.Platform ??
          "Plataforma",

        runStatus:
          entry.runStatus ??
          entry.RunStatus ??
          null,
      };
    })
    .filter((entry) =>
      Boolean(entry.dayDate) &&
      Boolean(entry.startTime))
    .sort((a, b) =>
      `${a.dayDate} ${a.startTime}`.localeCompare(
        `${b.dayDate} ${b.startTime}`));
}

function formatScheduleDay(
  value: string
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "es-MX",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }
  );
}

function CurrentRunView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <section className="sg-text-only center">
      <div className="sg-text-stack">
        <div className="sg-kicker">
          <Gamepad2 size={24} />
          Run actual
        </div>

        <h1 className="sg-text-title">
          {getRunnerLine(item, data)}
        </h1>

        <h2 className="sg-text-subtitle">
          {getMainTitle(item, data)}
        </h2>

        <p className="sg-text-meta">
          {getSubtitle(item, data)}
          {data.estimate ? ` · Est. ${data.estimate}` : ""}
        </p>
      </div>
    </section>
  );
}

function NextRunView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    getNextItem(panelData) ||
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <section className="sg-text-only left sg-next-run-text">
      <div className="sg-text-stack">
        <div className="sg-kicker">
          <Clock size={24} />
          Siguiente run
        </div>

        <h1 className="sg-text-title">
          {getMainTitle(item, data)}
        </h1>

        <h2 className="sg-text-subtitle">
          {getRunnerLine(item, data)}
        </h2>

        <p className="sg-text-meta">
          {getSubtitle(item, data)}
        </p>
      </div>
    </section>
  );
}

function RunnerTagView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <section className="sg-runner-tag-text">
      <h1>
        {getRunnerLine(item, data)}
      </h1>
    </section>
  );
}

function SingleFieldView({
  value,
  tone = "default",
  small = false,
}: {
  value: string;
  tone?: "default" | "secondary" | "accent";
  small?: boolean;
}) {
  const classNames = [
    "sg-single-field",
    tone === "secondary" ? "is-secondary" : "",
    tone === "accent" ? "is-accent" : "",
    small ? "is-small" : "",
    value.length > 12 && tone === "accent" ? "is-estimate" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classNames}>
      <h1>
        {value}
      </h1>
    </section>
  );
}

function GameNameView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <SingleFieldView
      value={getGameName(item, data)}
      small
    />
  );
}

function CategoryNameView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <SingleFieldView
      value={getCategoryName(item, data)}
      tone="secondary"
      small
    />
  );
}

function EstimateView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <SingleFieldView
      value={`EST: ${getEstimateText(data)}`}
      tone="accent"
    />
  );
}

function PlatformNameView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <SingleFieldView
      value={getPlatformName(item, data)}
      tone="accent"
      small
    />
  );
}

function ReleaseDateView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <SingleFieldView
      value={getReleaseDateText(data)}
      tone="secondary"
      small
    />
  );
}

function RunInfoTextView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <section className="sg-text-only center">
      <div className="sg-text-stack">
        <div className="sg-kicker">
          <Users size={24} />
          Info runner
        </div>

        <h1 className="sg-text-title">
          {getRunnerLine(item, data)}
        </h1>

        <h2 className="sg-text-subtitle">
          {getMainTitle(item, data)}
        </h2>

        <p className="sg-text-meta">
          {data.commentators
            ? `Comentaristas: ${data.commentators}`
            : getSubtitle(item, data)}
        </p>
      </div>
    </section>
  );
}

function ScheduleTickerView({
  panelData,
  schedule,
}: {
  panelData: StreamPanelData;
  schedule: PublicScheduleResponse | null;
}) {
  const entries =
    normalizeScheduleEntries(schedule);

  const itemsParam =
    Number(
      getQueryParam("items", "3")
    );

  const pageSize =
    Number.isFinite(itemsParam) &&
    itemsParam > 0
      ? Math.min(5, Math.max(1, Math.floor(itemsParam)))
      : 3;

  const pageCount =
    Math.max(
      1,
      Math.ceil(entries.length / pageSize)
    );

  const currentPage =
    Math.floor(Date.now() / 6500) % pageCount;

  const visibleEntries =
    entries.slice(
      currentPage * pageSize,
      currentPage * pageSize + pageSize);

  const eventName =
    schedule?.event ??
    schedule?.Event ??
    panelData.eventName ??
    "SGames";

  return (
    <section className="sg-schedule-ticker-root">
      <div className="sg-schedule-ticker">
        <div className="sg-ticker-label">
          Horario
        </div>

        {visibleEntries.length > 0 ? (
          <div className="sg-ticker-items">
            {visibleEntries.map((entry) => (
              <article
                key={entry.id}
                className="sg-ticker-segment"
              >
                <div className="sg-ticker-time">
                  {entry.startTime}
                </div>

                <div className="sg-ticker-main">
                  <span className="sg-ticker-game">
                    {entry.game}
                  </span>

                  <span className="sg-ticker-meta">
                    {entry.runnerName} · {formatScheduleDay(entry.dayDate)} · {entry.category} · {entry.platform}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sg-ticker-empty">
            {eventName} · Horario pendiente
          </div>
        )}
      </div>
    </section>
  );
}

function ScheduleCarouselView({
  panelData,
  schedule,
}: {
  panelData: StreamPanelData;
  schedule: PublicScheduleResponse | null;
}) {
  const entries =
    normalizeScheduleEntries(schedule);

  const rowsParam =
    Number(
      getQueryParam("rows", "2")
    );

  const pageSize =
    Number.isFinite(rowsParam) &&
    rowsParam > 0
      ? Math.min(4, Math.max(1, Math.floor(rowsParam)))
      : 2;

  const pageCount =
    Math.max(
      1,
      Math.ceil(entries.length / pageSize)
    );

  const currentPage =
    Math.floor(Date.now() / 8500) % pageCount;

  const visibleEntries =
    entries.slice(
      currentPage * pageSize,
      currentPage * pageSize + pageSize);

  return (
    <section className="sg-schedule-root">
      <div className="sg-schedule-card">
        <header className="sg-schedule-header">
          <h1>
            Horario del evento
          </h1>

          <span>
            {(schedule?.event ??
              schedule?.Event ??
              panelData.eventName)}
          </span>
        </header>

        {visibleEntries.length > 0 ? (
          <div className="sg-schedule-list">
            {visibleEntries.map((entry) => (
              <article
                key={entry.id}
                className="sg-schedule-row"
              >
                <div className="sg-schedule-time">
                  {entry.startTime}
                </div>

                <div className="sg-schedule-main">
                  <h2>
                    {entry.game}
                  </h2>

                  <p>
                    {formatScheduleDay(entry.dayDate)} · {entry.category} · {entry.platform}
                  </p>
                </div>

                <div className="sg-schedule-runner">
                  {entry.runnerName}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sg-schedule-empty">
            El horario público aparecerá aquí cuando esté publicado.
          </div>
        )}

        <footer className="sg-schedule-footer">
          <span>
            Página {currentPage + 1} / {pageCount}
          </span>

          <span>
            Super Games
          </span>
        </footer>
      </div>
    </section>
  );
}

async function getCurrentPublicSchedule() {
  const response =
    await fetch(
      `${API_URL}/Schedule/public-current?t=${Date.now()}`,
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    return null;
  }

  return await response.json() as PublicScheduleResponse;
}

export default function StreamDynamicOverlayPage() {
  const [panelData, setPanelData] =
    useState<StreamPanelData | null>(null);

  const [schedule, setSchedule] =
    useState<PublicScheduleResponse | null>(null);

  const view =
    useMemo(
      () => getView(),
      []
    );

  const fontName =
    sanitizeFontName(
      getQueryParam("font", "Berani")
    );

  const fontExt =
    sanitizeFontExt(
      getQueryParam("fontExt", "ttf")
    );

  const overlayCss =
    useMemo(
      () =>
        overlayStyles
          .split("OVERLAY_FONT_NAME")
          .join(fontName)
          .split("OVERLAY_FONT_EXT")
          .join(fontExt)
          .split("OVERLAY_FONT_FORMAT")
          .join(getFontFormat(fontExt)),
      [
        fontName,
        fontExt,
      ]
    );

  useEffect(() => {
    let cancelled =
      false;

    async function loadPanel() {
      try {
        const data =
          await getStreamPanelPublic();

        if (!cancelled) {
          setPanelData(data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadPanel();

    const interval =
      window.setInterval(
        loadPanel,
        2500
      );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled =
      false;

    async function loadSchedule() {
      try {
        const data =
          await getCurrentPublicSchedule();

        if (!cancelled) {
          setSchedule(data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadSchedule();

    const interval =
      window.setInterval(
        loadSchedule,
        30000
      );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (!panelData) {
    return (
      <main className="dynamic-overlay-root">
        <style>{overlayCss}</style>
      </main>
    );
  }

  const themeClass =
    getThemeClass(
      panelData.seasonKey
    );

  return (
    <main className={`dynamic-overlay-root ${themeClass}`}>
      <style>{overlayCss}</style>

      {view === "next-run" && (
        <NextRunView panelData={panelData} />
      )}

      {view === "runner-tag" && (
        <RunnerTagView panelData={panelData} />
      )}

      {view === "game-name" && (
        <GameNameView panelData={panelData} />
      )}

      {view === "category-name" && (
        <CategoryNameView panelData={panelData} />
      )}

      {view === "estimate" && (
        <EstimateView panelData={panelData} />
      )}

      {view === "platform-name" && (
        <PlatformNameView panelData={panelData} />
      )}

      {view === "release-date" && (
        <ReleaseDateView panelData={panelData} />
      )}

      {(view === "event-schedule-horizontal" ||
        view === "schedule-ticker") && (
        <ScheduleTickerView
          panelData={panelData}
          schedule={schedule}
        />
      )}

      {(view === "info-bar" ||
        view === "event-schedule") && (
        <ScheduleCarouselView
          panelData={panelData}
          schedule={schedule}
        />
      )}

      {(view === "intermission" ||
        view === "runner-info") && (
        <RunInfoTextView panelData={panelData} />
      )}

      {view !== "next-run" &&
        view !== "runner-tag" &&
        view !== "info-bar" &&
        view !== "event-schedule" &&
        view !== "event-schedule-horizontal" &&
        view !== "schedule-ticker" &&
        view !== "game-name" &&
        view !== "category-name" &&
        view !== "estimate" &&
        view !== "platform-name" &&
        view !== "release-date" &&
        view !== "intermission" &&
        view !== "runner-info" && (
          <CurrentRunView panelData={panelData} />
        )}
    </main>
  );
}

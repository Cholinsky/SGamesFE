import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Clock,
  Gamepad2,
  MessageSquare,
  Radio,
  User,
  Users,
  Zap,
} from "lucide-react";
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
  estimate?: string;
  commentators?: string;
  language?: string;
  pronouns?: string;
  note?: string;
};

const overlayStyles = `
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
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .dynamic-overlay-root * {
    box-sizing: border-box;
  }

  .theme-summer {
    --overlay-primary: #22d3ee;
    --overlay-secondary: #d946ef;
    --overlay-accent: #facc15;
    --overlay-bg: rgba(12, 10, 50, 0.84);
    --overlay-bg-soft: rgba(30, 27, 75, 0.82);
    --overlay-border: rgba(34, 211, 238, 0.52);
    --overlay-shadow: rgba(217, 70, 239, 0.35);
  }

  .theme-autumn,
  .theme-fall {
    --overlay-primary: #94a3b8;
    --overlay-secondary: #ef4444;
    --overlay-accent: #fca5a5;
    --overlay-bg: rgba(3, 5, 7, 0.88);
    --overlay-bg-soft: rgba(15, 23, 42, 0.84);
    --overlay-border: rgba(239, 68, 68, 0.50);
    --overlay-shadow: rgba(239, 68, 68, 0.32);
  }

  .theme-winter {
    --overlay-primary: #bfdbfe;
    --overlay-secondary: #38bdf8;
    --overlay-accent: #e0f2fe;
    --overlay-bg: rgba(2, 6, 23, 0.86);
    --overlay-bg-soft: rgba(15, 23, 42, 0.82);
    --overlay-border: rgba(56, 189, 248, 0.52);
    --overlay-shadow: rgba(56, 189, 248, 0.34);
  }

  .sg-dynamic-panel {
    border: 1px solid var(--overlay-border);
    background:
      linear-gradient(135deg, var(--overlay-bg), var(--overlay-bg-soft)),
      radial-gradient(circle at 8% 8%, color-mix(in srgb, var(--overlay-secondary), transparent 70%), transparent 28rem);
    box-shadow:
      0 0 36px rgba(0, 0, 0, 0.72),
      0 0 26px var(--overlay-shadow),
      inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px);
  }

  .sg-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid var(--overlay-border);
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.35);
    color: var(--overlay-accent);
    padding: 0.26rem 0.7rem;
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .sg-current-run {
    position: absolute;
    left: 3.5vw;
    right: 3.5vw;
    bottom: 5.2vh;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: end;
  }

  .sg-current-main {
    min-width: 0;
    border-radius: 1.35rem;
    padding: 1rem 1.25rem;
  }

  .sg-current-main h1 {
    margin: 0.45rem 0 0;
    color: #ffffff;
    font-size: clamp(2.3rem, 5vw, 5.6rem);
    font-weight: 1000;
    line-height: 0.92;
    letter-spacing: -0.055em;
    text-shadow: 0 3px 18px rgba(0,0,0,0.8), 0 0 20px var(--overlay-shadow);
  }

  .sg-current-main h2 {
    margin: 0.3rem 0 0;
    color: var(--overlay-primary);
    font-size: clamp(1.1rem, 2vw, 2.1rem);
    font-weight: 900;
  }

  .sg-current-meta {
    display: grid;
    gap: 0.55rem;
    min-width: min(34vw, 30rem);
    border-radius: 1.35rem;
    padding: 1rem 1.15rem;
  }

  .sg-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: #cbd5e1;
    font-size: clamp(0.9rem, 1.2vw, 1.15rem);
    font-weight: 800;
  }

  .sg-meta-row strong {
    color: #fff;
    text-align: right;
  }

  .sg-runner-tag {
    position: absolute;
    left: 3vw;
    top: 41vh;
    min-width: 18rem;
    max-width: 34rem;
    border-radius: 0.9rem;
    padding: 0.85rem 1.1rem;
  }

  .sg-runner-tag span {
    color: var(--overlay-primary);
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .sg-runner-tag h1 {
    margin: 0.15rem 0 0;
    color: #ffffff;
    font-size: clamp(1.6rem, 3vw, 3.2rem);
    font-weight: 1000;
    line-height: 0.95;
  }

  .sg-info-bar {
    position: absolute;
    left: 5vw;
    right: 5vw;
    bottom: 4vh;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-radius: 1rem;
    padding: 0.85rem 1.1rem;
  }

  .sg-info-icon {
    display: flex;
    height: 3.2rem;
    width: 3.2rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.8rem;
    background: color-mix(in srgb, var(--overlay-secondary), transparent 65%);
    color: var(--overlay-accent);
  }

  .sg-info-bar h1 {
    margin: 0;
    color: #fff;
    font-size: clamp(1.2rem, 2vw, 2.1rem);
    font-weight: 950;
  }

  .sg-info-bar p {
    margin: 0.1rem 0 0;
    color: #cbd5e1;
    font-size: clamp(0.9rem, 1.2vw, 1.15rem);
    font-weight: 700;
  }

  .sg-next-run {
    position: absolute;
    right: 4vw;
    bottom: 5vh;
    width: min(52rem, 58vw);
    border-radius: 1.25rem;
    padding: 1rem 1.25rem;
  }

  .sg-next-run h1 {
    margin: 0.35rem 0 0;
    color: #fff;
    font-size: clamp(1.8rem, 3.5vw, 4rem);
    font-weight: 1000;
    line-height: 0.94;
    letter-spacing: -0.04em;
  }

  .sg-next-run p {
    margin: 0.35rem 0 0;
    color: var(--overlay-primary);
    font-size: clamp(1rem, 1.6vw, 1.6rem);
    font-weight: 850;
  }

  .sg-intermission {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5vw;
  }

  .sg-intermission-card {
    width: min(70rem, 82vw);
    border-radius: 2rem;
    padding: clamp(2rem, 5vw, 5rem);
    text-align: center;
  }

  .sg-intermission-card h1 {
    margin: 0.8rem 0 0;
    color: #fff;
    font-size: clamp(3rem, 7vw, 8rem);
    font-weight: 1000;
    line-height: 0.85;
    letter-spacing: -0.07em;
  }

  .sg-intermission-card p {
    margin: 1rem auto 0;
    max-width: 54rem;
    color: #cbd5e1;
    font-size: clamp(1.2rem, 2vw, 2rem);
    font-weight: 800;
  }

  @media (max-width: 900px) {
    .sg-current-run {
      grid-template-columns: 1fr;
    }

    .sg-current-meta {
      min-width: 0;
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
    <div className="sg-current-run">
      <section className="sg-dynamic-panel sg-current-main">
        <span className="sg-pill">
          <Gamepad2 size={14} />
          RUN ACTUAL
        </span>

        <h1>
          {getMainTitle(item, data)}
        </h1>

        <h2>
          {getSubtitle(item, data)}
        </h2>
      </section>

      <aside className="sg-dynamic-panel sg-current-meta">
        <div className="sg-meta-row">
          <span>Runner</span>
          <strong>{getRunnerLine(item, data)}</strong>
        </div>

        <div className="sg-meta-row">
          <span>Estimado</span>
          <strong>{data.estimate || "--:--:--"}</strong>
        </div>

        <div className="sg-meta-row">
          <span>Comentaristas</span>
          <strong>{data.commentators || "Staff"}</strong>
        </div>

        <div className="sg-meta-row">
          <span>Idioma</span>
          <strong>{data.language || "ES"}</strong>
        </div>
      </aside>
    </div>
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
    <section className="sg-dynamic-panel sg-next-run">
      <span className="sg-pill">
        <Clock size={14} />
        SIGUIENTE RUN
      </span>

      <h1>
        {getMainTitle(item, data)}
      </h1>

      <p>
        {getRunnerLine(item, data)} · {getSubtitle(item, data)}
      </p>
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
    <section className="sg-dynamic-panel sg-runner-tag">
      <span>
        RUNNER
      </span>

      <h1>
        {getRunnerLine(item, data)}
      </h1>
    </section>
  );
}

function InfoBarView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  const data =
    parseDisplayData(item);

  return (
    <section className="sg-dynamic-panel sg-info-bar">
      <div className="sg-info-icon">
        <MessageSquare size={24} />
      </div>

      <div>
        <h1>
          {item?.title ||
            panelData.settings.overlayHeadline ||
            panelData.eventName}
        </h1>

        <p>
          {data.note ||
            item?.detailText ||
            item?.subtitle ||
            panelData.settings.overlaySubheadline ||
            panelData.settings.streamStatus ||
            "Información del stream"}
        </p>
      </div>
    </section>
  );
}

function IntermissionView({
  panelData,
}: {
  panelData: StreamPanelData;
}) {
  const item =
    panelData.currentItem;

  return (
    <section className="sg-intermission">
      <div className="sg-dynamic-panel sg-intermission-card">
        <span className="sg-pill">
          <Radio size={14} />
          {panelData.settings.streamStatus || "INTERMEDIO"}
        </span>

        <h1>
          {item?.title ||
            panelData.settings.overlayHeadline ||
            "SGames"}
        </h1>

        <p>
          {item?.detailText ||
            item?.subtitle ||
            panelData.settings.overlaySubheadline ||
            "Volvemos en un momento"}
        </p>
      </div>
    </section>
  );
}

export default function StreamDynamicOverlayPage() {
  const [panelData, setPanelData] =
    useState<StreamPanelData | null>(null);

  const view =
    useMemo(
      () => getView(),
      []
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

  if (!panelData) {
    return (
      <main className="dynamic-overlay-root">
        <style>{overlayStyles}</style>
      </main>
    );
  }

  const themeClass =
    getThemeClass(
      panelData.seasonKey
    );

  return (
    <main className={`dynamic-overlay-root ${themeClass}`}>
      <style>{overlayStyles}</style>

      {view === "next-run" && (
        <NextRunView panelData={panelData} />
      )}

      {view === "runner-tag" && (
        <RunnerTagView panelData={panelData} />
      )}

      {view === "info-bar" && (
        <InfoBarView panelData={panelData} />
      )}

      {view === "intermission" && (
        <IntermissionView panelData={panelData} />
      )}

      {view !== "next-run" &&
        view !== "runner-tag" &&
        view !== "info-bar" &&
        view !== "intermission" && (
          <CurrentRunView panelData={panelData} />
        )}
    </main>
  );
}
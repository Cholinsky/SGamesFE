import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Radio,
  Zap,
} from "lucide-react";
import {
  getStreamPanelPublic,
  type StreamPanelData,
  type StreamQueueItem,
} from "../services/streamPanelService";


const overlayStyles = `
  html,
  body,
  #root {
    background: transparent !important;
  }

  .stream-overlay-root {
    min-height: 100vh;
    width: 100vw;
    overflow: hidden;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    color: white;
  }

  .stream-overlay-transparent {
    background: transparent;
  }

  .stream-overlay-full {
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.26), transparent 32rem),
      radial-gradient(circle at 80% 20%, rgba(148, 163, 184, 0.16), transparent 30rem),
      linear-gradient(180deg, rgba(3, 5, 7, 0.96), rgba(3, 5, 7, 0.98));
  }

  .stream-lower-third {
    position: absolute;
    left: 5vw;
    right: 5vw;
    bottom: 7vh;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: stretch;
  }

  .stream-icon {
    display: flex;
    height: 5.5rem;
    width: 5.5rem;
    align-items: center;
    justify-content: center;
    border-radius: 1.6rem;
    border: 1px solid rgba(239, 68, 68, 0.45);
    background:
      radial-gradient(circle at 30% 15%, rgba(148, 163, 184, 0.28), transparent 65%),
      linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(127, 29, 29, 0.85));
    box-shadow:
      0 0 34px rgba(239, 68, 68, 0.30),
      inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  .stream-icon svg {
    height: 2.3rem;
    width: 2.3rem;
    color: #ef4444;
    filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.70));
  }

  .stream-card {
    border: 1px solid rgba(239, 68, 68, 0.42);
    border-radius: 1.6rem;
    background:
      linear-gradient(135deg, rgba(3, 5, 7, 0.88), rgba(15, 23, 42, 0.82), rgba(127, 29, 29, 0.72));
    box-shadow:
      0 0 44px rgba(0, 0, 0, 0.70),
      0 0 34px rgba(239, 68, 68, 0.22),
      inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    padding: 1.25rem 1.5rem;
    backdrop-filter: blur(12px);
  }

  .stream-card-compact {
    position: absolute;
    right: 4vw;
    bottom: 5vh;
    max-width: 42rem;
    padding: 0.9rem 1.1rem;
  }

  .stream-card-error {
    position: absolute;
    left: 3vw;
    bottom: 3vh;
    color: #fca5a5;
  }

  .stream-card-top {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.55rem;
  }

  .stream-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.18);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.38);
    padding: 0.22rem 0.7rem;
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0.18em;
  }

  .stream-source {
    color: #cbd5e1;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .stream-card h1 {
    margin: 0;
    color: #f8fafc;
    font-size: clamp(2rem, 4vw, 4.4rem);
    font-weight: 1000;
    line-height: 0.95;
    letter-spacing: -0.05em;
    text-shadow:
      0 2px 16px rgba(0, 0, 0, 0.80),
      0 0 24px rgba(239, 68, 68, 0.28);
  }

  .stream-card-compact h1 {
    font-size: clamp(1.3rem, 2.5vw, 2.4rem);
  }

  .stream-card h2 {
    margin: 0.35rem 0 0;
    color: #cbd5e1;
    font-size: clamp(1.15rem, 2.2vw, 2rem);
    font-weight: 800;
  }

  .stream-card p {
    margin: 0.65rem 0 0;
    max-width: 70rem;
    color: #94a3b8;
    font-size: clamp(0.95rem, 1.6vw, 1.25rem);
    line-height: 1.35;
  }

  .stream-full-panel {
    width: min(88vw, 86rem);
  }

  .stream-full-header {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 2rem;
  }

  .stream-full-header h1 {
    margin: 0.2rem 0 0;
    color: #f8fafc;
    font-size: clamp(3rem, 7vw, 7rem);
    font-weight: 1000;
    line-height: 0.9;
    letter-spacing: -0.06em;
  }

  .stream-eyebrow {
    color: #fca5a5;
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: 0.28em;
    text-transform: uppercase;
  }

  .stream-live-icon {
    height: 4.2rem;
    width: 4.2rem;
    color: #ef4444;
    filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.70));
  }

  .stream-next {
    margin-top: 1rem;
    display: grid;
    gap: 0.15rem;
    border-radius: 1.3rem;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(15, 23, 42, 0.58);
    padding: 1rem 1.25rem;
  }

  .stream-next span {
    color: #fca5a5;
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.22em;
  }

  .stream-next strong {
    color: #f8fafc;
    font-size: 1.35rem;
  }

  .stream-next small {
    color: #94a3b8;
    font-size: 0.95rem;
  }
`;

function getMode() {
  if (typeof window === "undefined") {
    return "lower";
  }

  return new URLSearchParams(
    window.location.search
  ).get("mode") ?? "lower";
}

function getItemTypeLabel(
  type?: string | null
) {
  switch (type) {
    case "Category":
      return "CATEGORÍA";

    case "Break":
      return "BREAK";

    case "Message":
      return "MENSAJE";

    case "Custom":
      return "INFO";

    case "Run":
    default:
      return "RUN";
  }
}

function CurrentItemBlock({
  item,
  panelData,
  compact = false,
}: {
  item?: StreamQueueItem | null;
  panelData: StreamPanelData;
  compact?: boolean;
}) {
  const title =
    item?.title ||
    panelData.settings.overlayHeadline ||
    panelData.settings.streamTitle ||
    panelData.eventName;

  const subtitle =
    item?.subtitle ||
    panelData.settings.overlaySubheadline ||
    panelData.settings.streamStatus ||
    "Speedrun Event";

  const detail =
    item?.detailText ||
    panelData.settings.currentSceneNotes ||
    panelData.settings.streamDescription;

  return (
    <div className={
      compact
        ? "stream-card stream-card-compact"
        : "stream-card"
    }>
      <div className="stream-card-top">
        <span className="stream-pill">
          {item
            ? getItemTypeLabel(item.itemType)
            : "STREAM"}
        </span>

        {item?.sourceLabel && (
          <span className="stream-source">
            {item.sourceLabel}
          </span>
        )}
      </div>

      <h1>
        {title}
      </h1>

      {subtitle && (
        <h2>
          {subtitle}
        </h2>
      )}

      {!compact && detail && (
        <p>
          {detail}
        </p>
      )}
    </div>
  );
}

export default function StreamOverlayPage() {
  const [panelData, setPanelData] =
    useState<StreamPanelData | null>(null);

  const [error, setError] =
    useState("");

  const mode =
    useMemo(
      () => getMode(),
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
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("No se pudo cargar el overlay");
        }
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

  const nextItem =
    panelData?.queue?.find(
      (item) =>
        item.id !== panelData.currentItem?.id
    ) ?? null;

  if (!panelData) {
    return (
      <main className="stream-overlay-root stream-overlay-transparent">
        <style>{overlayStyles}</style>
        {error && (
          <div className="stream-card stream-card-error">
            {error}
          </div>
        )}
      </main>
    );
  }

  if (mode === "compact") {
    return (
      <main className="stream-overlay-root stream-overlay-transparent">
        <style>{overlayStyles}</style>
        <CurrentItemBlock
          item={panelData.currentItem}
          panelData={panelData}
          compact
        />
      </main>
    );
  }

  if (mode === "full") {
    return (
      <main className="stream-overlay-root stream-overlay-full">
        <style>{overlayStyles}</style>
        <section className="stream-full-panel">
          <div className="stream-full-header">
            <div>
              <span className="stream-eyebrow">
                {panelData.settings.streamStatus ||
                  "STREAM"}
              </span>

              <h1>
                {panelData.settings.streamTitle ||
                  panelData.eventName}
              </h1>
            </div>

            <Radio className="stream-live-icon" />
          </div>

          <CurrentItemBlock
            item={panelData.currentItem}
            panelData={panelData}
          />

          {nextItem && (
            <div className="stream-next">
              <span>
                SIGUIENTE
              </span>

              <strong>
                {nextItem.title}
              </strong>

              {nextItem.subtitle && (
                <small>
                  {nextItem.subtitle}
                </small>
              )}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="stream-overlay-root stream-overlay-transparent">
      <style>{overlayStyles}</style>
      <div className="stream-lower-third">
        <div className="stream-icon">
          <Zap />
        </div>

        <CurrentItemBlock
          item={panelData.currentItem}
          panelData={panelData}
        />
      </div>
    </main>
  );
}
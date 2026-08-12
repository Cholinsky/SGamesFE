import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  calculateVisibleElapsedMs,
  formatTimerMs,
  getPublicStreamTimers,
  type StreamTimer,
} from "../services/streamTimerService";

function useQueryParam(
  name: string
) {
  return useMemo(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return params.get(name);
  }, [
    name,
  ]);
}

function normalizeSeason(
  season?: string | null
) {
  const clean =
    season?.toLowerCase();

  if (clean === "winter") {
    return "winter";
  }

  if (
    clean === "autumn" ||
    clean === "fall"
  ) {
    return "autumn";
  }

  return "summer";
}

function timerAccentClass(
  season: string
) {
  switch (season) {
    case "winter":
      return "sg-timer-season-winter";
    case "autumn":
      return "sg-timer-season-autumn";
    default:
      return "sg-timer-season-summer";
  }
}

function TimerOverlayCard({
  timer,
  nowMs,
  compact = false,
}: {
  timer: StreamTimer;
  nowMs: number;
  compact?: boolean;
}) {
  const elapsed =
    calculateVisibleElapsedMs(
      timer,
      nowMs
    );

  const showGg =
    timer.shouldShowFinishAnimation &&
    timer.finishAnimationEndsAtUtc &&
    new Date(
      timer.finishAnimationEndsAtUtc
    ).getTime() > nowMs;

  const showGl =
    String(timer.status ?? "").toLowerCase() === "running" &&
    elapsed >= 0 &&
    elapsed < 1800;

  return (
    <div className={`sg-stream-timer-card ${compact ? "is-compact" : ""}`}>
      <div className="sg-stream-timer-label">
        {timer.label}
      </div>

      <div className="sg-stream-timer-value">
        {formatTimerMs(elapsed)}
      </div>

      {timer.status === "Stopped" && (
        <div className="sg-stream-timer-final">
          FINAL
        </div>
      )}

      {showGl && !showGg && (
        <div className="sg-stream-timer-gl">
          GL
        </div>
      )}

      {showGg && (
        <div className="sg-stream-timer-gg">
          {timer.finishAnimationText || "GG"}
        </div>
      )}
    </div>
  );
}

export default function StreamTimerOverlayPage() {
  const slotParam =
    useQueryParam("slot");

  const [timers, setTimers] =
    useState<StreamTimer[]>([]);

  const [seasonKey, setSeasonKey] =
    useState("summer");

  const [nowMs, setNowMs] =
    useState(Date.now());

  const slot =
    Number(slotParam || 0);

  const selectedTimer =
    slot >= 1 && slot <= 3
      ? timers.find((timer) =>
          timer.slot === slot
        )
      : null;

  async function loadTimers() {
    try {
      const data =
        await getPublicStreamTimers();

      if (!data) {
        return;
      }

      setTimers(data.timers);
      setSeasonKey(
        normalizeSeason(data.seasonKey)
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadTimers();

    const refresh =
      window.setInterval(() => {
        loadTimers();
      }, 500);

    return () =>
      window.clearInterval(refresh);
  }, []);

  useEffect(() => {
    const tick =
      window.setInterval(() => {
        setNowMs(Date.now());
      }, 50);

    return () =>
      window.clearInterval(tick);
  }, []);

  const seasonClass =
    timerAccentClass(seasonKey);

  return (
    <div className={`sg-stream-timer-overlay ${seasonClass}`}>
      <style>
        {`
          html,
          body,
          #root {
            width: 100%;
            height: 100%;
            margin: 0;
            background: transparent !important;
            overflow: hidden;
          }

          .sg-stream-timer-overlay {
            width: 100vw;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            color: var(--timer-text);
            --timer-text: #ffe66d;
            --timer-shadow: #090014;
            --timer-border: rgba(255, 230, 109, 0.55);
            --timer-bg: rgba(5, 4, 35, 0.88);
            --timer-accent: #ff4fd8;
            --timer-secondary: #43e6ff;
          }

          .sg-timer-season-summer {
            --timer-text: #ffe66d;
            --timer-shadow: #15003d;
            --timer-border: rgba(255, 230, 109, 0.55);
            --timer-bg: rgba(9, 8, 58, 0.9);
            --timer-accent: #ff4fd8;
            --timer-secondary: #43e6ff;
          }

          .sg-timer-season-autumn {
            --timer-text: #f8fafc;
            --timer-shadow: #030712;
            --timer-border: rgba(239, 68, 68, 0.65);
            --timer-bg: rgba(8, 13, 22, 0.92);
            --timer-accent: #ef4444;
            --timer-secondary: #94a3b8;
          }

          .sg-timer-season-winter {
            --timer-text: #ecfeff;
            --timer-shadow: #082f49;
            --timer-border: rgba(103, 232, 249, 0.7);
            --timer-bg: rgba(8, 47, 73, 0.86);
            --timer-accent: #67e8f9;
            --timer-secondary: #dbeafe;
          }

          .sg-stream-timers-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 24px;
            width: min(1760px, 94vw);
          }

          .sg-stream-timer-card {
            position: relative;
            min-width: min(92vw, 760px);
            padding: 24px 36px;
            border: 3px solid var(--timer-border);
            border-radius: 4px;
            background:
              linear-gradient(180deg, rgba(255,255,255,0.07), transparent 40%),
              var(--timer-bg);
            box-shadow:
              0 0 0 5px rgba(0,0,0,0.22),
              0 0 32px color-mix(in srgb, var(--timer-accent) 45%, transparent);
          }

          .sg-stream-timer-card.is-compact {
            min-width: 0;
            padding: 18px 20px;
          }

          .sg-stream-timer-label {
            margin-bottom: 8px;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--timer-secondary);
            text-shadow: 3px 3px 0 var(--timer-shadow);
          }

          .sg-stream-timer-value {
            font-size: clamp(56px, 10vw, 132px);
            line-height: 0.95;
            font-weight: 1000;
            letter-spacing: -0.08em;
            color: var(--timer-text);
            text-shadow:
              5px 5px 0 var(--timer-shadow),
              0 0 24px color-mix(in srgb, var(--timer-text) 35%, transparent);
            font-variant-numeric: tabular-nums;
          }

          .sg-stream-timer-card.is-compact .sg-stream-timer-value {
            font-size: clamp(34px, 4.8vw, 78px);
          }

          .sg-stream-timer-final {
            margin-top: 8px;
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 0.26em;
            color: var(--timer-accent);
            text-shadow: 3px 3px 0 var(--timer-shadow);
          }

          .sg-stream-timer-gl {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: inherit;
            background:
              radial-gradient(circle at center, color-mix(in srgb, var(--timer-secondary) 18%, transparent), transparent 60%),
              rgba(0, 0, 0, 0.42);
            color: var(--timer-text);
            font-size: clamp(70px, 14vw, 190px);
            font-weight: 1000;
            letter-spacing: -0.05em;
            text-shadow:
              7px 7px 0 var(--timer-shadow),
              0 0 26px var(--timer-secondary),
              0 0 42px var(--timer-accent);
            pointer-events: none;
            z-index: 9;
            animation: sgTimerGlStart 1.8s steps(8) forwards;
          }

          .sg-stream-timer-gg {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: inherit;
            background: rgba(0, 0, 0, 0.62);
            color: var(--timer-text);
            font-size: clamp(72px, 18vw, 220px);
            font-weight: 1000;
            letter-spacing: -0.08em;
            text-shadow:
              8px 8px 0 var(--timer-shadow),
              0 0 34px var(--timer-accent);
            animation: sgTimerGgPop 0.75s steps(6) infinite alternate;
            z-index: 10;
          }

          @keyframes sgTimerGlStart {
            0% {
              opacity: 0;
              transform: scale(0.58) rotate(-2deg);
              filter: blur(10px) saturate(1);
            }
            16% {
              opacity: 1;
              transform: scale(1.14) rotate(1deg);
              filter: blur(0) saturate(1.5);
            }
            52% {
              opacity: 1;
              transform: scale(1) rotate(0);
              filter: blur(0) saturate(1.25);
            }
            100% {
              opacity: 0;
              transform: scale(1.2) rotate(1deg);
              filter: blur(4px) saturate(1.8);
            }
          }

          @keyframes sgTimerGgPop {
            0% {
              transform: scale(0.92) rotate(-1deg);
              opacity: 0.82;
              filter: saturate(1);
            }
            100% {
              transform: scale(1.05) rotate(1deg);
              opacity: 1;
              filter: saturate(1.4);
            }
          }
        `}
      </style>

      {selectedTimer ? (
        <TimerOverlayCard
          timer={selectedTimer}
          nowMs={nowMs}
        />
      ) : (
        <div className="sg-stream-timers-grid">
          {timers.map((timer) => (
            <TimerOverlayCard
              key={timer.id}
              timer={timer}
              nowMs={nowMs}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
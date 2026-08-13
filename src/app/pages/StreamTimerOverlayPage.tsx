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
            --timer-color-1: #070817;
            --timer-color-2: #10182b;
            --timer-color-3: #8b5cf6;
            --timer-color-4: #22d3ee;
            --timer-color-5: #ec4899;
            --timer-text: #f8f7ff;
            --timer-shadow: #070817;
            --timer-border: rgba(34, 211, 238, 0.58);
            --timer-bg: rgba(7, 8, 23, 0.9);
            --timer-accent: #ec4899;
            --timer-secondary: #22d3ee;
          }

          .sg-timer-season-summer {
            --timer-color-1: #070817;
            --timer-color-2: #10182b;
            --timer-color-3: #8b5cf6;
            --timer-color-4: #22d3ee;
            --timer-color-5: #ec4899;
            --timer-text: #f8f7ff;
            --timer-shadow: #070817;
            --timer-border: rgba(34, 211, 238, 0.58);
            --timer-bg: rgba(7, 8, 23, 0.9);
            --timer-accent: #ec4899;
            --timer-secondary: #22d3ee;
          }

          .sg-timer-season-autumn {
            --timer-color-1: #05070c;
            --timer-color-2: #111827;
            --timer-color-3: #334155;
            --timer-color-4: #ef4444;
            --timer-color-5: #f97316;
            --timer-text: #f8fafc;
            --timer-shadow: #05070c;
            --timer-border: rgba(239, 68, 68, 0.64);
            --timer-bg: rgba(5, 7, 12, 0.92);
            --timer-accent: #f97316;
            --timer-secondary: #ef4444;
          }

          .sg-timer-season-winter {
            --timer-color-1: #012d3a;
            --timer-color-2: #118087;
            --timer-color-3: #0a5b6d;
            --timer-color-4: #12dd78;
            --timer-color-5: #1ae7ca;
            --timer-text: #f2fbff;
            --timer-shadow: #012d3a;
            --timer-border: rgba(26, 231, 202, 0.70);
            --timer-bg: rgba(1, 45, 58, 0.88);
            --timer-accent: #1ae7ca;
            --timer-secondary: #12dd78;
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
            overflow: hidden;
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
            position: relative;
            z-index: 2;
            margin-bottom: 8px;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--timer-secondary);
            text-shadow: 3px 3px 0 var(--timer-shadow);
          }

          .sg-stream-timer-value {
            position: relative;
            z-index: 2;
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
            position: relative;
            z-index: 2;
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
            z-index: 3;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: inherit;
            background:
              radial-gradient(circle at center, color-mix(in srgb, var(--timer-secondary) 16%, transparent), transparent 58%);
            color: color-mix(in srgb, var(--timer-text) 92%, white);
            font-size: clamp(70px, 14vw, 190px);
            font-weight: 1000;
            letter-spacing: -0.05em;
            text-shadow:
              7px 7px 0 var(--timer-shadow),
              0 0 26px var(--timer-secondary),
              0 0 42px var(--timer-accent);
            pointer-events: none;
            mix-blend-mode: screen;
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
            14% {
              opacity: 0.98;
              transform: scale(1.16) rotate(1deg);
              filter: blur(0) saturate(1.5);
            }
            48% {
              opacity: 0.86;
              transform: scale(1) rotate(0);
              filter: blur(0) saturate(1.25);
            }
            100% {
              opacity: 0;
              transform: scale(1.22) rotate(1deg);
              filter: blur(5px) saturate(1.8);
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
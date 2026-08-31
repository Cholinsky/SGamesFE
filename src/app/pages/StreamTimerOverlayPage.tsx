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

function CheckeredFlags({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={`sg-checkered-flags ${compact ? "is-compact" : ""}`}
      aria-hidden="true"
    >
      <div className="sg-checkered-flag sg-checkered-flag-left">
        <span className="sg-checkered-pole" />
        <span className="sg-checkered-cloth" />
      </div>

      <div className="sg-checkered-flag sg-checkered-flag-right">
        <span className="sg-checkered-pole" />
        <span className="sg-checkered-cloth" />
      </div>
    </div>
  );
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

  const status =
    String(timer.status ?? "").toLowerCase();

  const isStopped =
    status === "stopped";

  const finalTimeText =
    formatTimerMs(elapsed);

  const showGg =
    timer.shouldShowFinishAnimation &&
    timer.finishAnimationEndsAtUtc &&
    new Date(
      timer.finishAnimationEndsAtUtc
    ).getTime() > nowMs;

  const showGl =
    status === "running" &&
    elapsed >= 0 &&
    elapsed < 1800;

  return (
    <div className={`sg-stream-timer-card ${compact ? "is-compact" : ""} ${isStopped ? "is-stopped" : ""}`}>
      <div className="sg-stream-timer-scanline" />

      {isStopped && (
        <CheckeredFlags compact={compact} />
      )}

      <div className="sg-stream-timer-label">
        {timer.label}
      </div>

      <div className="sg-stream-timer-value">
        {formatTimerMs(elapsed)}
      </div>

      {isStopped && (
        <div className="sg-stream-timer-final">
          Tiempo final: {finalTimeText}
        </div>
      )}

      {showGl && !showGg && (
        <div className="sg-stream-timer-gl">
          GL
        </div>
      )}

      {showGg && (
        <div className="sg-stream-timer-gg">
          <CheckeredFlags compact={compact} />

          <div className="sg-stream-timer-gg-inner">
            <div className="sg-stream-timer-gg-text">
              {timer.finishAnimationText || "GG"}
            </div>

            <div className="sg-stream-timer-gg-final">
              Tiempo final {finalTimeText}
            </div>
          </div>
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
          @font-face {
            font-family: "Berani";
            src:
              url("/fonts/Berani.woff2") format("woff2"),
              url("/fonts/Berani.otf") format("opentype"),
              url("/fonts/Berani.ttf") format("truetype");
            font-weight: 400 1000;
            font-style: normal;
            font-display: swap;
          }

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
            font-family: "Berani", "Arial Black", Impact, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
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
            min-width: min(92vw, 800px);
            padding: 26px 42px;
            border: 3px solid var(--timer-border);
            border-radius: 10px;
            overflow: hidden;
            background:
              linear-gradient(180deg, rgba(255,255,255,0.08), transparent 40%),
              radial-gradient(circle at 50% 120%, color-mix(in srgb, var(--timer-accent) 18%, transparent), transparent 42%),
              var(--timer-bg);
            box-shadow:
              0 0 0 5px rgba(0,0,0,0.22),
              0 0 32px color-mix(in srgb, var(--timer-accent) 45%, transparent);
          }

          .sg-stream-timer-card.is-stopped {
            padding-left: 132px;
            padding-right: 132px;
          }

          .sg-stream-timer-card.is-compact {
            min-width: 0;
            padding: 18px 20px;
          }

          .sg-stream-timer-card.is-compact.is-stopped {
            padding-left: 72px;
            padding-right: 72px;
          }

          .sg-stream-timer-scanline {
            position: absolute;
            inset: 0;
            z-index: 1;
            opacity: 0.22;
            pointer-events: none;
            background:
              repeating-linear-gradient(
                180deg,
                rgba(255,255,255,0.10) 0,
                rgba(255,255,255,0.10) 1px,
                transparent 1px,
                transparent 5px
              );
            mix-blend-mode: overlay;
          }

          .sg-stream-timer-label {
            position: relative;
            z-index: 6;
            margin-bottom: 8px;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--timer-secondary);
            text-shadow:
              3px 3px 0 var(--timer-shadow),
              0 0 18px color-mix(in srgb, var(--timer-secondary) 55%, transparent);
          }

          .sg-stream-timer-value {
            position: relative;
            z-index: 6;
            font-size: clamp(58px, 10vw, 142px);
            line-height: 0.95;
            font-weight: 1000;
            letter-spacing: -0.055em;
            color: var(--timer-text);
            text-shadow:
              6px 6px 0 var(--timer-shadow),
              0 0 24px color-mix(in srgb, var(--timer-text) 35%, transparent),
              0 0 42px color-mix(in srgb, var(--timer-accent) 30%, transparent);
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum" 1;
          }

          .sg-stream-timer-card.is-compact .sg-stream-timer-label {
            font-size: 16px;
          }

          .sg-stream-timer-card.is-compact .sg-stream-timer-value {
            font-size: clamp(34px, 4.8vw, 78px);
          }

          .sg-stream-timer-final {
            position: relative;
            z-index: 6;
            margin-top: 10px;
            font-size: clamp(16px, 2vw, 24px);
            font-weight: 900;
            letter-spacing: 0.10em;
            color: var(--timer-accent);
            text-transform: uppercase;
            text-shadow:
              3px 3px 0 var(--timer-shadow),
              0 0 18px color-mix(in srgb, var(--timer-accent) 70%, transparent);
          }

          .sg-stream-timer-card.is-compact .sg-stream-timer-final {
            font-size: 13px;
            letter-spacing: 0.04em;
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
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: inherit;
            background:
              radial-gradient(circle at center, rgba(255,255,255,0.10), transparent 30%),
              rgba(0, 0, 0, 0.66);
            pointer-events: none;
          }

          .sg-stream-timer-gg-inner {
            position: relative;
            z-index: 14;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            animation: sgTimerGgPop 0.75s steps(6) infinite alternate;
          }

          .sg-stream-timer-gg-text {
            color: var(--timer-text);
            font-size: clamp(78px, 18vw, 230px);
            font-weight: 1000;
            line-height: 0.82;
            letter-spacing: -0.08em;
            text-shadow:
              9px 9px 0 var(--timer-shadow),
              0 0 34px var(--timer-accent),
              0 0 58px color-mix(in srgb, var(--timer-secondary) 55%, transparent);
          }

          .sg-stream-timer-gg-final {
            border: 2px solid color-mix(in srgb, var(--timer-accent) 72%, white 8%);
            border-radius: 999px;
            padding: 8px 18px;
            background: rgba(0,0,0,0.58);
            color: var(--timer-secondary);
            font-size: clamp(18px, 3vw, 34px);
            font-weight: 1000;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            text-shadow:
              3px 3px 0 var(--timer-shadow),
              0 0 20px color-mix(in srgb, var(--timer-secondary) 60%, transparent);
          }

          .sg-stream-timer-card.is-compact .sg-stream-timer-gg-text {
            font-size: clamp(48px, 8vw, 112px);
          }

          .sg-stream-timer-card.is-compact .sg-stream-timer-gg-final {
            font-size: clamp(12px, 1.6vw, 18px);
            padding: 5px 10px;
          }

          .sg-checkered-flags {
            position: absolute;
            inset: 0;
            z-index: 12;
            pointer-events: none;
          }

          .sg-stream-timer-card > .sg-checkered-flags {
            z-index: 5;
            opacity: 0.86;
          }

          .sg-checkered-flag {
            position: absolute;
            top: 50%;
            width: 126px;
            height: 98px;
            transform-style: preserve-3d;
            filter:
              drop-shadow(4px 4px 0 rgba(0,0,0,0.52))
              drop-shadow(0 0 18px color-mix(in srgb, var(--timer-accent) 48%, transparent));
          }

          .sg-checkered-flag-left {
            left: 18px;
            transform: translateY(-50%) rotate(-8deg);
          }

          .sg-checkered-flag-right {
            right: 18px;
            transform: translateY(-50%) rotate(8deg) scaleX(-1);
          }

          .sg-checkered-pole {
            position: absolute;
            left: 8px;
            top: 2px;
            width: 6px;
            height: 96px;
            border-radius: 999px;
            background:
              linear-gradient(90deg, #ffffff, #a7b0bd 40%, #ffffff 72%);
            box-shadow:
              0 0 0 2px rgba(0,0,0,0.35),
              0 0 12px color-mix(in srgb, var(--timer-secondary) 35%, transparent);
          }

          .sg-checkered-cloth {
            position: absolute;
            left: 14px;
            top: 8px;
            display: block;
            width: 104px;
            height: 66px;
            transform-origin: left center;
            clip-path: polygon(
              0% 0%,
              100% 5%,
              90% 50%,
              100% 95%,
              0% 100%
            );
            background:
              radial-gradient(circle at 12% 20%, rgba(255,255,255,0.28), transparent 24%),
              repeating-conic-gradient(
                from 0deg,
                #f8fafc 0deg 90deg,
                #020617 90deg 180deg,
                #f8fafc 180deg 270deg,
                #020617 270deg 360deg
              );
            background-size:
              100% 100%,
              22px 22px;
            border: 2px solid rgba(255,255,255,0.72);
            box-shadow:
              inset 0 0 18px rgba(255,255,255,0.18),
              inset -16px 0 18px rgba(0,0,0,0.28);
            animation: sgFlagWave 0.95s ease-in-out infinite alternate;
          }

          .sg-checkered-flag-right .sg-checkered-cloth {
            animation-delay: -0.35s;
          }

          .sg-checkered-flags.is-compact .sg-checkered-flag {
            width: 70px;
            height: 58px;
          }

          .sg-checkered-flags.is-compact .sg-checkered-flag-left {
            left: 8px;
          }

          .sg-checkered-flags.is-compact .sg-checkered-flag-right {
            right: 8px;
          }

          .sg-checkered-flags.is-compact .sg-checkered-pole {
            width: 4px;
            height: 58px;
          }

          .sg-checkered-flags.is-compact .sg-checkered-cloth {
            left: 10px;
            top: 6px;
            width: 56px;
            height: 36px;
            background-size:
              100% 100%,
              14px 14px;
          }

          @keyframes sgFlagWave {
            0% {
              transform: perspective(120px) rotateY(-22deg) skewY(-1deg) translateX(0);
              filter: brightness(0.92);
            }
            35% {
              transform: perspective(120px) rotateY(16deg) skewY(4deg) translateX(1px);
              filter: brightness(1.08);
            }
            70% {
              transform: perspective(120px) rotateY(-12deg) skewY(-3deg) translateX(-1px);
              filter: brightness(1);
            }
            100% {
              transform: perspective(120px) rotateY(24deg) skewY(3deg) translateX(2px);
              filter: brightness(1.14);
            }
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
              opacity: 0.86;
              filter: saturate(1);
            }
            100% {
              transform: scale(1.05) rotate(1deg);
              opacity: 1;
              filter: saturate(1.42);
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
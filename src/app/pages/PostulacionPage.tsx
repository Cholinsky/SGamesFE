import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  ExternalLink,
  Gamepad2,
  Share2,
  Timer,
  Trophy,
  Users,
  Monitor,
  SearchX,
  Search,
  ListFilter,
} from "lucide-react";
import { getPublicApprovedApplications } from "../services/applicationService";
import {
  ShareModal,
  type SharePayload,
} from "../components/ShareModal";

type PublicApprovedRunSocialNetwork = {
  socialNetworkId: string;
  name: string;
  url: string;
};

type PublicApprovedRunParticipant = {
  id?: string;
  runnerName?: string | null;
  email?: string | null;
  discordUser?: string | null;
  country?: string | null;
  videoUrl?: string | null;
  sortOrder?: number | null;
};

type PublicApprovedRun = {
  id: string;
  runnerName: string;
  game: string;
  category: string;
  platform: string;
  runType?: string | null;
  estimatedTimeMinutes: number;
  estimatedTime: string;
  youtubeUrl?: string | null;
  socialNetworks?: PublicApprovedRunSocialNetwork[] | null;
  participants?: PublicApprovedRunParticipant[] | null;
};

type PublicApprovedRunnerGroup = {
  runnerName: string;
  socialNetworks: PublicApprovedRunSocialNetwork[];
  runs: PublicApprovedRun[];
};

type RunFormatFilter =
  | "All"
  | "Solo"
  | "Race";

function getNormalizedRunType(
  run?: PublicApprovedRun | null
) {
  const value = run?.runType?.trim();

  if (!value) {
    return "Solo";
  }

  return value;
}

function isRaceRun(
  run: PublicApprovedRun
) {
  return getNormalizedRunType(run)
    .toLowerCase() === "race";
}

function getRunFormatLabel(
  run: PublicApprovedRun
) {
  return isRaceRun(run)
    ? "Race"
    : "Individual";
}

function getRunFormatBadgeClass(
  run: PublicApprovedRun
) {
  return isRaceRun(run)
    ? "sgames-runs-badge-accent"
    : "sgames-runs-badge-primary";
}

function getSortedParticipants(
  run: PublicApprovedRun
) {
  const participants =
    run.participants?.filter(
      (participant) =>
        participant.runnerName?.trim()
    ) ?? [];

  if (!participants.length) {
    return [
      {
        runnerName: run.runnerName,
        videoUrl: run.youtubeUrl,
        sortOrder: 1,
      },
    ];
  }

  return [...participants].sort(
    (a, b) =>
      (a.sortOrder ?? 999) -
      (b.sortOrder ?? 999)
  );
}

function getRaceParticipants(
  run: PublicApprovedRun
) {
  if (!isRaceRun(run)) {
    return [];
  }

  return getSortedParticipants(run);
}

function getRunParticipantNames(
  run: PublicApprovedRun
) {
  if (!isRaceRun(run)) {
    return run.runnerName;
  }

  const names =
    getSortedParticipants(run)
      .map((participant) =>
        participant.runnerName?.trim()
      )
      .filter(Boolean);

  if (!names.length) {
    return run.runnerName;
  }

  return names.join(" vs ");
}

function getRunShareText(
  run: PublicApprovedRun
) {
  if (isRaceRun(run)) {
    return `${getRunParticipantNames(run)} participarán en SGames con ${run.game} - ${run.category} en formato Race.`;
  }

  return `${run.runnerName} participará en SGames con ${run.game} - ${run.category}.`;
}

function getRunnerShareText(
  group: PublicApprovedRunnerGroup
) {
  const runNames =
    group.runs
      .map((run) => {
        const format =
          isRaceRun(run)
            ? "Race"
            : "Individual";

        return `${run.game} - ${run.category} (${format})`;
      })
      .join(", ");

  return `${group.runnerName} participará en SGames con: ${runNames}.`;
}

function groupRunsByRunner(
  runs: PublicApprovedRun[]
): PublicApprovedRunnerGroup[] {
  const groups =
    new Map<string, PublicApprovedRunnerGroup>();

  runs.forEach((run) => {
    const cleanRunnerName =
      run.runnerName?.trim() || "Runner sin nombre";

    const key =
      cleanRunnerName.toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, {
        runnerName: cleanRunnerName,
        socialNetworks: [],
        runs: [],
      });
    }

    const group =
      groups.get(key)!;

    group.runs.push(run);

    run.socialNetworks?.forEach((social) => {
      const alreadyExists =
        group.socialNetworks.some(
          (item) =>
            item.socialNetworkId === social.socialNetworkId &&
            item.url === social.url
        );

      if (!alreadyExists) {
        group.socialNetworks.push(social);
      }
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      runs: group.runs.sort((a, b) =>
        a.game.localeCompare(b.game)
      ),
    }))
    .sort((a, b) =>
      a.runnerName.localeCompare(b.runnerName)
    );
}

function normalizeSearchValue(
  value?: string | null
) {
  return value
    ?.trim()
    .toLowerCase() ?? "";
}

function runMatchesFormat(
  run: PublicApprovedRun,
  formatFilter: RunFormatFilter
) {
  if (formatFilter === "All") {
    return true;
  }

  if (formatFilter === "Race") {
    return isRaceRun(run);
  }

  return !isRaceRun(run);
}

function runMatchesSearch(
  run: PublicApprovedRun,
  searchText: string
) {
  const term =
    normalizeSearchValue(searchText);

  if (!term) {
    return true;
  }

  const participantNames =
    getSortedParticipants(run)
      .map((participant) =>
        participant.runnerName ?? ""
      )
      .join(" ");

  const searchableText =
    [
      run.runnerName,
      run.game,
      run.category,
      run.platform,
      getRunFormatLabel(run),
      participantNames,
    ]
      .join(" ")
      .toLowerCase();

  return searchableText.includes(term);
}

function getUniqueRunnerCount(
  runs: PublicApprovedRun[]
) {
  const names =
    new Set<string>();

  runs.forEach((run) => {
    if (isRaceRun(run)) {
      getSortedParticipants(run)
        .forEach((participant) => {
          const name =
            participant.runnerName
              ?.trim()
              .toLowerCase();

          if (name) {
            names.add(name);
          }
        });

      return;
    }

    const name =
      run.runnerName
        ?.trim()
        .toLowerCase();

    if (name) {
      names.add(name);
    }
  });

  return names.size;
}

function getRunsPageUrl() {
  if (typeof window === "undefined") {
    return "/runs";
  }

  return `${window.location.origin}/runs`;
}

export default function RunsPage() {
  const [runs, setRuns] =
    useState<PublicApprovedRun[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchText, setSearchText] =
    useState("");

  const [formatFilter, setFormatFilter] =
    useState<RunFormatFilter>("All");

  const [shareOpen, setShareOpen] =
    useState(false);

  const [sharePayload, setSharePayload] =
    useState<SharePayload | null>(null);

  const filteredRuns =
    useMemo(
      () =>
        runs.filter(
          (run) =>
            runMatchesFormat(
              run,
              formatFilter
            ) &&
            runMatchesSearch(
              run,
              searchText
            )
        ),
      [
        runs,
        formatFilter,
        searchText,
      ]
    );

  const runnerGroups =
    useMemo(
      () =>
        groupRunsByRunner(
          filteredRuns
        ),
      [filteredRuns]
    );

  const stats =
    useMemo(() => {
      const raceRuns =
        runs.filter(isRaceRun).length;

      const individualRuns =
        runs.length - raceRuns;

      return {
        totalRuns: runs.length,
        individualRuns,
        raceRuns,
        totalRunners:
          getUniqueRunnerCount(runs),
      };
    }, [runs]);

  const hasActiveFilters =
    searchText.trim() !== "" ||
    formatFilter !== "All";

  useEffect(() => {
    loadRuns();
  }, []);

  async function loadRuns() {
    try {
      setLoading(true);

      const data =
        await getPublicApprovedApplications();

      setRuns(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }

  function openShare(
    payload: SharePayload
  ) {
    setSharePayload(payload);
    setShareOpen(true);
  }

  function openRunShare(
    run: PublicApprovedRun
  ) {
    openShare({
      title: isRaceRun(run)
        ? `Race aprobada: ${run.game}`
        : `Run aprobada: ${run.game}`,
      text: getRunShareText(run),
      url: getRunsPageUrl(),
    });
  }

  function openRunnerShare(
    group: PublicApprovedRunnerGroup
  ) {
    openShare({
      title: `${group.runnerName} en SGames`,
      text: getRunnerShareText(group),
      url: getRunsPageUrl(),
    });
  }

  function openLineupShare() {
    openShare({
      title: "Lineup confirmado de SGames",
      text: "Ya hay jugadores con runs aprobadas para SGames. Revisa el lineup confirmado.",
      url: getRunsPageUrl(),
    });
  }

  function clearFilters() {
    setSearchText("");
    setFormatFilter("All");
  }

  if (loading) {
    return (
      <div className="sgames-runs-page min-h-screen py-12">
        <style>{`
          .sgames-runs-page {
            background:
              radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--sg-primary) 16%, transparent), transparent 30rem),
              radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--sg-accent) 14%, transparent), transparent 32rem),
              linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 46%, var(--sg-background) 100%);
            color: var(--sg-text);
          }

          .sgames-runs-gradient-box {
            background:
              linear-gradient(
                135deg,
                var(--sg-primary),
                var(--sg-secondary),
                var(--sg-accent)
              );
            box-shadow:
              0 0 35px color-mix(in srgb, var(--sg-accent) 35%, transparent);
          }

          .sgames-runs-badge-primary {
            border: 1px solid color-mix(in srgb, var(--sg-primary) 34%, transparent);
            background: color-mix(in srgb, var(--sg-primary) 11%, transparent);
            color: var(--sg-primary);
          }

          .sgames-runs-badge-secondary {
            border: 1px solid color-mix(in srgb, var(--sg-secondary) 34%, transparent);
            background: color-mix(in srgb, var(--sg-secondary) 12%, transparent);
            color: var(--sg-secondary);
          }

          .sgames-runs-badge-accent {
            border: 1px solid color-mix(in srgb, var(--sg-accent) 34%, transparent);
            background: color-mix(in srgb, var(--sg-accent) 11%, transparent);
            color: var(--sg-accent);
          }

          .sgames-runs-stat-card {
            border: 1px solid var(--sg-border);
            background:
              linear-gradient(
                135deg,
                color-mix(in srgb, var(--sg-surface) 72%, transparent),
                color-mix(in srgb, var(--sg-background) 80%, transparent)
              );
            box-shadow:
              0 0 28px rgba(15, 23, 42, 0.28);
          }

          .sgames-runs-stat-card-primary {
            border-color: color-mix(in srgb, var(--sg-primary) 24%, transparent);
            background: color-mix(in srgb, var(--sg-primary) 10%, transparent);
          }

          .sgames-runs-stat-card-accent {
            border-color: color-mix(in srgb, var(--sg-accent) 24%, transparent);
            background: color-mix(in srgb, var(--sg-accent) 10%, transparent);
          }

          .sgames-runs-stat-card-secondary {
            border-color: color-mix(in srgb, var(--sg-secondary) 24%, transparent);
            background: color-mix(in srgb, var(--sg-secondary) 10%, transparent);
          }

          .sgames-runs-panel {
            border: 1px solid var(--sg-border);
            background:
              linear-gradient(
                135deg,
                color-mix(in srgb, var(--sg-surface) 72%, transparent),
                color-mix(in srgb, var(--sg-background) 82%, transparent)
              );
            box-shadow:
              0 0 35px rgba(15, 23, 42, 0.25);
            backdrop-filter: blur(14px);
          }

          .sgames-runs-input {
            border-color: var(--sg-border) !important;
            background: color-mix(in srgb, var(--sg-background) 82%, #000000 18%) !important;
            color: var(--sg-text) !important;
          }

          .sgames-runs-input::placeholder {
            color: color-mix(in srgb, var(--sg-muted-text) 54%, transparent);
          }

          .sgames-runs-filter-active {
            border-color: color-mix(in srgb, var(--sg-primary) 52%, transparent) !important;
            background: color-mix(in srgb, var(--sg-primary) 20%, transparent) !important;
            color: var(--sg-primary) !important;
          }

          .sgames-runs-filter-idle {
            border-color: var(--sg-border) !important;
            background: color-mix(in srgb, var(--sg-background) 70%, transparent) !important;
            color: var(--sg-muted-text) !important;
          }

          .sgames-runs-filter-idle:hover {
            background: color-mix(in srgb, var(--sg-primary) 8%, transparent) !important;
            color: var(--sg-text) !important;
          }

          .sgames-runs-table {
            border: 1px solid var(--sg-border);
            background:
              linear-gradient(
                135deg,
                color-mix(in srgb, var(--sg-surface) 72%, transparent),
                color-mix(in srgb, var(--sg-background) 84%, transparent)
              );
            box-shadow:
              0 0 35px rgba(15, 23, 42, 0.35);
          }

          .sgames-runs-header-row {
            border-bottom: 1px solid var(--sg-border);
            background: color-mix(in srgb, var(--sg-text) 5%, transparent);
            color: color-mix(in srgb, var(--sg-muted-text) 70%, transparent);
          }

          .sgames-runs-row {
            border-color: color-mix(in srgb, var(--sg-secondary) 18%, transparent);
          }

          .sgames-runs-row:hover {
            background: color-mix(in srgb, var(--sg-primary) 5%, transparent);
          }

          .sgames-run-card {
            border: 1px solid var(--sg-border);
            background: color-mix(in srgb, var(--sg-background) 62%, transparent);
          }

          .sgames-race-participants {
            border: 1px solid color-mix(in srgb, var(--sg-accent) 22%, transparent);
            background: color-mix(in srgb, var(--sg-accent) 6%, transparent);
          }

          .sgames-race-player-card {
            border: 1px solid var(--sg-border);
            background: color-mix(in srgb, var(--sg-surface) 70%, transparent);
          }

          .sgames-runs-pill-primary {
            border: 1px solid color-mix(in srgb, var(--sg-primary) 32%, transparent);
            background: color-mix(in srgb, var(--sg-primary) 10%, transparent);
            color: var(--sg-primary);
          }

          .sgames-runs-pill-secondary {
            border: 1px solid color-mix(in srgb, var(--sg-secondary) 32%, transparent);
            background: color-mix(in srgb, var(--sg-secondary) 10%, transparent);
            color: var(--sg-secondary);
          }

          .sgames-runs-pill-accent {
            border: 1px solid color-mix(in srgb, var(--sg-accent) 32%, transparent);
            background: color-mix(in srgb, var(--sg-accent) 10%, transparent);
            color: var(--sg-accent);
          }

          .sgames-runs-pill-primary:hover,
          .sgames-runs-pill-secondary:hover,
          .sgames-runs-pill-accent:hover {
            filter: brightness(1.16);
          }

          [data-season-theme="Winter"] .sgames-runs-page {
            background:
              radial-gradient(circle at 12% 8%, rgba(103, 232, 249, 0.16), transparent 30rem),
              radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.16), transparent 32rem),
              radial-gradient(circle at 50% 100%, rgba(196, 181, 253, 0.08), transparent 34rem),
              linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
          }

          [data-season-theme="Winter"] .sgames-runs-panel,
          [data-season-theme="Winter"] .sgames-runs-table,
          [data-season-theme="Winter"] .sgames-run-card {
            box-shadow:
              0 0 0 1px rgba(103, 232, 249, 0.08),
              0 0 34px rgba(59, 130, 246, 0.14);
          }

          [data-season-theme="Autumn"] .sgames-runs-page {
            background:
              radial-gradient(circle at 12% 8%, rgba(249, 115, 22, 0.17), transparent 30rem),
              radial-gradient(circle at 88% 12%, rgba(185, 28, 28, 0.14), transparent 32rem),
              radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.08), transparent 34rem),
              linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
          }

        `}</style>
        <div className="container mx-auto px-4">
          <Card className="sgames-runs-panel mx-auto max-w-2xl">
            <CardContent className="p-10 text-center">
              <div className="sgames-runs-gradient-box mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl" />

              <p className="text-[var(--sg-muted-text)]">
                Cargando runs aprobadas...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filterOptions: {
    value: RunFormatFilter;
    label: string;
    count: number;
  }[] = [
    {
      value: "All",
      label: "Todos",
      count: stats.totalRuns,
    },
    {
      value: "Solo",
      label: "Individual",
      count: stats.individualRuns,
    },
    {
      value: "Race",
      label: "Race",
      count: stats.raceRuns,
    },
  ];

  return (
    <div className="sgames-runs-page min-h-screen py-12">

      <style>
        {`
          .sgames-runs-page {
            background:
              radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--sg-primary) 16%, transparent), transparent 30rem),
              radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--sg-accent) 14%, transparent), transparent 32rem),
              linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 46%, var(--sg-background) 100%);
            color: var(--sg-text);
          }

          .sgames-runs-gradient-box {
            background:
              linear-gradient(
                135deg,
                var(--sg-primary),
                var(--sg-secondary),
                var(--sg-accent)
              );
            box-shadow:
              0 0 35px color-mix(in srgb, var(--sg-accent) 35%, transparent);
          }

          .sgames-runs-badge-primary {
            border: 1px solid color-mix(in srgb, var(--sg-primary) 34%, transparent);
            background: color-mix(in srgb, var(--sg-primary) 11%, transparent);
            color: var(--sg-primary);
          }

          .sgames-runs-badge-secondary {
            border: 1px solid color-mix(in srgb, var(--sg-secondary) 34%, transparent);
            background: color-mix(in srgb, var(--sg-secondary) 12%, transparent);
            color: var(--sg-secondary);
          }

          .sgames-runs-badge-accent {
            border: 1px solid color-mix(in srgb, var(--sg-accent) 34%, transparent);
            background: color-mix(in srgb, var(--sg-accent) 11%, transparent);
            color: var(--sg-accent);
          }

          .sgames-runs-stat-card {
            border: 1px solid var(--sg-border);
            background:
              linear-gradient(
                135deg,
                color-mix(in srgb, var(--sg-surface) 72%, transparent),
                color-mix(in srgb, var(--sg-background) 80%, transparent)
              );
            box-shadow:
              0 0 28px rgba(15, 23, 42, 0.28);
          }

          .sgames-runs-stat-card-primary {
            border-color: color-mix(in srgb, var(--sg-primary) 24%, transparent);
            background: color-mix(in srgb, var(--sg-primary) 10%, transparent);
          }

          .sgames-runs-stat-card-accent {
            border-color: color-mix(in srgb, var(--sg-accent) 24%, transparent);
            background: color-mix(in srgb, var(--sg-accent) 10%, transparent);
          }

          .sgames-runs-stat-card-secondary {
            border-color: color-mix(in srgb, var(--sg-secondary) 24%, transparent);
            background: color-mix(in srgb, var(--sg-secondary) 10%, transparent);
          }

          .sgames-runs-panel {
            border: 1px solid var(--sg-border);
            background:
              linear-gradient(
                135deg,
                color-mix(in srgb, var(--sg-surface) 72%, transparent),
                color-mix(in srgb, var(--sg-background) 82%, transparent)
              );
            box-shadow:
              0 0 35px rgba(15, 23, 42, 0.25);
            backdrop-filter: blur(14px);
          }

          .sgames-runs-input {
            border-color: var(--sg-border) !important;
            background: color-mix(in srgb, var(--sg-background) 82%, #000000 18%) !important;
            color: var(--sg-text) !important;
          }

          .sgames-runs-input::placeholder {
            color: color-mix(in srgb, var(--sg-muted-text) 54%, transparent);
          }

          .sgames-runs-filter-active {
            border-color: color-mix(in srgb, var(--sg-primary) 52%, transparent) !important;
            background: color-mix(in srgb, var(--sg-primary) 20%, transparent) !important;
            color: var(--sg-primary) !important;
          }

          .sgames-runs-filter-idle {
            border-color: var(--sg-border) !important;
            background: color-mix(in srgb, var(--sg-background) 70%, transparent) !important;
            color: var(--sg-muted-text) !important;
          }

          .sgames-runs-filter-idle:hover {
            background: color-mix(in srgb, var(--sg-primary) 8%, transparent) !important;
            color: var(--sg-text) !important;
          }

          .sgames-runs-table {
            border: 1px solid var(--sg-border);
            background:
              linear-gradient(
                135deg,
                color-mix(in srgb, var(--sg-surface) 72%, transparent),
                color-mix(in srgb, var(--sg-background) 84%, transparent)
              );
            box-shadow:
              0 0 35px rgba(15, 23, 42, 0.35);
          }

          .sgames-runs-header-row {
            border-bottom: 1px solid var(--sg-border);
            background: color-mix(in srgb, var(--sg-text) 5%, transparent);
            color: color-mix(in srgb, var(--sg-muted-text) 70%, transparent);
          }

          .sgames-runs-row {
            border-color: color-mix(in srgb, var(--sg-secondary) 18%, transparent);
          }

          .sgames-runs-row:hover {
            background: color-mix(in srgb, var(--sg-primary) 5%, transparent);
          }

          .sgames-run-card {
            border: 1px solid var(--sg-border);
            background: color-mix(in srgb, var(--sg-background) 62%, transparent);
          }

          .sgames-race-participants {
            border: 1px solid color-mix(in srgb, var(--sg-accent) 22%, transparent);
            background: color-mix(in srgb, var(--sg-accent) 6%, transparent);
          }

          .sgames-race-player-card {
            border: 1px solid var(--sg-border);
            background: color-mix(in srgb, var(--sg-surface) 70%, transparent);
          }

          .sgames-runs-pill-primary {
            border: 1px solid color-mix(in srgb, var(--sg-primary) 32%, transparent);
            background: color-mix(in srgb, var(--sg-primary) 10%, transparent);
            color: var(--sg-primary);
          }

          .sgames-runs-pill-secondary {
            border: 1px solid color-mix(in srgb, var(--sg-secondary) 32%, transparent);
            background: color-mix(in srgb, var(--sg-secondary) 10%, transparent);
            color: var(--sg-secondary);
          }

          .sgames-runs-pill-accent {
            border: 1px solid color-mix(in srgb, var(--sg-accent) 32%, transparent);
            background: color-mix(in srgb, var(--sg-accent) 10%, transparent);
            color: var(--sg-accent);
          }

          .sgames-runs-pill-primary:hover,
          .sgames-runs-pill-secondary:hover,
          .sgames-runs-pill-accent:hover {
            filter: brightness(1.16);
          }

          [data-season-theme="Winter"] .sgames-runs-page {
            background:
              radial-gradient(circle at 12% 8%, rgba(103, 232, 249, 0.16), transparent 30rem),
              radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.16), transparent 32rem),
              radial-gradient(circle at 50% 100%, rgba(196, 181, 253, 0.08), transparent 34rem),
              linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
          }

          [data-season-theme="Winter"] .sgames-runs-panel,
          [data-season-theme="Winter"] .sgames-runs-table,
          [data-season-theme="Winter"] .sgames-run-card {
            box-shadow:
              0 0 0 1px rgba(103, 232, 249, 0.08),
              0 0 34px rgba(59, 130, 246, 0.14);
          }

          [data-season-theme="Autumn"] .sgames-runs-page {
            background:
              radial-gradient(circle at 12% 8%, rgba(249, 115, 22, 0.17), transparent 30rem),
              radial-gradient(circle at 88% 12%, rgba(185, 28, 28, 0.14), transparent 32rem),
              radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.08), transparent 34rem),
              linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
          }

        `}
      </style>

      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="sgames-runs-gradient-box flex h-16 w-16 items-center justify-center rounded-3xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>

          <Badge className="sgames-runs-badge-primary mb-4">
            Lineup confirmado
          </Badge>

          <h1 className="sgames-neon-text mb-4 text-4xl font-black md:text-5xl">
            Runs aprobadas
          </h1>

          <p className="mx-auto max-w-3xl text-[var(--sg-muted-text)]">
            Conoce las runs confirmadas para SGames. Aquí podrás ver
            runners, juegos, categorías, plataformas, tiempos estimados,
            formato individual o race, VODs y redes para compartir con la
            comunidad.
          </p>
        </div>

        {runs.length === 0 ? (
          <Card className="sgames-runs-panel mx-auto max-w-2xl">
            <CardContent className="p-10 text-center">
              <SearchX className="mx-auto mb-4 h-14 w-14 text-[color-mix(in_srgb,var(--sg-muted-text)_60%,transparent)]" />

              <h2 className="mb-3 text-2xl font-black text-[var(--sg-text)]">
                Aún no hay runs aprobadas visibles
              </h2>

              <p className="text-[var(--sg-muted-text)]">
                Cuando el staff apruebe postulaciones, aparecerán aquí.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sgames-runs-stat-card rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--sg-muted-text)_70%,transparent)]">
                  Total
                </p>

                <p className="mt-2 text-3xl font-black text-[var(--sg-text)]">
                  {stats.totalRuns}
                </p>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  runs aprobadas
                </p>
              </div>

              <div className="sgames-runs-stat-card sgames-runs-stat-card-primary rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                  Individual
                </p>

                <p className="mt-2 text-3xl font-black text-[var(--sg-text)]">
                  {stats.individualRuns}
                </p>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  runs solo
                </p>
              </div>

              <div className="sgames-runs-stat-card sgames-runs-stat-card-accent rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sg-accent)]">
                  Race
                </p>

                <p className="mt-2 text-3xl font-black text-[var(--sg-text)]">
                  {stats.raceRuns}
                </p>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  carreras aprobadas
                </p>
              </div>

              <div className="sgames-runs-stat-card sgames-runs-stat-card-secondary rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sg-secondary)]">
                  Jugadores
                </p>

                <p className="mt-2 text-3xl font-black text-[var(--sg-text)]">
                  {stats.totalRunners}
                </p>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  participantes únicos
                </p>
              </div>
            </div>

            <div className="sgames-runs-panel mb-6 rounded-3xl p-5">
              <div className="mb-4 flex items-center gap-2">
                <ListFilter className="h-5 w-5 text-[var(--sg-primary)]" />

                <h2 className="text-lg font-black text-[var(--sg-text)]">
                  Buscar y filtrar
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-end">
                <div>
                  <label
                    htmlFor="runs-search"
                    className="mb-2 block text-sm font-semibold text-[var(--sg-muted-text)]"
                  >
                    Buscar por runner, juego, categoría o plataforma
                  </label>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_srgb,var(--sg-muted-text)_60%,transparent)]" />

                    <Input
                      id="runs-search"
                      value={searchText}
                      onChange={(event) =>
                        setSearchText(
                          event.target.value
                        )
                      }
                      className="sgames-runs-input pl-10"
                      placeholder="Ej. Mario, Any%, PC, runner..."
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-[var(--sg-muted-text)]">
                    Formato
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => {
                      const active =
                        formatFilter === option.value;

                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setFormatFilter(
                              option.value
                            )
                          }
                          className={
                            active
                              ? "sgames-runs-filter-active"
                              : "sgames-runs-filter-idle"
                          }
                        >
                          {option.label}
                          <Badge className="ml-2 bg-white/10 text-[10px] text-[var(--sg-text)]">
                            {option.count}
                          </Badge>
                        </Button>
                      );
                    })}

                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-[var(--sg-muted-text)] hover:bg-white/5 hover:text-[var(--sg-accent)]"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-[color-mix(in_srgb,var(--sg-muted-text)_70%,transparent)]">
                Mostrando{" "}
                <span className="font-semibold text-[var(--sg-primary)]">
                  {filteredRuns.length}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-[var(--sg-text)]">
                  {runs.length}
                </span>{" "}
                runs aprobadas.
              </p>
            </div>

            {filteredRuns.length === 0 ? (
              <Card className="sgames-runs-panel mx-auto max-w-2xl">
                <CardContent className="p-10 text-center">
                  <SearchX className="mx-auto mb-4 h-14 w-14 text-[color-mix(in_srgb,var(--sg-muted-text)_60%,transparent)]" />

                  <h2 className="mb-3 text-2xl font-black text-[var(--sg-text)]">
                    No encontramos coincidencias
                  </h2>

                  <p className="mb-6 text-[var(--sg-muted-text)]">
                    Ajusta la búsqueda o limpia los filtros para volver a ver
                    todo el lineup.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="sgames-outline-button"
                  >
                    Limpiar filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="sgames-runs-table overflow-hidden rounded-3xl">
                <div className="sgames-runs-header-row hidden grid-cols-[1fr_2.4fr_1.2fr_0.8fr] gap-4 px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] lg:grid">
                  <span>Jugador</span>
                  <span>Runs aprobadas</span>
                  <span>Redes</span>
                  <span>Compartir</span>
                </div>

                <div className="divide-y divide-[color-mix(in_srgb,var(--sg-secondary)_18%,transparent)]">
                  {runnerGroups.map((group) => (
                    <div
                      key={group.runnerName}
                      className="sgames-runs-row grid gap-5 px-5 py-6 transition-colors lg:grid-cols-[1fr_2.4fr_1.2fr_0.8fr] lg:items-start"
                    >
                      {/* Jugador */}
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--sg-primary)] lg:hidden">
                          Jugador
                        </p>

                        <p className="flex items-center gap-2 text-xl font-black text-[var(--sg-text)]">
                          <Users className="h-5 w-5 text-[var(--sg-primary)]" />
                          {group.runnerName}
                        </p>

                        <Badge className="sgames-runs-badge-secondary mt-3">
                          {group.runs.length}{" "}
                          {group.runs.length === 1
                            ? "run aprobada"
                            : "runs aprobadas"}
                        </Badge>
                      </div>

                      {/* Runs */}
                      <div>
                        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--sg-primary)] lg:hidden">
                          Runs aprobadas
                        </p>

                        <div className="space-y-3">
                          {group.runs.map((run) => {
                            const raceParticipants =
                              getRaceParticipants(run);

                            return (
                              <div
                                key={run.id}
                                className="sgames-run-card rounded-2xl p-4"
                              >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                  <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={getRunFormatBadgeClass(run)}
                                      >
                                        {getRunFormatLabel(run)}
                                      </Badge>

                                      {isRaceRun(run) && (
                                        <Badge
                                          variant="outline"
                                          className="sgames-runs-badge-secondary"
                                        >
                                          <Users className="mr-1.5 h-3.5 w-3.5" />
                                          {raceParticipants.length} jugadores
                                        </Badge>
                                      )}
                                    </div>

                                    <p className="flex items-center gap-2 font-black text-[var(--sg-text)]">
                                      <Gamepad2 className="h-4 w-4 text-[var(--sg-secondary)]" />
                                      {run.game}
                                    </p>

                                    <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                                      {run.category}
                                    </p>

                                    {isRaceRun(run) && (
                                      <p className="mt-2 text-sm font-semibold text-[var(--sg-accent)]">
                                        {getRunParticipantNames(run)}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <Badge
                                      variant="outline"
                                      className="sgames-runs-badge-primary"
                                    >
                                      <Monitor className="mr-1.5 h-3.5 w-3.5" />
                                      {run.platform}
                                    </Badge>

                                    <Badge
                                      variant="outline"
                                      className="sgames-runs-badge-accent"
                                    >
                                      <Timer className="mr-1.5 h-3.5 w-3.5" />
                                      {run.estimatedTime}
                                    </Badge>

                                    {!isRaceRun(run) && run.youtubeUrl && (
                                      <a
                                        href={run.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sgames-runs-pill-secondary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                                      >
                                        VOD
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}

                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        openRunShare(run)
                                      }
                                      className="sgames-runs-pill-accent h-7 rounded-full px-3 text-xs font-semibold"
                                    >
                                      Compartir run
                                      <Share2 className="ml-1 h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                {isRaceRun(run) && (
                                  <div className="sgames-race-participants mt-4 rounded-2xl p-3">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--sg-accent)]">
                                      Participantes de la race
                                    </p>

                                    <div className="grid gap-3 md:grid-cols-2">
                                      {raceParticipants.map(
                                        (participant, participantIndex) => (
                                          <div
                                            key={`${run.id}-${participant.sortOrder ?? participantIndex}-${participant.runnerName}`}
                                            className="sgames-race-player-card rounded-xl p-3"
                                          >
                                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                              Jugador {participantIndex + 1}
                                            </p>

                                            <p className="mt-1 font-black text-[var(--sg-text)]">
                                              {participant.runnerName}
                                            </p>

                                            {participant.country && (
                                              <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                                                {participant.country}
                                              </p>
                                            )}

                                            {participant.videoUrl && (
                                              <a
                                                href={participant.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-[var(--sg-secondary)] hover:bg-violet-500/20"
                                              >
                                                VOD jugador {participantIndex + 1}
                                                <ExternalLink className="h-3 w-3" />
                                              </a>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Redes */}
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--sg-primary)] lg:hidden">
                          Redes
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {group.socialNetworks.length > 0 ? (
                            group.socialNetworks.map((social) => (
                              <a
                                key={`${group.runnerName}-${social.socialNetworkId}-${social.url}`}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sgames-runs-pill-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                              >
                                {social.name}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))
                          ) : (
                            <span className="text-xs text-[color-mix(in_srgb,var(--sg-muted-text)_70%,transparent)]">
                              Sin redes
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Compartir jugador */}
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--sg-primary)] lg:hidden">
                          Compartir
                        </p>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            openRunnerShare(group)
                          }
                          className="sgames-runs-pill-accent inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                        >
                          Compartir jugador
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {runs.length > 0 && (
              <div className="mt-10 text-center">
                <Button
                  type="button"
                  onClick={openLineupShare}
                  className="sgames-primary-button"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir lineup
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        payload={sharePayload}
      />
    </div>
  );
}
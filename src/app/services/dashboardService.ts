import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type DashboardWeeklyActivity = {
  day: string;
  applications: number;
};

export type DashboardPlatformDistribution = {
  platform: string;
  count: number;
};

export type DashboardRecentApplication = {
  id: string;
  runnerName: string;
  game: string;
  category: string;
  platform: string;
  status: string;
  submittedAt: string;
};

export type DashboardTopGame = {
  game: string;
  count: number;
};

export type DashboardStats = {
  activeEventId?: string | null;
  activeEventName: string;
  activeEventStartDate?: string | null;
  activeEventEndDate?: string | null;
  activeEventSeasonKey?: string | null;
  activeEventIsActive: boolean;
  activeEventApplicationsOpen: boolean;
  activeEventPublicRunsVisible: boolean;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  scheduledRuns: number;
  activeRunners: number;
  isSchedulePublished: boolean;
  weeklyActivity: DashboardWeeklyActivity[];
  platformDistribution: DashboardPlatformDistribution[];
  recentApplications: DashboardRecentApplication[];
  topGames: DashboardTopGame[];
};

async function getErrorMessage(
  response: Response,
  fallbackMessage: string
) {
  const text =
    await response.text();

  if (!text) {
    return fallbackMessage;
  }

  try {
    const parsed =
      JSON.parse(text);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.message) {
      return parsed.message;
    }

    if (parsed?.title) {
      return parsed.title;
    }
  } catch {
    // texto plano
  }

  return text;
}

export async function getDashboardStats() {
  const response =
    await fetch(
      `${API_URL}/Dashboard?t=${Date.now()}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo cargar el dashboard"
      )
    );
  }

  return await response.json() as DashboardStats;
}
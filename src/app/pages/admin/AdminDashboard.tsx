import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  useEffect,
  useState
} from "react";
import { Link } from "react-router";
import {
  getDashboardStats
} from "../../services/dashboardService";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Gamepad2,
  CalendarCheck,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type DashboardWeeklyActivity = {
  day: string;
  applications: number;
};

type DashboardPlatformDistribution = {
  platform: string;
  count: number;
};

type DashboardRecentApplication = {
  id: string;
  runnerName: string;
  game: string;
  category: string;
  platform: string;
  status: string;
  submittedAt: string;
};

type DashboardTopGame = {
  game: string;
  count: number;
};

type DashboardStats = {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  scheduledRuns: number;
  isSchedulePublished: boolean;
  weeklyActivity: DashboardWeeklyActivity[];
  platformDistribution: DashboardPlatformDistribution[];
  recentApplications: DashboardRecentApplication[];
  topGames: DashboardTopGame[];
};

const chartColors = [
  "#22d3ee",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

function formatStatus(status: string) {
  switch (status) {
    case "Pending":
      return "Pendiente";

    case "Approved":
      return "Aprobada";

    case "Rejected":
      return "Rechazada";

    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "Pending":
      return "bg-yellow-500/20 text-yellow-400";

    case "Approved":
      return "bg-green-500/20 text-green-400";

    case "Rejected":
      return "bg-red-500/20 text-red-400";

    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

function formatDate(dateValue: string) {
  return new Date(dateValue)
    .toLocaleDateString(
      "es-MX",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
}

function formatRelativeTime(dateValue: string) {
  const date =
    new Date(dateValue);

  const now =
    new Date();

  const diffMs =
    now.getTime() - date.getTime();

  const diffMinutes =
    Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Hace unos segundos";
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  const diffHours =
    Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  const diffDays =
    Math.floor(diffHours / 24);

  return `Hace ${diffDays} d`;
}

function hasActivityData(
  weeklyActivity: DashboardWeeklyActivity[]
) {
  return weeklyActivity.some(
    (item) => item.applications > 0
  );
}

export default function AdminDashboard() {
  const [stats, setStats] =
    useState<DashboardStats | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getDashboardStats();

      setStats(data);
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo cargar el dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-white">
        Cargando dashboard...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-500/30 bg-red-500/10">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />

          <div>
            <h2 className="text-xl font-bold text-white">
              Error al cargar el dashboard
            </h2>

            <p className="mt-1 text-gray-400">
              {error}
            </p>
          </div>

          <Button
            onClick={loadStats}
            className="bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statsData = [
    {
      title: "Total Postulaciones",
      value: stats.totalApplications,
      icon: FileText,
      color: "from-cyan-400 to-blue-600",
      description: "Postulaciones recibidas",
    },
    {
      title: "Pendientes",
      value: stats.pendingApplications,
      icon: Clock,
      color: "from-yellow-400 to-orange-600",
      description: "Esperando revisión",
    },
    {
      title: "Aprobadas",
      value: stats.approvedApplications,
      icon: CheckCircle,
      color: "from-green-400 to-emerald-600",
      description: "Aceptadas para el evento",
    },
    {
      title: "Rechazadas",
      value: stats.rejectedApplications,
      icon: XCircle,
      color: "from-red-400 to-rose-600",
      description: "No aceptadas",
    },
  ];

  const maxTopGameCount =
    Math.max(
      ...stats.topGames.map(
        (game) => game.count
      ),
      1
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Dashboard
          </h1>

          <p className="text-gray-400">
            Resumen real de postulaciones, horario y actividad del evento
          </p>
        </div>

        <Button
          onClick={loadStats}
          variant="outline"
          className="w-fit border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="border-gray-800 bg-gray-900/50 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-400">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-white">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Event State */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm text-gray-400">
                Runs en horario
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {stats.scheduledRuns}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Entradas agregadas al horario
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-600">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm text-gray-400">
                Estado del horario
              </p>

              <div className="mt-2">
                {stats.isSchedulePublished ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    Publicado
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    Borrador
                  </Badge>
                )}
              </div>

              <p className="mt-3 text-sm text-gray-500">
                Controlado desde Constructor de Horarios
              </p>
            </div>

            <Link to="/admin/horarios">
              <Button
                variant="outline"
                className="border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                Ver horario
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Actividad últimos 7 días
              </h3>

              <BarChart3 className="h-5 w-5 text-gray-500" />
            </div>

            {hasActivityData(stats.weeklyActivity) ? (
              <ResponsiveContainer
                width="100%"
                height={250}
              >
                <AreaChart
                  data={stats.weeklyActivity}
                >
                  <defs>
                    <linearGradient
                      id="colorApplications"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22d3ee"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#22d3ee"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#9ca3af"
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#9ca3af"
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="applications"
                    name="Postulaciones"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center rounded-xl border border-dashed border-gray-800 text-center">
                <div>
                  <p className="font-medium text-white">
                    Sin actividad reciente
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Aquí aparecerán las postulaciones de los últimos 7 días.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Distribución por Plataforma
            </h3>

            {stats.platformDistribution.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={250}
              >
                <PieChart>
                  <Pie
                    data={stats.platformDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="platform"
                    label={(entry) =>
                      `${entry.platform}: ${entry.count}`
                    }
                  >
                    {stats.platformDistribution.map(
                      (_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            chartColors[
                              index % chartColors.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center rounded-xl border border-dashed border-gray-800 text-center">
                <div>
                  <p className="font-medium text-white">
                    Sin plataformas registradas
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Se llenará automáticamente con las postulaciones.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions and Top Games */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Postulaciones Recientes
              </h3>

              <Users className="h-5 w-5 text-gray-400" />
            </div>

            {stats.recentApplications.length > 0 ? (
              <div className="space-y-3">
                {stats.recentApplications.map(
                  (application) => (
                    <div
                      key={application.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-800 bg-gray-800/50 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {application.runnerName}
                        </p>

                        <p className="text-sm text-gray-400">
                          {application.game} •{" "}
                          {application.category} •{" "}
                          {application.platform}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            application.submittedAt
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(
                            application.submittedAt
                          )}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {formatStatus(
                            application.status
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center">
                <p className="font-medium text-white">
                  Aún no hay postulaciones
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Cuando llegue una postulación, aparecerá aquí.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Games */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Juegos Más Enviados
            </h3>

            {stats.topGames.length > 0 ? (
              <div className="space-y-4">
                {stats.topGames.map(
                  (game, index) => (
                    <div
                      key={game.game}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-white">
                          {game.game}
                        </span>

                        <span className="text-sm font-semibold text-cyan-400">
                          {game.count}
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${
                              (game.count /
                                maxTopGameCount) *
                              100
                            }%`,
                            background:
                              chartColors[
                                index % chartColors.length
                              ],
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center">
                <Gamepad2 className="mx-auto mb-3 h-8 w-8 text-gray-600" />

                <p className="font-medium text-white">
                  Sin juegos todavía
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Se llenará con las postulaciones reales.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
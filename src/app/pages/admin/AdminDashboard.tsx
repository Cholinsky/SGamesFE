import { Card, CardContent } from "../../components/ui/card";
import {
  useEffect,
  useState
}
from "react";

import {
  getDashboardStats
}
from "../../services/dashboardService";

import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
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

const activityData = [
  { name: "Lun", postulaciones: 12 },
  { name: "Mar", postulaciones: 19 },
  { name: "Mié", postulaciones: 15 },
  { name: "Jue", postulaciones: 28 },
  { name: "Vie", postulaciones: 32 },
  { name: "Sáb", postulaciones: 21 },
  { name: "Dom", postulaciones: 20 },
];

const platformData = [
  { name: "PC", value: 45, color: "#06b6d4" },
  { name: "Nintendo", value: 32, color: "#8b5cf6" },
  { name: "PlayStation", value: 28, color: "#ec4899" },
  { name: "Xbox", value: 18, color: "#10b981" },
  { name: "Retro", value: 24, color: "#f59e0b" },
];

const recentSubmissions = [
  {
    id: "1",
    runner: "SpeedyGonzalez",
    game: "Celeste",
    category: "Any%",
    status: "pending",
    time: "Hace 5 min",
  },
  {
    id: "2",
    runner: "MarioMaster",
    game: "Super Mario Odyssey",
    category: "Any%",
    status: "approved",
    time: "Hace 15 min",
  },
  {
    id: "3",
    runner: "ZeldaLegend",
    game: "Breath of the Wild",
    category: "All Shrines",
    status: "pending",
    time: "Hace 32 min",
  },
  {
    id: "4",
    runner: "DarkSoulsKing",
    game: "Dark Souls III",
    category: "All Bosses",
    status: "rejected",
    time: "Hace 1 hora",
  },
  {
    id: "5",
    runner: "HollowKnightFan",
    game: "Hollow Knight",
    category: "112%",
    status: "approved",
    time: "Hace 2 horas",
  },
];

const topGames = [
  { game: "Celeste", count: 23, color: "from-cyan-500 to-blue-600" },
  { game: "Super Mario Odyssey", count: 19, color: "from-red-500 to-rose-600" },
  { game: "Hollow Knight", count: 17, color: "from-purple-500 to-pink-600" },
  { game: "Breath of the Wild", count: 15, color: "from-green-500 to-emerald-600" },
  { game: "Dark Souls III", count: 12, color: "from-orange-500 to-amber-600" },
];
type DashboardStats =
{
  totalApplications:
    number;

  pendingApplications:
    number;

  approvedApplications:
    number;

  rejectedApplications:
    number;
};
export default function AdminDashboard()
{
  const [stats,
    setStats] =
    useState<DashboardStats | null>(
      null
    );

  useEffect(() =>
  {
    loadStats();
  }, []);

  async function loadStats()
  {
    try
    {
      const data =
        await getDashboardStats();

      setStats(data);
    }
    catch (error)
    {
      console.error(error);
    }
  }

  if (!stats)
  {
    return (
      <div className="text-white">
        Cargando dashboard...
      </div>
    );
  }

  const statsData = [
  {
    title:
      "Total Postulaciones",

    value:
      stats.totalApplications,

    icon:
      FileText,

    color:
      "from-cyan-500 to-blue-600",

    change:
      ""
  },

  {
    title:
      "Pendientes",

    value:
      stats.pendingApplications,

    icon:
      Clock,

    color:
      "from-yellow-500 to-orange-600",

    change:
      ""
  },

  {
    title:
      "Aprobadas",

    value:
      stats.approvedApplications,

    icon:
      CheckCircle,

    color:
      "from-green-500 to-emerald-600",

    change:
      ""
  },

  {
    title:
      "Rechazadas",

    value:
      stats.rejectedApplications,

    icon:
      XCircle,

    color:
      "from-red-500 to-rose-600",

    change:
      ""
  }
];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">
          Resumen general de postulaciones y actividad del evento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-gray-800 bg-gray-900/50 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p
                      className={`mt-2 flex items-center gap-1 text-sm ${
                        stat.change.startsWith("+")
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {stat.change} vs semana anterior
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Actividad Semanal
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorPostulaciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="postulaciones"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPostulaciones)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Distribución por Plataforma
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
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

            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {submission.runner}
                    </p>
                    <p className="text-sm text-gray-400">
                      {submission.game} • {submission.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {submission.time}
                    </span>
                    {submission.status === "pending" && (
                      <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                        Pendiente
                      </span>
                    )}
                    {submission.status === "approved" && (
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                        Aprobada
                      </span>
                    )}
                    {submission.status === "rejected" && (
                      <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                        Rechazada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Games */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Juegos Más Enviados
            </h3>
            <div className="space-y-4">
              {topGames.map((game, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {game.game}
                    </span>
                    <span className="text-sm font-semibold text-cyan-400">
                      {game.count}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                    <div
                      className={`h-full bg-gradient-to-r ${game.color}`}
                      style={{ width: `${(game.count / 23) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

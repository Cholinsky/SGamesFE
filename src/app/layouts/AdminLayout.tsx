import {
  Outlet,
  Link,
  useLocation
} from "react-router";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  Bell,
  User,
  Users,
  Menu,
  X,
  Newspaper,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  useEffect,
  useState
} from "react";
import { useAuth } from "../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  getAdminNotificationSummary,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotificationItem,
} from "../services/adminNotificationService";



type AdminNotificationSummary = {
  total: number;
  pendingApplications: number;
  approvedWithoutSchedule: number;
  scheduleUnpublished: boolean;
  hiddenPosts: number;
  items: AdminNotificationItem[];
};

export function AdminLayout() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<AdminNotificationSummary>({
      total: 0,
      pendingApplications: 0,
      approvedWithoutSchedule: 0,
      scheduleUnpublished: false,
      hiddenPosts: 0,
      items: [],
    });

  const { user, logout } =
    useAuth();

  const isActive = (path: string) =>
    location.pathname === path;

  const navigation = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Postulaciones",
    path: "/admin/postulaciones",
    icon: FileText,
  },
  {
    name: "Horarios",
    path: "/admin/horarios",
    icon: Calendar,
  },
  {
    name: "Publicaciones",
    path: "/admin/publicaciones",
    icon: Newspaper,
  },
  {
    name: "Runners",
    path: "/admin/runners",
    icon: Users,
  },
  {
    name: "Configuración",
    path: "/admin/configuracion",
    icon: Settings,
  },
];

  useEffect(() => {
    loadNotifications();
  }, [location.pathname]);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        loadNotifications();
      }, 60000);

    return () =>
      window.clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      const data =
        await getAdminNotificationSummary();

      setNotifications(data);
    } catch (error) {
      console.error(error);

      setNotifications({
        total: 0,
        pendingApplications: 0,
        approvedWithoutSchedule: 0,
        scheduleUnpublished: false,
        hiddenPosts: 0,
        items: [],
      });
    }
  }

  async function handleReadNotification(
  item: AdminNotificationItem
) {
  try {
    await markAdminNotificationRead(item);

    setNotifications((current) => {
      const newItems =
        current.items.filter(
          (notification) =>
            !(
              notification.type === item.type &&
              notification.signature === item.signature
            )
        );

      return {
        ...current,
        total: newItems.reduce(
          (sum, notification) =>
            sum + notification.count,
          0
        ),
        items: newItems,
      };
    });
  } catch (error) {
    console.error(error);
  }
}

async function handleMarkAllRead() {
  try {
    const currentItems =
      notifications.items;

    if (currentItems.length === 0) {
      return;
    }

    await markAllAdminNotificationsRead(
      currentItems
    );

    setNotifications((current) => ({
      ...current,
      total: 0,
      items: [],
    }));
  } catch (error) {
    console.error(error);
  }
}

  const handleLogout = () => {
    logout();
  };

  function getNotificationIcon(
    type: string
  ) {
    if (type === "pendingApplications") {
      return (
        <Clock className="h-4 w-4 text-yellow-400" />
      );
    }

    if (type === "approvedWithoutSchedule") {
      return (
        <Calendar className="h-4 w-4 text-cyan-400" />
      );
    }

    if (type === "scheduleUnpublished") {
      return (
        <AlertCircle className="h-4 w-4 text-pink-400" />
      );
    }

    return (
      <Bell className="h-4 w-4 text-purple-400" />
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 border-r border-gray-800 bg-gray-900 lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-800 px-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
              SGames Admin
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive(item.path)
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Desktop */}
          <div className="border-t border-gray-800 p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <aside className="absolute left-0 top-0 h-full w-64 border-r border-gray-800 bg-gray-900">
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
                  SGames Admin
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() =>
                        setSidebarOpen(false)
                      }
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                        isActive(item.path)
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Mobile */}
              <div className="border-t border-gray-800 p-4">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-4">
              {/* Real Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-300 hover:bg-gray-800 hover:text-white"
                    title="Notificaciones"
                  >
                    <Bell className="h-5 w-5" />

                    {notifications.total > 0 && (
                      <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0 text-xs text-white">
                        {notifications.total > 99
                          ? "99+"
                          : notifications.total}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-80 border-gray-800 bg-gray-900 text-white"
                >
                  <DropdownMenuLabel className="flex items-center justify-between gap-3 text-gray-300">
                    <span>Notificaciones</span>

                    {notifications.items.length > 0 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleMarkAllRead}
                        className="h-7 px-2 text-xs text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200"
                      >
                        Marcar leídas
                      </Button>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-300">
                        Todo bien
                      </Badge>
                    )}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-800" />

                  {notifications.items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-400" />

                      <p className="font-medium text-white">
                        Sin pendientes
                      </p>

                      <p className="text-sm text-gray-500">
                        No hay alertas administrativas por ahora.
                      </p>
                    </div>
                  ) : (
                    notifications.items.map((item) => (
                      <DropdownMenuItem
                        key={item.type}
                        className="cursor-pointer focus:bg-gray-800"
                      >
                        <Link
                          to={item.path}
                          onClick={() =>
                            handleReadNotification(item)
                          }
                          className="flex w-full gap-3 py-2"
                        >
                          <div className="mt-1">
                            {getNotificationIcon(item.type)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-white">
                                {item.title}
                              </p>

                              <Badge className="bg-cyan-500/20 text-cyan-300">
                                {item.count}
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm leading-snug text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3"
                  >
                    <Avatar>
                      <AvatarImage src="" />

                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="hidden text-left md:block">
                      <p className="text-sm font-medium text-white">
                        {user?.nombre ||
                          "Administrador"}
                      </p>

                      <p className="text-xs text-gray-400">
                        {user?.email ||
                          "admin@sgames.com"}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 border-gray-800 bg-gray-900"
                >
                  <DropdownMenuLabel className="text-gray-400">
                    Mi Cuenta
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-800" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


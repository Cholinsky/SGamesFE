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
import { useAdminSeasonTheme } from "../hooks/useAdminSeasonTheme";




const adminLayoutThemeCss = `
  .sgames-admin-layout {
    background:
      radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--sg-primary) 12%, transparent), transparent 30rem),
      radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--sg-accent) 10%, transparent), transparent 32rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 50%, var(--sg-background) 50%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
    color: var(--sg-text);
  }

  .sgames-admin-sidebar {
    border-color: var(--sg-border);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--sg-surface) 88%, #000000 12%),
        color-mix(in srgb, var(--sg-background) 92%, #000000 8%)
      );
    box-shadow:
      18px 0 45px color-mix(in srgb, var(--sg-background) 78%, transparent);
  }

  .sgames-admin-sidebar-header {
    border-color: var(--sg-border);
  }

  .sgames-admin-logo-text {
    background:
      linear-gradient(
        90deg,
        var(--sg-primary),
        var(--sg-secondary),
        var(--sg-accent)
      );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .sgames-admin-nav-link {
    color: var(--sg-muted-text);
  }

  .sgames-admin-nav-link:hover {
    background: color-mix(in srgb, var(--sg-primary) 8%, transparent);
    color: var(--sg-text);
  }

  .sgames-admin-nav-link-active {
    border: 1px solid color-mix(in srgb, var(--sg-primary) 34%, transparent);
    background:
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--sg-primary) 15%, transparent),
        color-mix(in srgb, var(--sg-secondary) 10%, transparent)
      );
    color: var(--sg-primary);
    box-shadow:
      0 0 24px color-mix(in srgb, var(--sg-primary) 10%, transparent);
  }

  .sgames-admin-sidebar-footer {
    border-color: var(--sg-border);
  }

  .sgames-admin-header {
    border-color: var(--sg-border);
    background:
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--sg-surface) 90%, #000000 10%),
        color-mix(in srgb, var(--sg-background) 92%, #000000 8%)
      );
    box-shadow:
      0 12px 34px color-mix(in srgb, var(--sg-background) 62%, transparent);
    backdrop-filter: blur(14px);
  }

  .sgames-admin-main {
    background:
      radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--sg-primary) 8%, transparent), transparent 26rem),
      radial-gradient(circle at 90% 8%, color-mix(in srgb, var(--sg-accent) 7%, transparent), transparent 30rem),
      transparent;
  }

  .sgames-admin-icon-button {
    color: var(--sg-muted-text);
  }

  .sgames-admin-icon-button:hover {
    background: color-mix(in srgb, var(--sg-primary) 9%, transparent);
    color: var(--sg-text);
  }

  .sgames-admin-avatar-fallback {
    background:
      linear-gradient(
        135deg,
        var(--sg-primary),
        var(--sg-secondary),
        var(--sg-accent)
      );
    color: #ffffff;
  }

  .sgames-admin-dropdown {
    border-color: var(--sg-border) !important;
    background: color-mix(in srgb, var(--sg-surface) 92%, #000000 8%) !important;
    color: var(--sg-text) !important;
    box-shadow:
      0 20px 50px color-mix(in srgb, var(--sg-background) 78%, transparent),
      0 0 26px color-mix(in srgb, var(--sg-accent) 12%, transparent);
  }

  .sgames-admin-dropdown-separator {
    background: var(--sg-border) !important;
  }

  .sgames-admin-notification-item:focus,
  .sgames-admin-notification-item:hover {
    background: color-mix(in srgb, var(--sg-primary) 8%, transparent) !important;
  }

  .sgames-admin-mobile-overlay {
    background: color-mix(in srgb, var(--sg-background) 72%, #000000 28%);
    backdrop-filter: blur(5px);
  }

  [data-admin-season-theme="Autumn"] .sgames-admin-layout {
    background:
      radial-gradient(circle at 12% 8%, rgba(249, 115, 22, 0.15), transparent 30rem),
      radial-gradient(circle at 88% 12%, rgba(185, 28, 28, 0.13), transparent 32rem),
      radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.07), transparent 34rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 62%, var(--sg-background) 38%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
  }

  [data-admin-season-theme="Winter"] .sgames-admin-layout {
    background:
      radial-gradient(circle at 12% 8%, rgba(103, 232, 249, 0.14), transparent 30rem),
      radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.14), transparent 32rem),
      radial-gradient(circle at 50% 100%, rgba(196, 181, 253, 0.07), transparent 34rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 62%, var(--sg-background) 38%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
  }
`;

type AdminNotificationSummary = {
  total: number;
  pendingApplications: number;
  approvedWithoutSchedule: number;
  scheduleUnpublished: boolean;
  hiddenPosts: number;
  items: AdminNotificationItem[];
};

export function AdminLayout() {
  useAdminSeasonTheme();

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
        <Calendar className="h-4 w-4 text-[var(--sg-primary)]" />
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
    <div className="sgames-admin-layout flex h-screen overflow-hidden">
      <style>{adminLayoutThemeCss}</style>
      {/* Sidebar Desktop */}
      <aside className="sgames-admin-sidebar hidden w-64 border-r lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="sgames-admin-sidebar-header flex h-16 items-center border-b px-6">
            <span className="sgames-admin-logo-text text-xl font-bold">
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
                  className={`sgames-admin-nav-link flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive(item.path)
                      ? "sgames-admin-nav-link-active"
                      : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Desktop */}
          <div className="sgames-admin-sidebar-footer border-t p-4">
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
            className="sgames-admin-mobile-overlay absolute inset-0"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <aside className="sgames-admin-sidebar absolute left-0 top-0 h-full w-64 border-r">
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="sgames-admin-sidebar-header flex h-16 items-center justify-between border-b px-6">
                <span className="sgames-admin-logo-text text-xl font-bold">
                  SGames Admin
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                >
                  <X className="h-6 w-6 text-[var(--sg-muted-text)]" />
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
                      className={`sgames-admin-nav-link flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                        isActive(item.path)
                          ? "sgames-admin-nav-link-active"
                          : ""
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Mobile */}
              <div className="sgames-admin-sidebar-footer border-t p-4">
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
        <header className="sgames-admin-header flex h-16 items-center justify-between border-b px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="sgames-admin-icon-button lg:hidden"
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
                    className="sgames-admin-icon-button relative"
                    title="Notificaciones"
                  >
                    <Bell className="h-5 w-5" />

                    {notifications.total > 0 && (
                      <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0 text-xs text-[var(--sg-text)]">
                        {notifications.total > 99
                          ? "99+"
                          : notifications.total}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="sgames-admin-dropdown w-80"
                >
                  <DropdownMenuLabel className="flex items-center justify-between gap-3 text-[var(--sg-muted-text)]">
                    <span>Notificaciones</span>

                    {notifications.items.length > 0 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleMarkAllRead}
                        className="h-7 px-2 text-xs text-[var(--sg-primary)] hover:bg-[color-mix(in_srgb,var(--sg-primary)_9%,transparent)] hover:text-[var(--sg-accent)]"
                      >
                        Marcar leídas
                      </Button>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-300">
                        Todo bien
                      </Badge>
                    )}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="sgames-admin-dropdown-separator" />

                  {notifications.items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-400" />

                      <p className="font-medium text-[var(--sg-text)]">
                        Sin pendientes
                      </p>

                      <p className="text-sm text-[color-mix(in_srgb,var(--sg-muted-text)_70%,transparent)]">
                        No hay alertas administrativas por ahora.
                      </p>
                    </div>
                  ) : (
                    notifications.items.map((item) => (
                      <DropdownMenuItem
                        key={item.type}
                        className="sgames-admin-notification-item cursor-pointer"
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
                              <p className="font-medium text-[var(--sg-text)]">
                                {item.title}
                              </p>

                              <Badge className="bg-[color-mix(in_srgb,var(--sg-primary)_16%,transparent)] text-[var(--sg-primary)]">
                                {item.count}
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm leading-snug text-[var(--sg-muted-text)]">
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
                    className="sgames-admin-icon-button flex items-center gap-3"
                  >
                    <Avatar>
                      <AvatarImage src="" />

                      <AvatarFallback className="sgames-admin-avatar-fallback">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="hidden text-left md:block">
                      <p className="text-sm font-medium text-[var(--sg-text)]">
                        {user?.nombre ||
                          "Administrador"}
                      </p>

                      <p className="text-xs text-[var(--sg-muted-text)]">
                        {user?.email ||
                          "admin@sgames.com"}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="sgames-admin-dropdown w-56"
                >
                  <DropdownMenuLabel className="text-[var(--sg-muted-text)]">
                    Mi Cuenta
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="sgames-admin-dropdown-separator" />

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
        <main className="sgames-admin-main flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
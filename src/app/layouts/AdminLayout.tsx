import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  Bell,
  User,
  Menu,
  X,
  Newspaper,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

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
      name: "Configuración",
      path: "/admin/configuracion",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
  };

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
            onClick={() => setSidebarOpen(false)}
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
                  onClick={() => setSidebarOpen(false)}
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
                      onClick={() => setSidebarOpen(false)}
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
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />

                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs">
                  3
                </Badge>
              </Button>

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
                        {user?.nombre || "Administrador"}
                      </p>

                      <p className="text-xs text-gray-400">
                        {user?.email || "admin@sgames.com"}
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
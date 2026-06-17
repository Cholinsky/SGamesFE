import { Outlet, Link, useLocation } from "react-router";
import { Gamepad2, Menu, X, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";

export function PublicLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
              SGames
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/"
              className={`transition-colors hover:text-cyan-400 ${
                isActive("/") ? "text-cyan-400" : "text-gray-300"
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/postulacion"
              className={`transition-colors hover:text-cyan-400 ${
                isActive("/postulacion") ? "text-cyan-400" : "text-gray-300"
              }`}
            >
              Postulación
            </Link>
            <Link
              to="/horario"
              className={`transition-colors hover:text-cyan-400 ${
                isActive("/horario") ? "text-cyan-400" : "text-gray-300"
              }`}
            >
              Horario
            </Link>
            <a
              href="#faq"
              className="text-gray-300 transition-colors hover:text-cyan-400"
            >
              FAQ
            </a>

            <div className="ml-2 border-l border-gray-700 pl-6">
              <Link to="/admin/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-800 bg-gray-900 md:hidden">
            <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  isActive("/") ? "text-cyan-400" : "text-gray-300"
                }`}
              >
                Inicio
              </Link>
              <Link
                to="/postulacion"
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  isActive("/postulacion") ? "text-cyan-400" : "text-gray-300"
                }`}
              >
                Postulación
              </Link>
              <Link
                to="/horario"
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  isActive("/horario") ? "text-cyan-400" : "text-gray-300"
                }`}
              >
                Horario
              </Link>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 transition-colors"
              >
                FAQ
              </a>

              <div className="border-t border-gray-700 pt-4">
                <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Panel de Administración
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text font-bold text-transparent">
                  SGames
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Un evento dedicado a reunir speedrunners de distintos juegos y
                plataformas.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-cyan-400">Redes Sociales</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a href="#" className="hover:text-cyan-400">
                  Twitter
                </a>
                <a href="#" className="hover:text-cyan-400">
                  Twitch
                </a>
                <a href="#" className="hover:text-cyan-400">
                  Discord
                </a>
                <a href="#" className="hover:text-cyan-400">
                  YouTube
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-cyan-400">Contacto</h3>
              <div className="text-sm text-gray-400">
                <p>contacto@sgames.com</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2026 SGames. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

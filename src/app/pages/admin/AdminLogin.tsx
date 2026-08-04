import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  Mail,
  AlertCircle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  getActiveDesignTheme,
  type PublicDesignTheme,
} from "../../services/publicDesignThemeService";

const adminLoginThemeCss = `
  :root {
    --sg-primary: #22d3ee;
    --sg-secondary: #8b5cf6;
    --sg-accent: #ec4899;
    --sg-background: #070817;
    --sg-surface: #10182b;
    --sg-text: #ffffff;
    --sg-muted-text: #94a3b8;
    --sg-border: rgba(139, 92, 246, 0.22);
    --sg-hero-gradient:
      radial-gradient(circle at top left, rgba(34, 211, 238, 0.12), transparent 32rem),
      radial-gradient(circle at top right, rgba(236, 72, 153, 0.12), transparent 32rem),
      #070817;
  }

  .sgames-admin-login-page {
    background:
      radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--sg-primary) 18%, transparent), transparent 30rem),
      radial-gradient(circle at 88% 18%, color-mix(in srgb, var(--sg-accent) 15%, transparent), transparent 32rem),
      radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--sg-secondary) 10%, transparent), transparent 34rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 62%, var(--sg-background) 38%) 0%, var(--sg-background) 54%, var(--sg-background) 100%);
    color: var(--sg-text);
  }

  .sgames-admin-login-grid {
    background-image:
      linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
    background-size: 46px 46px;
    opacity: 0.28;
  }

  .sgames-admin-login-orb-primary {
    background:
      radial-gradient(circle, color-mix(in srgb, var(--sg-primary) 28%, transparent), transparent 68%);
  }

  .sgames-admin-login-orb-accent {
    background:
      radial-gradient(circle, color-mix(in srgb, var(--sg-accent) 24%, transparent), transparent 70%);
  }

  .sgames-admin-login-icon {
    background:
      linear-gradient(
        135deg,
        var(--sg-primary),
        var(--sg-secondary),
        var(--sg-accent)
      );
    box-shadow:
      0 0 34px color-mix(in srgb, var(--sg-accent) 30%, transparent);
  }

  .sgames-admin-login-title {
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

  .sgames-admin-login-card {
    border: 1px solid var(--sg-border);
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--sg-surface) 78%, transparent),
        color-mix(in srgb, var(--sg-background) 84%, transparent)
      );
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--sg-primary) 10%, transparent),
      0 0 36px color-mix(in srgb, var(--sg-accent) 14%, transparent);
    backdrop-filter: blur(16px);
  }

  .sgames-admin-login-input {
    border-color: var(--sg-border) !important;
    background: color-mix(in srgb, var(--sg-background) 82%, #000000 18%) !important;
    color: var(--sg-text) !important;
  }

  .sgames-admin-login-input::placeholder {
    color: color-mix(in srgb, var(--sg-muted-text) 52%, transparent);
  }

  .sgames-admin-login-input:focus {
    border-color: color-mix(in srgb, var(--sg-primary) 70%, transparent) !important;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--sg-primary) 24%, transparent),
      0 0 20px color-mix(in srgb, var(--sg-primary) 14%, transparent);
  }

  .sgames-admin-login-submit {
    border: 0;
    background:
      linear-gradient(
        90deg,
        var(--sg-primary),
        var(--sg-secondary),
        var(--sg-accent)
      );
    color: #ffffff;
    box-shadow:
      0 0 28px color-mix(in srgb, var(--sg-accent) 24%, transparent);
  }

  .sgames-admin-login-submit:hover {
    filter: brightness(1.12);
  }

  .sgames-admin-login-back {
    color: var(--sg-muted-text) !important;
  }

  .sgames-admin-login-back:hover {
    color: var(--sg-primary) !important;
    background: color-mix(in srgb, var(--sg-primary) 8%, transparent) !important;
  }

  [data-season-theme="Autumn"] .sgames-admin-login-page {
    background:
      radial-gradient(circle at 12% 8%, rgba(249, 115, 22, 0.18), transparent 30rem),
      radial-gradient(circle at 88% 18%, rgba(185, 28, 28, 0.16), transparent 32rem),
      radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.08), transparent 34rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 54%, var(--sg-background) 100%);
  }

  [data-season-theme="Winter"] .sgames-admin-login-page {
    background:
      radial-gradient(circle at 12% 8%, rgba(103, 232, 249, 0.16), transparent 30rem),
      radial-gradient(circle at 88% 18%, rgba(59, 130, 246, 0.16), transparent 32rem),
      radial-gradient(circle at 50% 100%, rgba(196, 181, 253, 0.08), transparent 34rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 54%, var(--sg-background) 100%);
  }

  [data-season-theme="Winter"] .sgames-admin-login-grid {
    background-image:
      linear-gradient(rgba(248, 251, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(248, 251, 255, 0.05) 1px, transparent 1px);
  }

  [data-season-theme="Autumn"] .sgames-admin-login-grid {
    background-image:
      linear-gradient(rgba(255, 247, 237, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 247, 237, 0.045) 1px, transparent 1px);
  }
`;

function normalizeSeasonKey(
  seasonKey?: string | null
) {
  const cleanSeason =
    seasonKey?.trim();

  if (
    cleanSeason === "Winter" ||
    cleanSeason === "Autumn" ||
    cleanSeason === "Summer"
  ) {
    return cleanSeason;
  }

  return "Summer";
}

function applyLoginTheme(
  theme: PublicDesignTheme
) {
  const root =
    document.documentElement;

  root.style.setProperty(
    "--sg-primary",
    theme.primaryColor
  );
  root.style.setProperty(
    "--sg-secondary",
    theme.secondaryColor
  );
  root.style.setProperty(
    "--sg-accent",
    theme.accentColor
  );
  root.style.setProperty(
    "--sg-background",
    theme.backgroundColor
  );
  root.style.setProperty(
    "--sg-surface",
    theme.surfaceColor
  );
  root.style.setProperty(
    "--sg-text",
    theme.textColor
  );
  root.style.setProperty(
    "--sg-muted-text",
    theme.mutedTextColor
  );
  root.style.setProperty(
    "--sg-border",
    theme.borderColor
  );

  if (theme.heroGradient) {
    root.style.setProperty(
      "--sg-hero-gradient",
      theme.heroGradient
    );
  }

  if (theme.cardGradient) {
    root.style.setProperty(
      "--sg-card-gradient",
      theme.cardGradient
    );
  }
}

export default function AdminLogin() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [seasonKey, setSeasonKey] =
    useState("Summer");

  const { login } =
    useAuth();

  const navigate =
    useNavigate();

  useEffect(() => {
    loadActiveTheme();
  }, []);

  async function loadActiveTheme() {
    try {
      const theme =
        await getActiveDesignTheme();

      applyLoginTheme(theme);

      setSeasonKey(
        normalizeSeasonKey(
          theme?.seasonKey
        )
      );
    } catch (error) {
      console.error(error);
      setSeasonKey("Summer");
    }
  }

  const handleSubmit =
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);

      try {
        const success =
          await login(
            email,
            password
          );

        if (success) {
          toast.success(
            "¡Bienvenido al panel de administración!"
          );

          navigate("/admin");
        } else {
          setError(
            "Credenciales incorrectas"
          );

          toast.error(
            "Credenciales incorrectas"
          );
        }
      } catch (err) {
        setError(
          "Error al iniciar sesión"
        );

        toast.error(
          "Error al iniciar sesión"
        );
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div
      className="sgames-admin-login-page relative flex min-h-screen items-center justify-center overflow-hidden"
      data-season-theme={seasonKey}
    >
      <style>{adminLoginThemeCss}</style>

      <div className="sgames-admin-login-orb-primary pointer-events-none absolute -left-32 top-0 h-96 w-96 blur-3xl" />

      <div className="sgames-admin-login-orb-accent pointer-events-none absolute -right-32 bottom-0 h-96 w-96 blur-3xl" />

      <div className="sgames-admin-login-grid pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="sgames-admin-login-icon mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>

          <h1 className="sgames-admin-login-title mb-2 text-3xl font-bold">
            Panel de Administración
          </h1>

          <p className="text-[var(--sg-muted-text)]">
            SGames
          </p>
        </div>

        {/* Login Card */}
        <Card className="sgames-admin-login-card">
          <CardHeader>
            <CardTitle className="text-center text-[var(--sg-text)]">
              Iniciar Sesión
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-[var(--sg-muted-text)]"
                >
                  Correo electrónico
                </Label>

                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_srgb,var(--sg-muted-text)_60%,transparent)]" />

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="sgames-admin-login-input pl-10"
                    placeholder="correo@dominio"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label
                  htmlFor="password"
                  className="text-[var(--sg-muted-text)]"
                >
                  Contraseña
                </Label>

                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_srgb,var(--sg-muted-text)_60%,transparent)]" />

                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="sgames-admin-login-input pl-10"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="sgames-admin-login-submit w-full"
                disabled={isLoading}
              >
                {isLoading
                  ? "Iniciando sesión..."
                  : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() =>
              navigate("/")
            }
            className="sgames-admin-login-back"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import {
  ExternalLink,
  Link2,
  Radio,
  RefreshCw,
  Save,
  Search,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { getStreamPanelAdmin } from "../../services/streamPanelService";
import {
  createTwitchAuthorizationUrl,
  disconnectTwitch,
  getTwitchStatus,
  searchTwitchCategories,
  updateTwitchChannel,
  updateTwitchFromStreamSettings,
  type TwitchCategory,
  type TwitchIntegrationStatus,
} from "../../services/twitchStreamService";

function parseGameNameFromDisplayData(
  displayDataJson?: string | null
) {
  if (!displayDataJson) {
    return "";
  }

  try {
    const parsed =
      JSON.parse(displayDataJson);

    return String(
      parsed?.gameName ??
      ""
    );
  } catch {
    return "";
  }
}

function splitTags(
  value: string
) {
  return value
    .split(",")
    .map((item) =>
      item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export default function AdminTwitchStreamTools() {
  const [status, setStatus] =
    useState<TwitchIntegrationStatus | null>(null);

  const [title, setTitle] =
    useState("");

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [language, setLanguage] =
    useState("es");

  const [tags, setTags] =
    useState("speedrun, SGames");

  const [categories, setCategories] =
    useState<TwitchCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const connectedLabel =
    useMemo(() => {
      if (!status?.isConnected) {
        return "No conectado";
      }

      return status.broadcasterDisplayName ||
        status.broadcasterLogin ||
        "Twitch conectado";
    }, [
      status,
    ]);

  async function loadStatus(
    silent = false
  ) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const data =
        await getTwitchStatus();

      setStatus(data);
    } catch (error) {
      console.error(error);

      if (!silent) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo cargar Twitch"
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  async function loadSgamesStreamData() {
    try {
      const panel =
        await getStreamPanelAdmin();

      const streamTitle =
        panel.settings?.streamTitle ||
        panel.currentItem?.title ||
        panel.eventName ||
        "";

      const gameName =
        parseGameNameFromDisplayData(
          panel.currentItem?.displayDataJson
        );

      setTitle(streamTitle);

      if (gameName) {
        setCategoryName(gameName);
      }

      toast.success(
        "Datos de SGames cargados"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar datos de SGames"
      );
    }
  }

  async function handleConnect() {
    try {
      const data =
        await createTwitchAuthorizationUrl();

      window.location.href =
        data.authorizationUrl;
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar conexión con Twitch"
      );
    }
  }

  async function handleDisconnect() {
    try {
      const data =
        await disconnectTwitch();

      setStatus(data);

      toast.success(
        "Twitch desconectado"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo desconectar Twitch"
      );
    }
  }

  async function handleSearchCategory() {
    if (categoryName.trim().length < 2) {
      toast.error(
        "Escribe al menos 2 caracteres para buscar categoría"
      );

      return;
    }

    try {
      setSearching(true);

      const results =
        await searchTwitchCategories(
          categoryName.trim()
        );

      setCategories(results);

      if (!results.length) {
        toast.message(
          "No se encontraron categorías"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo buscar la categoría"
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleUpdateTwitch() {
    try {
      setSaving(true);

      const result =
        await updateTwitchChannel({
          title:
            title.trim(),
          categoryId:
            categoryId || null,
          categoryName:
            categoryId
              ? categoryName.trim()
              : categoryName.trim(),
          broadcasterLanguage:
            language.trim() || null,
          tags:
            splitTags(tags),
        });

      toast.success(
        result.message ||
        "Twitch actualizado"
      );

      await loadStatus(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar Twitch"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateFromSgames() {
    try {
      setSaving(true);

      const result =
        await updateTwitchFromStreamSettings({
          useCurrentRunCategory:
            true,
          categoryName:
            categoryName.trim() || null,
          broadcasterLanguage:
            language.trim() || null,
          tags:
            splitTags(tags),
        });

      toast.success(
        result.message ||
        "Twitch actualizado desde SGames"
      );

      if (result.title) {
        setTitle(result.title);
      }

      if (result.categoryName) {
        setCategoryName(result.categoryName);
      }

      if (result.categoryId) {
        setCategoryId(result.categoryId);
      }

      await loadStatus(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar Twitch desde SGames"
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadStatus();

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (params.get("twitch") === "connected") {
      toast.success(
        "Twitch conectado correctamente"
      );
    }

    const twitchError =
      params.get("twitch_error");

    if (twitchError) {
      toast.error(
        twitchError
      );
    }
  }, []);

  return (
    <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
      <CardHeader>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[var(--sg-primary)]">
              <Radio className="h-5 w-5" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">
                Twitch API
              </span>
            </div>

            <CardTitle className="text-[var(--sg-text)]">
              Información del canal en Twitch
            </CardTitle>

            <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
              Actualiza título, categoría, idioma y tags del directo desde SGames.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                status?.isConnected
                  ? "bg-green-500/15 text-green-300"
                  : "bg-red-500/15 text-red-300"
              }
            >
              {loading
                ? "Cargando..."
                : connectedLabel}
            </Badge>

            {status?.isConnected ? (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="border-red-500/30 text-red-300"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Desconectar
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                className="sgames-admin-primary-button"
                disabled={
                  loading ||
                  status?.isConfigured === false
                }
              >
                <Link2 className="mr-2 h-4 w-4" />
                Conectar Twitch
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {status?.isConfigured === false && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Falta configurar Twitch en backend. Revisa Twitch:ClientId,
            Twitch:ClientSecret y Twitch:RedirectUri.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Título del directo
              </Label>

              <Input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="SGames 2026 - Día 1"
                maxLength={140}
              />
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Categoría / juego de Twitch
              </Label>

              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <Input
                  value={categoryName}
                  onChange={(event) => {
                    setCategoryName(event.target.value);
                    setCategoryId("");
                  }}
                  className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="Super Mario World"
                />

                <Button
                  onClick={handleSearchCategory}
                  variant="outline"
                  disabled={searching || !status?.isConnected}
                  className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>

              {categories.length > 0 && (
                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(category.id);
                        setCategoryName(category.name);
                        toast.success(
                          `Categoría seleccionada: ${category.name}`
                        );
                      }}
                      className={`rounded-xl border p-3 text-left text-sm transition ${
                        category.id === categoryId
                          ? "border-[var(--sg-primary)] bg-[var(--sg-admin-primary-soft)] text-[var(--sg-text)]"
                          : "border-[var(--sg-admin-border)] bg-black/20 text-[var(--sg-muted-text)] hover:border-[var(--sg-primary)]"
                      }`}
                    >
                      <p className="font-bold">
                        {category.name}
                      </p>

                      <p className="mt-1 text-xs opacity-70">
                        ID: {category.id}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-[160px_1fr]">
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Idioma
                </Label>

                <Input
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                  className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="es"
                  maxLength={10}
                />
              </div>

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Tags separados por coma
                </Label>

                <Input
                  value={tags}
                  onChange={(event) =>
                    setTags(event.target.value)
                  }
                  className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="speedrun, SGames"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
            <p className="text-sm font-bold text-[var(--sg-text)]">
              Estado de conexión
            </p>

            <div className="mt-3 space-y-2 text-sm text-[var(--sg-muted-text)]">
              <p>
                Canal:{" "}
                <span className="font-semibold text-[var(--sg-text)]">
                  {connectedLabel}
                </span>
              </p>

              <p>
                Scope requerido:{" "}
                <span className="font-mono text-[var(--sg-primary)]">
                  {status?.requiredScope || "channel:manage:broadcast"}
                </span>
              </p>

              {status?.expiresAtUtc && (
                <p>
                  Token expira:{" "}
                  {new Date(status.expiresAtUtc).toLocaleString()}
                </p>
              )}

              {status?.message && (
                <p className="text-yellow-300">
                  {status.message}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                onClick={loadSgamesStreamData}
                variant="outline"
                className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Cargar datos de SGames
              </Button>

              <Button
                onClick={handleUpdateFromSgames}
                disabled={saving || !status?.isConnected}
                className="sgames-admin-primary-button"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Actualizar desde SGames
              </Button>

              <Button
                onClick={handleUpdateTwitch}
                disabled={saving || !status?.isConnected}
                variant="outline"
                className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
              >
                <Save className="mr-2 h-4 w-4" />
                Actualizar manualmente
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
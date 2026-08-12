import {
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
import { Badge } from "../ui/badge";
import {
  Copy,
  Eye,
  MonitorUp,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getStreamDynamicOverlayUrl } from "../../services/streamPanelService";

type OverlayView =
  | "current-run"
  | "next-run"
  | "runner-tag"
  | "info-bar"
  | "intermission";

const overlayOptions: Array<{
  view: OverlayView;
  title: string;
  description: string;
  recommendedSize: string;
}> = [
  {
    view: "current-run",
    title: "Current Run",
    description: "Juego, categoría, runner, estimado y comentaristas.",
    recommendedSize: "1920x1080",
  },
  {
    view: "next-run",
    title: "Next Run",
    description: "Tarjeta compacta para anunciar la siguiente run.",
    recommendedSize: "1920x1080",
  },
  {
    view: "runner-tag",
    title: "Runner Tag",
    description: "Nameplate pequeño para poner sobre barras existentes.",
    recommendedSize: "800x220",
  },
  {
    view: "info-bar",
    title: "Info Bar",
    description: "Mensaje rápido para avisos, breaks o información del staff.",
    recommendedSize: "1920x240",
  },
  {
    view: "intermission",
    title: "Intermission",
    description: "Tarjeta central para BRB, comenzando o terminando stream.",
    recommendedSize: "1920x1080",
  },
];

export default function AdminStreamDynamicOverlayTools() {
  const [previewView, setPreviewView] =
    useState<OverlayView>("current-run");

  const previewUrl =
    useMemo(
      () => getStreamDynamicOverlayUrl(previewView),
      [previewView]
    );

  async function copyUrl(
    view: OverlayView
  ) {
    const url =
      getStreamDynamicOverlayUrl(view);

    await navigator.clipboard.writeText(url);

    toast.success(
      `URL de ${view} copiada`
    );
  }

  return (
    <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
      <CardHeader className="border-b border-[var(--sg-admin-border)]">
        <CardTitle className="flex items-center gap-2 text-[var(--sg-text)]">
          <Sparkles className="h-5 w-5 text-[var(--sg-primary)]" />
          Overlays dinámicos para OBS
        </CardTitle>

        <p className="text-sm text-[var(--sg-muted-text)]">
          Estos Browser Sources se actualizan solos con la cola del stream. Úsalos encima de tus overlays base hechos por el equipo.
        </p>
      </CardHeader>

      <CardContent className="grid gap-5 p-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="grid gap-3">
          {overlayOptions.map((option) => (
            <div
              key={option.view}
              className={`rounded-2xl border p-4 ${
                previewView === option.view
                  ? "border-[var(--sg-primary)] bg-[var(--sg-admin-primary-soft)]"
                  : "border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)]"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[var(--sg-text)]">
                      {option.title}
                    </h3>

                    <Badge className="bg-black/25 text-[var(--sg-muted-text)]">
                      {option.recommendedSize}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                    {option.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPreviewView(option.view)
                    }
                    className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyUrl(option.view)
                    }
                    className="border-[var(--sg-admin-border)] text-[var(--sg-secondary)]"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[var(--sg-text)]">
                Vista previa
              </p>

              <p className="text-sm text-[var(--sg-muted-text)]">
                Esta misma URL es la que puedes pegar en OBS.
              </p>
            </div>

            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
              >
                <MonitorUp className="mr-2 h-4 w-4" />
                Abrir
              </Button>
            </a>
          </div>

          <div className="aspect-video overflow-hidden rounded-2xl border border-[var(--sg-admin-border)] bg-black">
            <iframe
              title="Vista previa overlay dinámico"
              src={previewUrl}
              className="h-full w-full"
            />
          </div>

          <p className="mt-3 break-all rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] p-3 text-xs text-[var(--sg-muted-text)]">
            {previewUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
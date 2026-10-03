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

type OverlayView =
  | "runner-tag"
  | "game-name"
  | "category-name"
  | "estimate"
  | "platform-name"
  | "release-date"
  | "event-schedule-horizontal"
  | "schedule-ticker"
  | "next-run";

const overlayOptions: Array<{
  view: OverlayView;
  title: string;
  description: string;
  recommendedSize: string;
  urlSuffix?: string;
}> = [
  {
    view: "schedule-ticker",
    title: "Horario tipo ticker",
    description: "Barra horizontal segmentada tipo GDQ para OBS.",
    recommendedSize: "900x70",
    urlSuffix: "&items=3",
  },
  {
    view: "runner-tag",
    title: "Nombre del runner",
    description: "Sólo letras del runner actual, sin fondo ni recuadro.",
    recommendedSize: "800x220",
  },
  {
    view: "game-name",
    title: "Nombre del juego",
    description: "Sólo letras del juego actual para colocarlo en el overlay base.",
    recommendedSize: "800x160",
  },
  {
    view: "category-name",
    title: "Categoría",
    description: "Sólo letras de la categoría actual.",
    recommendedSize: "800x140",
  },
  {
    view: "estimate",
    title: "Estimado",
    description: "Sólo texto del estimado de la run actual.",
    recommendedSize: "520x130",
  },
  {
    view: "platform-name",
    title: "Consola / plataforma",
    description: "Sólo letras de la consola o plataforma actual.",
    recommendedSize: "520x130",
  },
  {
    view: "release-date",
    title: "Fecha lanzamiento",
    description: "Sólo letras de la fecha de lanzamiento si existe en los datos.",
    recommendedSize: "520x130",
  },
  {
    view: "next-run",
    title: "Siguiente run",
    description: "Texto para la zona inferior o aviso de siguiente run.",
    recommendedSize: "760x180",
  },
];

function buildOverlayUrl(
  view: OverlayView,
  suffix?: string
) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "";

  return `${origin}/overlay/stream/dynamic?view=${view}${suffix ?? ""}`;
}

export default function AdminStreamDynamicOverlayTools() {
  const [previewView, setPreviewView] =
    useState<OverlayView>("event-schedule-horizontal");

  const previewOption =
    overlayOptions.find((option) =>
      option.view === previewView) ??
    overlayOptions[0];

  const previewUrl =
    useMemo(
      () =>
        buildOverlayUrl(
          previewOption.view,
          previewOption.urlSuffix),
      [
        previewOption,
      ]
    );

  async function copyUrl(
    option: typeof overlayOptions[number]
  ) {
    const url =
      buildOverlayUrl(
        option.view,
        option.urlSuffix);

    await navigator.clipboard.writeText(url);

    toast.success(
      `URL de ${option.title} copiada`
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
          Browser Sources transparentes para poner textos sueltos encima del overlay base de OBS.
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
                      copyUrl(option)
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

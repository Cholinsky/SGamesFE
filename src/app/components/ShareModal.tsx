import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Copy,
  Facebook,
  Instagram,
  Link as LinkIcon,
  MessageCircle,
  Share2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

export type SharePayload = {
  title: string;
  text?: string;
  url: string;
};

type ShareModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: SharePayload | null;
};

function getShareText(payload: SharePayload) {
  return [
    payload.title,
    payload.text,
    payload.url,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildXShareUrl(payload: SharePayload) {
  const text = [
    payload.title,
    payload.text,
  ]
    .filter(Boolean)
    .join(" - ");

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(payload.url)}`;
}

function buildFacebookShareUrl(payload: SharePayload) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    payload.url
  )}`;
}

function buildWhatsAppShareUrl(payload: SharePayload) {
  return `https://wa.me/?text=${encodeURIComponent(
    getShareText(payload)
  )}`;
}

async function copyToClipboard(value: string) {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard
  ) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea =
    document.createElement("textarea");

  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function ShareModal({
  open,
  onOpenChange,
  payload,
}: ShareModalProps) {
  if (!payload) {
    return null;
  }

  const canNativeShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  async function handleCopyLink() {
    try {
      await copyToClipboard(payload.url);
      toast.success("Enlace copiado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo copiar el enlace");
    }
  }

  async function handleCopyText() {
    try {
      await copyToClipboard(
        getShareText(payload)
      );

      toast.success(
        "Texto de compartir copiado"
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "No se pudo copiar el texto"
      );
    }
  }

  async function handleInstagram() {
    try {
      await copyToClipboard(
        getShareText(payload)
      );

      toast.success(
        "Texto copiado. Pégalo en Instagram."
      );

      window.open(
        "https://www.instagram.com/",
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "No se pudo preparar Instagram"
      );
    }
  }

  async function handleNativeShare() {
    if (!canNativeShare) {
      return;
    }

    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
    } catch {
      // El usuario puede cancelar el share nativo; no es error.
    }
  }

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: buildWhatsAppShareUrl(payload),
      className:
        "border-green-400/30 bg-green-500/10 text-green-200 hover:bg-green-500/20",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: buildFacebookShareUrl(payload),
      className:
        "border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20",
    },
    {
      name: "X",
      icon: null,
      href: buildXShareUrl(payload),
      className:
        "border-slate-400/30 bg-slate-500/10 text-slate-100 hover:bg-slate-500/20",
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[92vh] w-[95vw] overflow-y-auto border-violet-500/30 bg-[#0b1022] p-0 text-white sm:max-w-xl">
        <DialogHeader className="border-b border-violet-500/20 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Share2 className="h-5 w-5 text-cyan-300" />
            Compartir
          </DialogTitle>

          <DialogDescription className="text-slate-400">
            Elige dónde quieres compartir esta información de SGames.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="rounded-2xl border border-violet-500/20 bg-[#10182b]/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Vista previa
            </p>

            <h3 className="mt-2 text-lg font-black text-white">
              {payload.title}
            </h3>

            {payload.text && (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {payload.text}
              </p>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">
              Compartir en redes
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {shareOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <a
                    key={option.name}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-sm font-bold transition ${option.className}`}
                  >
                    {Icon ? (
                      <Icon className="h-6 w-6" />
                    ) : (
                      <span className="text-2xl leading-none">
                        𝕏
                      </span>
                    )}

                    <span>{option.name}</span>
                  </a>
                );
              })}

              <button
                type="button"
                onClick={handleInstagram}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-pink-400/30 bg-pink-500/10 px-3 py-4 text-sm font-bold text-pink-200 transition hover:bg-pink-500/20"
              >
                <Instagram className="h-6 w-6" />
                <span>Instagram</span>
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Instagram no permite compartir enlaces directo desde web como X,
              Facebook o WhatsApp. Por eso se copia el texto y se abre Instagram
              para que lo pegues en una historia, publicación o perfil.
            </p>
          </div>

          {canNativeShare && (
            <Button
              type="button"
              onClick={handleNativeShare}
              className="w-full bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 font-bold text-white hover:from-cyan-300 hover:via-violet-400 hover:to-pink-400"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Compartir con mi dispositivo
            </Button>
          )}

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-300">
              Enlace
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                readOnly
                value={payload.url}
                className="border-violet-500/20 bg-[#070817] text-white"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleCopyLink}
                className="border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Copiar link
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={handleCopyText}
              className="w-full text-slate-300 hover:bg-white/5 hover:text-pink-200"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar texto completo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
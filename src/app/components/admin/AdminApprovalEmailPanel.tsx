import {
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Mail,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPendingApprovalEmails,
  sendPendingApprovalEmails,
  type ApprovalEmailPendingGroup,
} from "../../services/applicationService";

function SmallPill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <span
      className={
        tone === "muted"
          ? "inline-flex items-center rounded-md border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--sg-muted-text)]"
          : "inline-flex items-center rounded-md border border-[var(--sg-admin-border)] bg-[var(--sg-admin-primary-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--sg-primary)]"
      }
    >
      {children}
    </span>
  );
}

export default function AdminApprovalEmailPanel() {
  const [groups, setGroups] =
    useState<ApprovalEmailPendingGroup[]>([]);

  const [totalRuns, setTotalRuns] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  async function loadPendingEmails() {
    try {
      setLoading(true);

      const result =
        await getPendingApprovalEmails(false);

      setGroups(
        result.pendingGroups ?? []
      );

      setTotalRuns(
        result.totalRuns ?? 0
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los correos pendientes"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPendingEmails() {
    if (!groups.length) {
      toast.message(
        "No hay correos pendientes"
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Se enviarán ${groups.length} correo(s) agrupando ${totalRuns} run(s) aprobada(s).\n\n¿Continuar?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSending(true);

      const result =
        await sendPendingApprovalEmails({
          includeFailed: false,
          dryRun: false,
        });

      toast.success(
        result.message ||
        "Correos enviados"
      );

      if (result.errors?.length) {
        toast.error(
          result.errors.join("\n")
        );
      }

      await loadPendingEmails();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron enviar los correos"
      );
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadPendingEmails();
  }, []);

  return (
    <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-[var(--sg-primary)]">
                <Mail className="h-5 w-5" />

                <span className="text-sm font-black uppercase tracking-[0.2em]">
                  Correos de aceptación
                </span>
              </div>

              <SmallPill>
                {groups.length} correo(s)
              </SmallPill>

              <SmallPill tone="muted">
                {totalRuns} run(s)
              </SmallPill>
            </div>

            <p className="text-sm text-[var(--sg-muted-text)]">
              Al aprobar runs se encolan correos. Al enviar, se agrupan por runner para no mandar spam.
              Las runs rechazadas no se mencionan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={loadPendingEmails}
              disabled={loading || sending}
              variant="outline"
              className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>

            <Button
              onClick={handleSendPendingEmails}
              disabled={sending || loading || groups.length === 0}
              className="sgames-admin-primary-button"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending
                ? "Enviando..."
                : "Enviar correos pendientes"}
            </Button>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.slice(0, 6).map((group) => (
              <div
                key={`${group.eventId}-${group.recipientEmail}`}
                className="rounded-xl border border-[var(--sg-admin-border)] bg-black/20 p-3"
              >
                <p className="truncate text-sm font-bold text-[var(--sg-text)]">
                  {group.recipientName}
                </p>

                <p className="truncate text-xs text-[var(--sg-muted-text)]">
                  {group.recipientEmail}
                </p>

                <p className="mt-2 text-xs text-[var(--sg-primary)]">
                  {group.totalRuns} run(s) aprobada(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

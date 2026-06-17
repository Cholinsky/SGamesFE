import { Badge } from "./ui/badge";

type Status = "pending" | "approved" | "rejected" | "published" | "draft";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    pending: {
      className: "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
      label: "Pendiente",
    },
    approved: {
      className: "bg-green-500/20 text-green-400 hover:bg-green-500/30",
      label: "Aprobado",
    },
    rejected: {
      className: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
      label: "Rechazado",
    },
    published: {
      className: "bg-green-500/20 text-green-400 hover:bg-green-500/30",
      label: "Publicado",
    },
    draft: {
      className: "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
      label: "Borrador",
    },
  };

  const variant = variants[status];

  return <Badge className={variant.className}>{variant.label}</Badge>;
}

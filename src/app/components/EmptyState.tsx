import { Card, CardContent } from "./ui/card";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-gray-800 bg-gray-900/30">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 text-gray-600">{icon}</div>}
        <h3 className="mb-2 text-lg font-semibold text-gray-400">{title}</h3>
        {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
}

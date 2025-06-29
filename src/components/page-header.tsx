import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
  actionButton?: React.ReactNode
}

export function PageHeader({ title, description, className, actionButton }: PageHeaderProps) {
  return (
    <div className={cn("px-4 lg:px-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actionButton && (
          <div className="flex items-center gap-2">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  )
} 
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

interface StandardFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitText: string
  cancelText?: string
  children: ReactNode
  trigger?: ReactNode
  side?: "top" | "bottom" | "left" | "right"
  forceSide?: boolean
  headerExtra?: ReactNode
}

export function StandardFormSheet({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  onCancel,
  submitText,
  cancelText = "Annulla",
  children,
  trigger,
  side = "right",
  forceSide = false,
  headerExtra,
}: StandardFormSheetProps) {
  const isMobile = useIsMobile()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  const sheetSide = forceSide ? side : (isMobile ? "bottom" : "right")

  const content = (
    <SheetContent 
      side={sheetSide} 
      className={sheetSide === "right" || sheetSide === "left" ? "w-full max-w-md sm:max-w-lg" : ""}
    >
      <SheetHeader className="gap-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </div>
          {headerExtra && (
            <div className="ml-4 flex-shrink-0">
              {headerExtra}
            </div>
          )}
        </div>
      </SheetHeader>
      
      <form 
        id="standard-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 overflow-y-auto px-4 text-sm min-w-0"
      >
        {children}
      </form>
      
      <SheetFooter>
        <Button type="submit" form="standard-form" className="w-full">
          {submitText}
        </Button>
      </SheetFooter>
    </SheetContent>
  )

  if (trigger) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        {content}
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {content}
    </Sheet>
  )
} 
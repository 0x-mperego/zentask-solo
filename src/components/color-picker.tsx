import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const COLOR_PRESETS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", 
  "#3b82f6", "#8b5cf6", "#ec4899", "#64748b", "#6b7280"
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
  size?: "sm" | "default"
}

export function ColorPicker({ 
  value, 
  onChange, 
  className = "",
  size = "default"
}: ColorPickerProps) {
  const buttonHeight = size === "sm" ? "h-7" : "h-9"
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full ${buttonHeight} justify-start ${className}`}
        >
          <div
            className="w-4 h-4 rounded-full border border-muted-foreground/20 mr-2"
            style={{ backgroundColor: value }}
          />
          <span className={size === "sm" ? "text-xs" : "text-sm"}>{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3">
        <div className="grid grid-cols-5 gap-2 mb-3">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-md border border-muted-foreground/20 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Personalizzato</Label>
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
} 
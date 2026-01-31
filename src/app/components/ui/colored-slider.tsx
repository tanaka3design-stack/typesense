import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/app/components/ui/utils"

interface ColoredSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  color?: 'blue' | 'yellow' | 'red' | 'green';
}

const ColoredSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  ColoredSliderProps
>(({ className, color = 'blue', ...props }, ref) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    green: 'bg-green-500',
  };

  const thumbColorClasses = {
    blue: 'border-blue-500 bg-white shadow-blue-200',
    yellow: 'border-yellow-400 bg-white shadow-yellow-200',
    red: 'border-red-500 bg-white shadow-red-200',
    green: 'border-green-500 bg-white shadow-green-200',
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        <SliderPrimitive.Range className={cn("absolute h-full", colorClasses[color])} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-5 w-5 rounded-full border-2 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "shadow-lg",
          thumbColorClasses[color]
        )}
      />
    </SliderPrimitive.Root>
  );
});
ColoredSlider.displayName = "ColoredSlider";

export { ColoredSlider };
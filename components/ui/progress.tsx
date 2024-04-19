"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

interface ProgressBarProps extends React.ComponentPropsWithoutRef<"div"> {
  progress: number;
}

const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  return (
    <div className="h-1 relative">
      <div className="absolute top-0 bottom-0 left-0 w-full h-full bg-gray-200 rounded-full"></div>
      <div
        style={{
          width: `${progress}%`,
        }}
        className={cn(
          "absolute top-0 bottom-0 left-0 h-full transition-all duration-150 bg-purple-500 rounded-full",
          className
        )}
      ></div>
      <div className="absolute top-0 bottom-0 left-0 flex items-center justify-center w-full h-full"></div>
    </div>
  );
};

export default ProgressBar;
export { Progress }



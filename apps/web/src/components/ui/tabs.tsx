import * as React from "react"

import { cn } from "@/lib/utils"

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>")
  }

  return context
}

function Tabs({
  value,
  onValueChange,
  className,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <TabsContext.Provider value={{ value, setValue: onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({
  className,
  children,
}: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-11 items-center rounded-full border border-[#d7e6f2] bg-white p-1",
        className
      )}
    >
      {children}
    </div>
  )
}

function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const { value: selectedValue, setValue } = useTabsContext()
  const isActive = selectedValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-[#0b2f4e] transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18b566]/30",
        isActive
          ? "bg-[#18b566] text-white shadow-sm"
          : "hover:bg-[#f5fbf7]",
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({
  value,
  className,
  children,
}: React.ComponentProps<"div"> & { value: string }) {
  const { value: selectedValue } = useTabsContext()

  if (selectedValue !== value) {
    return null
  }

  return (
    <div role="tabpanel" className={cn("mt-8", className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

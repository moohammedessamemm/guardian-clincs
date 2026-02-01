"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import { format } from "date-fns"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4", className)}
            formatters={{
                formatWeekdayName: (date) => format(date, 'EEEE')
            }}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-base font-bold text-slate-900",
                nav: "space-x-1 flex items-center bg-transparent p-1",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-8 w-8 bg-white p-0 text-slate-500 hover:text-slate-900 border-slate-200 shadow-sm"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "hidden", // Hide weekday labels as requested
                head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-slate-400",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 w-10 p-0 font-medium aria-selected:opacity-100 border border-transparent hover:border-blue-200 hover:shadow-sm rounded-lg transition-all"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-[#004b87] text-white hover:bg-[#003865] hover:text-white focus:bg-[#003865] focus:text-white shadow-md scale-110 font-bold z-10",
                day_today: "bg-slate-50 text-[#004b87] font-bold ring-1 ring-blue-100",
                day_outside:
                    "day-outside text-slate-300 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30",
                day_disabled: "hidden", // Hide unavailable days entirely
                day_range_middle:
                    "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                day_hidden: "invisible",
                ...classNames,
            }}

            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }

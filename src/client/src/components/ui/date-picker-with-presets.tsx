"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerWithPresetsProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePickerWithPresets({
  date,
  onDateChange,
  placeholder = "Chọn ngày",
  className,
  disabled = false,
}: DatePickerWithPresetsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon />
          {date ? format(date, "dd/MM/yyyy", { locale: vi }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
        <Select
          onValueChange={(value) =>
            onDateChange?.(addDays(new Date(), parseInt(value)))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhanh" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="0">Hôm nay</SelectItem>
            <SelectItem value="1">Ngày mai</SelectItem>
            <SelectItem value="3">Trong 3 ngày</SelectItem>
            <SelectItem value="7">Trong 1 tuần</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar 
            mode="single" 
            selected={date} 
            onSelect={onDateChange} 
            locale={vi}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}


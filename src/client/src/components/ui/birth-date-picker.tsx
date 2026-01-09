"use client"

import * as React from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface BirthDatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return format(date, "dd/MM/yyyy", { locale: vi })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function BirthDatePicker({
  date,
  onDateChange,
  placeholder = "dd/mm/yyyy",
  className,
  disabled = false,
}: BirthDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(formatDate(date))

  // Tính toán giới hạn tuổi hợp lý (at noon to avoid timezone issues)
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate(), 12, 0, 0, 0) // Tối thiểu 16 tuổi
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate(), 12, 0, 0, 0) // Tối đa 100 tuổi

  React.useEffect(() => {
    setInputValue(formatDate(date))
  }, [date])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate)
    setInputValue(formatDate(selectedDate))
    setOpen(false)
  }

  const formatInputMask = (value: string) => {
    // Chỉ giữ lại số
    const numbers = value.replace(/\D/g, '')
    
    // Format theo dd/mm/yyyy
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
    }
  }

  const parseInputDate = (value: string) => {
    // Parse dd/mm/yyyy format
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (match) {
      const [, day, month, year] = match
      
      // Create date at noon to avoid timezone issues
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0, 0)
      
      if (isValidDate(parsedDate) && 
          parsedDate >= minDate && 
          parsedDate <= maxDate) {
        return parsedDate
      }
    }
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const formattedValue = formatInputMask(rawValue)
    
    setInputValue(formattedValue)

    // Parse date nếu đủ 10 ký tự (dd/mm/yyyy)
    if (formattedValue.length === 10) {
      const parsedDate = parseInputDate(formattedValue)
      if (parsedDate) {
        onDateChange?.(parsedDate)
      }
    } else if (formattedValue.length === 0) {
      // Clear date nếu input trống
      onDateChange?.(undefined)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
    }
    
    // Allow backspace, delete, arrow keys, tab
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      return
    }
    
    // Allow numbers only
    if (!/\d/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <div className="relative">
      <Input
        value={inputValue}
        placeholder={placeholder}
        className={cn("bg-background pr-10", className)}
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        maxLength={10}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            disabled={disabled}
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Chọn ngày</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => date > maxDate || date < minDate}
            defaultMonth={date || new Date(1990, 0)}
            captionLayout="dropdown-buttons"
            fromYear={minDate.getFullYear()}
            toYear={maxDate.getFullYear()}
            locale={vi}
            initialFocus
            className="rounded-lg border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

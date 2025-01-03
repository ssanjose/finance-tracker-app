'use client';

import React, { useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';

interface CalendarWithTimeProps {
  /**
   * @param selected The selected date
   */
  selected: Date;
  /**
   * @param onSelect The function to call when a date is selected
   */
  onSelect: (...event: any[]) => void;
  /**
   * @param initialFocus Whether the calendar should be focused on the initial render
   */
  initialFocus: boolean;
}

const CalendarWithTime = ({ selected, onSelect, initialFocus }: CalendarWithTimeProps) => {
  const [time, setTime] = React.useState<string>("00:00");

  useEffect(() => {
    setTime(`${selected.getHours().toString().padStart(2, "0")}:${selected.getMinutes().toString().padStart(2, "0")}`);
  }, []);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value.split(":").map(Number);
    setTime(event.target.value);
    onSelect(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), time[0], time[1]));
  }

  const handleDateTimeChange = (date: Date | undefined) => {
    let formattedDateTime: Date | undefined;

    if (date)
      formattedDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), selected.getHours(), selected.getMinutes());
    onSelect(formattedDateTime);
  }

  return (
    <>
      <Input type="time" className="shadow-none border-none font-medium text-sm md:text-lg" value={time} onChange={handleTimeChange} />
      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleDateTimeChange}
        initialFocus={initialFocus}
      />
    </>
  )
}

export default CalendarWithTime;

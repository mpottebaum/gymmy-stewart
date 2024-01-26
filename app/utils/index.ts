import { v4 as uuid } from 'uuid';

export function getMonthDateBounds(today: Date) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  return {
    firstDate,
    lastDate,
  };
}

interface CalendarDate {
  id: string;
  date: number | null;
}

export function buildCalendarDates(
  today: Date,
): CalendarDate[] {
  const { firstDate, lastDate } = getMonthDateBounds(today);
  const days = [...new Array(lastDate.getDate())].map(
    (_, i) => ({
      date: i + 1,
      id: uuid(),
    }),
  );
  const firstDay = firstDate.getDay();
  const daysPad = [...new Array(firstDay)].map(() => ({
    id: uuid(),
    date: null,
  }));
  return [...daysPad, ...days];
}

export function buildUTCDate(
  year: number,
  month: number,
  date: number,
) {
  return new Date(year, month, date).toUTCString();
}

export function isDateValid(utcDate?: string) {
  if (!utcDate) return false;
  const date = new Date(utcDate);
  return date.toString() !== 'Invalid Date';
}

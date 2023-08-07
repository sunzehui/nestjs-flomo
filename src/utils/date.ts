import { differenceInCalendarDays, differenceInDays, differenceInMilliseconds, formatDuration, parse, parseISO } from "date-fns";

export function daysPassedSince(endTime: Date) {
  const timeDifferenceInDays = differenceInCalendarDays(new Date(), endTime); // 计算时间差

  return timeDifferenceInDays;
}

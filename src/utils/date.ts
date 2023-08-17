import {
  differenceInCalendarDays,
  differenceInDays,
  differenceInMilliseconds,
  formatDuration,
  parse,
  parseISO,
} from 'date-fns';

export function daysPassedSince(endTime: Date) {
  // 计算时间差

  return differenceInCalendarDays(new Date(), endTime);
}

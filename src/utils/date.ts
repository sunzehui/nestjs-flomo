import {
  differenceInCalendarDays,
  format,
  parseISO,
} from 'date-fns';

export function daysPassedSince(endTime: Date) {
  // 计算时间差

  return differenceInCalendarDays(new Date(), endTime);
}
export function formatDate(date:string){
  return format(parseISO(date), "yyyy-MM-dd")
}
export function formatTime(date:string){
 return format(parseISO(date),'yyyy-MM-dd HH:mm:ss') 
}

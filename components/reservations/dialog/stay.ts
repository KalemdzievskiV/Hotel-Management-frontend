import { addDays, addHours, differenceInMinutes, format } from 'date-fns';
import { parseStayDate } from '@/components/calendar/calendarUtils';
import { BookingType } from '@/types';

/**
 * How the stay is picked when creating a reservation: a check-in day, an optional time and,
 * once a time is set, a length. Without a time it's a classic overnight stay picked by dates.
 */
export type StayLength = 'short' | 'overnight' | '24h';

export interface StayChoice {
  /** yyyy-MM-dd */
  day: string;
  /** HH:mm, empty when no time was picked */
  time: string;
  /** Only used once a time is picked */
  length: StayLength | null;
  /** Short stay length in hours */
  hours: number;
  /** yyyy-MM-dd, for overnight stays */
  checkOutDay: string;
}

export const DEFAULT_SHORT_STAY_HOURS = 4;
export const SHORT_STAY_PRESETS = [3, 4, 5];
export const MIN_SHORT_STAY_HOURS = 1;
export const MAX_SHORT_STAY_HOURS = 23;

const DAY = 'yyyy-MM-dd';
const DAY_TIME = "yyyy-MM-dd'T'HH:mm";

export const nextDay = (day: string) => format(addDays(parseStayDate(day), 1), DAY);

export const emptyStay = (day = ''): StayChoice => ({
  day,
  time: '',
  length: null,
  hours: DEFAULT_SHORT_STAY_HOURS,
  checkOutDay: day ? nextDay(day) : '',
});

/** The booking type and the check-in/out values the API expects, from what was picked */
export function resolveStay(choice: StayChoice): { bookingType: BookingType; checkInDate: string; checkOutDate: string } {
  if (!choice.day) return { bookingType: BookingType.Daily, checkInDate: '', checkOutDate: '' };

  // Dates only: the hotel's standard check-in/out times apply
  if (!choice.time) {
    return { bookingType: BookingType.Daily, checkInDate: choice.day, checkOutDate: choice.checkOutDay };
  }

  const checkInDate = `${choice.day}T${choice.time}`;
  const checkIn = parseStayDate(checkInDate);

  switch (choice.length) {
    case 'short':
      return { bookingType: BookingType.ShortStay, checkInDate, checkOutDate: format(addHours(checkIn, choice.hours), DAY_TIME) };
    case '24h':
      return { bookingType: BookingType.Daily, checkInDate, checkOutDate: format(addHours(checkIn, 24), DAY_TIME) };
    case 'overnight':
      // Check-out by date: the guest leaves at the hotel's check-out time
      return { bookingType: BookingType.Daily, checkInDate, checkOutDate: choice.checkOutDay };
    default:
      return { bookingType: BookingType.Daily, checkInDate, checkOutDate: '' };
  }
}

/** Rebuilds the picker state from stored check-in/out values (calendar prefill) */
export function stayFromValues(checkIn: string, checkOut: string, bookingType: BookingType): StayChoice {
  const [day, time = ''] = checkIn.split('T');
  const [outDay, outTime = ''] = checkOut ? checkOut.split('T') : [''];
  const choice: StayChoice = { ...emptyStay(day), time: time === '00:00' ? '' : time.slice(0, 5) };
  if (outDay) choice.checkOutDay = outDay;
  if (!choice.time) return choice;

  const minutes = checkOut ? differenceInMinutes(parseStayDate(checkOut), parseStayDate(checkIn)) : 0;
  if (bookingType === BookingType.ShortStay) {
    choice.length = 'short';
    if (minutes > 0) choice.hours = Math.ceil(minutes / 60);
  } else if (outTime && outTime !== '00:00' && minutes === 24 * 60) {
    choice.length = '24h';
  } else if (checkOut) {
    choice.length = 'overnight';
  }
  return choice;
}

export const isStayComplete = (stay: ReturnType<typeof resolveStay>) =>
  !!stay.checkInDate && !!stay.checkOutDate && parseStayDate(stay.checkOutDate) > parseStayDate(stay.checkInDate);

/** e.g. "Fri 6 Nov, 19:00" for showing a computed check-out */
export const describeStayTime = (value: string) => format(parseStayDate(value), 'EEE d MMM, HH:mm');

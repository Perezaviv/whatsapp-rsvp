
import { RsvpStatus } from './types';

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  [RsvpStatus.PENDING]: 'ממתין לשליחה',
  [RsvpStatus.SENT]: 'נשלח',
  [RsvpStatus.DELIVERED]: 'נמסר',
  [RsvpStatus.READ]: 'נקרא',
  [RsvpStatus.CONFIRMED]: 'אישר/ה הגעה',
  [RsvpStatus.DECLINED]: 'לא יגיע/תגיע',
  [RsvpStatus.NEEDS_ATTENTION]: 'דורש יחס',
  [RsvpStatus.FAILED]: 'שליחה נכשלה',
};

export const RSVP_STATUS_COLORS: Record<RsvpStatus, string> = {
  [RsvpStatus.PENDING]: 'bg-gray-100 text-gray-800',
  [RsvpStatus.SENT]: 'bg-blue-100 text-blue-800',
  [RsvpStatus.DELIVERED]: 'bg-indigo-100 text-indigo-800',
  [RsvpStatus.READ]: 'bg-purple-100 text-purple-800',
  [RsvpStatus.CONFIRMED]: 'bg-green-100 text-green-800',
  [RsvpStatus.DECLINED]: 'bg-red-100 text-red-800',
  [RsvpStatus.NEEDS_ATTENTION]: 'bg-orange-100 text-orange-800',
  [RsvpStatus.FAILED]: 'bg-pink-200 text-pink-800',
};
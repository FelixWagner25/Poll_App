import { PostgrestError, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

/**
 * Unsubscribes supabase realtime channel.
 *
 * @param channel supabase realtime channel
 * @param client supabase channel
 */
export function unsubscribeDBChannel(channel: RealtimeChannel, client: SupabaseClient): void {
  client.removeChannel(channel);
}

/**
 * Prints postgrest error message to browser console.
 *
 * @param error error response
 */
export function printPostgrestErrorMsg(error: PostgrestError): void {
  console.error({
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}

/**
 * Calculates difference in days between two dates in ISO string format.
 *
 * @param dateString1 referece date
 * @param dateString2 comparison date
 * @returns
 */
export function calcDateDiffDays(dateString1: string, dateString2: string): number {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  const msPerDay = 24 * 60 * 60 * 1000;
  return (date2.getTime() - date1.getTime()) / msPerDay;
}

/**
 * Returns today's date in short ISO string format.
 *
 * @returns - short ISO string
 */
export function getTodaysShortISOString(): string {
  let today = new Date();
  return today.toISOString().substring(0, 10);
}

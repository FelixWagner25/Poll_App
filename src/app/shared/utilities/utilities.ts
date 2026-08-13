import { PostgrestError, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export function createDBSubscriptionChannel(
  client: SupabaseClient,
  channel: string,
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE',
  table: string,
): RealtimeChannel {
  let subscribedChannel = client
    .channel(channel)
    .on('postgres_changes', { event: event, schema: 'public', table: table }, (payload) => {
      console.log(payload);
    })
    .subscribe();
  return subscribedChannel;
}

export function unsubscribeDBChannel(channel: RealtimeChannel, client: SupabaseClient): void {
  client.removeChannel(channel);
}

export function printPostgrestErrorMsg(error: PostgrestError): void {
  console.error({
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}

export function calcDateDiffDays(dateString1: string, dateString2: string): number {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  const msPerDay = 24 * 60 * 60 * 1000;
  return (date2.getTime() - date1.getTime()) / msPerDay;
}

export function getTodaysShortISOString(): string {
  let today = new Date();
  return today.toISOString().substring(0, 10);
}

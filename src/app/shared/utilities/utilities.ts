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
      console.log('Change received!', payload);
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

export function getIndexArray(length: number): number[] {
  let indexArray = [];
  for (let i = 0; i < length; i++) {
    indexArray.push(i);
  }
  return indexArray;
}

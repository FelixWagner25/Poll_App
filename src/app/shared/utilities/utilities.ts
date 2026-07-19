import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

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

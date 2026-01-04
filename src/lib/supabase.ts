import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  confirmed: boolean;
  confirmation_token: string;
  unsubscribe_token: string;
}

export interface SentNotification {
  id: string;
  tool_id: string;
  sent_at: string;
  recipient_count: number;
}

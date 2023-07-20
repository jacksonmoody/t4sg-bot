import { createClient } from "@supabase/supabase-js";

export const token = process.env.SLACK_BOT_TOKEN;
export const signingSecret = process.env.SLACK_SIGNING_SECRET;
export const supabase = createClient(
  process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY
);
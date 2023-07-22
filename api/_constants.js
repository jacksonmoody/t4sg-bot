import { createClient } from "@supabase/supabase-js";

export const adminID = "U05B912EU75";
export const adminUsername = "jacksonmoody";
export const token = process.env.SLACK_BOT_TOKEN;
export const signingSecret = process.env.SLACK_SIGNING_SECRET;
export const classificationToken = process.env.CLASSIFICATION_TOKEN;
export const imgurToken = process.env.IMGUR_TOKEN;
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

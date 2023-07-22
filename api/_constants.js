import { createClient } from "@supabase/supabase-js";
export const snipeChannel = "C05J9K19H5Y";
export const engagementChannel = "C058Z5DHNHM"; 
export const adminIDs = ["U05B912EU75"];
export const token = process.env.SLACK_BOT_TOKEN;
export const signingSecret = process.env.SLACK_SIGNING_SECRET;
export const clientId = process.env.SLACK_CLIENT_ID;
export const clientSecret = process.env.SLACK_CLIENT_SECRET;
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

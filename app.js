const { App, subtype } = require("@slack/bolt");
require("dotenv").config();
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.message(subtype("file_share"), ({ event, logger }) => {
    console.log(event);
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("App Running");
})();

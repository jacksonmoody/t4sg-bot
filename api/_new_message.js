import {
  publishMessage,
  fetchFile,
  downloadImage,
  getClassification,
  getLatestMessage,
} from "./_utils";
import { supabase } from "./_constants";

export async function new_message(req, res) {
  let event = req.body.event;
  try {
    if (event.type == "file_shared") {
      const ts = await getLatestMessage("C05JLAH7U80");
      console.log(ts);
      await publishMessage("C05JLAH7U80", "New Snipe 📸", null, ts);
      const file = await fetchFile(event.file_id);
      const image = await downloadImage(file.file.url_private_download);
      const classification = await getClassification(image.data.link);
      if (classification?.predictions.length > 0) {
        const classificationData = classification.predictions[0];
        const confidence = Math.round(
          parseFloat(classificationData.confidence) * 100
        );
        await publishMessage(
          "C05JLAH7U80",
          "",
          [
            {
              type: "section",
              text: {
                type: "plain_text",
                text:
                  "We're " +
                  confidence +
                  "% sure that's a valid snipe! 🤖 If you don't think so, you can contest it using the button below:",
                emoji: true,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Contest Snipe 👀",
                    emoji: true,
                  },
                  value: JSON.stringify({
                    image: image.data.link,
                    author: event.user_id,
                    person: true,
                  }),
                  action_id: "contest-snipe",
                  confirm: {
                    title: {
                      type: "plain_text",
                      text: "Are you sure?",
                    },
                    text: {
                      type: "mrkdwn",
                      text: "Are you sure you want to contest this snipe? This will send the snipe to the T4SG gods for approval 👀",
                    },
                    confirm: {
                      type: "plain_text",
                      text: "Confirm",
                    },
                    deny: {
                      type: "plain_text",
                      text: "Cancel",
                    },
                  },
                },
              ],
            },
          ],
          ts
        );
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", event.user_id);
        if (error) console.log(error);
        if (users.length == 0) {
          await supabase.from("users").insert([
            {
              id: event.user_id,
              score: 1,
            },
          ]);
        } else {
          console.log("user exists");
          const score = users[0].score + 1;
          console.log(score);
          const { error } = await supabase
            .from("users")
            .update({ id: event.user_id, score: score + 1 })
            .eq("id", event.user_id);
          if (error) console.log(error);
        }
        await supabase.from("snipes").insert([
          {
            user_id: event.user_id,
            image: image.data.link,
            description: file.file.title,
          },
        ]);
      } else {
        await publishMessage(
          "C05JLAH7U80",
          "",
          [
            {
              type: "section",
              text: {
                type: "plain_text",
                text: "We don't think that's a valid snipe 😢 It won't count unless you contest it using the button below: ",
                emoji: true,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Contest Snipe 👀",
                    emoji: true,
                  },
                  value: JSON.stringify({
                    image: image.data.link,
                    author: event.user_id,
                    person: false,
                  }),
                  action_id: "contest-snipe",
                  confirm: {
                    title: {
                      type: "plain_text",
                      text: "Are you sure?",
                    },
                    text: {
                      type: "mrkdwn",
                      text: "Are you sure you want to contest this snipe? This will send the snipe to the T4SG gods for approval 👀",
                    },
                    confirm: {
                      type: "plain_text",
                      text: "Confirm",
                    },
                    deny: {
                      type: "plain_text",
                      text: "Cancel",
                    },
                  },
                },
              ],
            },
          ],
          ts
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
}

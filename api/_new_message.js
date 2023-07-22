import {
  publishMessage,
  fetchFile,
  downloadImage,
  getClassification,
  getLatestMessage,
  updateUser,
} from "./_utils";
import { supabase, snipeChannel } from "./_constants";

export async function new_message(req, res) {
  let event = req.body.event;
  try {
    if (event.type == "file_shared") {
      const ts = await getLatestMessage(snipeChannel);
      await publishMessage(snipeChannel, "Nice Snipe! 📸", null, ts);
      const file = await fetchFile(event.file_id);
      const image = await downloadImage(file.file.url_private_download);
      const classification = await getClassification(image.data.link);
      if (classification?.predictions.length > 0) {
        const classificationData = classification.predictions[0];
        const confidence = Math.round(
          parseFloat(classificationData.confidence) * 100
        );
        await publishMessage(
          snipeChannel,
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
        await updateUser(event.user_id, "add");
        await supabase.from("snipes").insert([
          {
            user_id: event.user_id,
            image: image.data.link,
            description: file.file.title,
          },
        ]);
      } else {
        await publishMessage(
          snipeChannel,
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

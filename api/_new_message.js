import {
  publishMessage,
  fetchFile,
  downloadImage,
  getClassification,
} from "./_utils";
import { supabase } from "./_constants";

export async function new_message(req, res) {
  let event = req.body.event;
  try {
    if (event.type == "file_shared") {
      await publishMessage("C05JLAH7U80", "New Snipe Posted!");
      const file = await fetchFile(event.file_id);
      const image = await downloadImage(file.file.url_private_download);
      const classification = await getClassification(image.data.link);
      if (classification?.predictions.length > 0) {
        const classificationData = classification.predictions[0];
        await publishMessage("C05JLAH7U80", "", [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "Confidence: " + classificationData.confidence,
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
                value: image.data.link,
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
        ]);
      } else {
        await publishMessage("C05JLAH7U80", "", [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "No person detected 😢",
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
                value: image.data.link,
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
        ]);
      }
      await supabase.from("snipes").insert([
        {
          user_id: event.user_id,
          image: image.data.link,
          description: file.file.title,
        },
      ]);
    }
  } catch (e) {}
}

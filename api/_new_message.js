import {
  publishMessage,
  fetchFile,
  downloadImage,
  getClassification,
  getLatestMessage,
  updateUser,
  getLeaderboard,
  getLatestSnipes,
} from "./_utils";
import { supabase, snipeChannel, token } from "./_constants";

export async function new_message(req, res) {
  let event = req.body.event;
  try {
    if (event.type == "file_shared") {
      const { mention, ts } = await getLatestMessage(snipeChannel);
      if (mention) {
        await publishMessage(
          snipeChannel,
          "Nice Snipe of <@" + mention + ">! 📸",
          null,
          ts
        );
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
                      sniped: mention,
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
              sniped_id: mention,
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
                      sniped: mention,
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
      } else {
        await publishMessage(
          snipeChannel,
          "No tag detected 😢 Please @ the person you are sniping and send the message again :)",
          null,
          ts
        );
      }
    } else if (event.type === "app_home_opened") {
      const user = event.user;
      const blocks = await getLeaderboard();
      const snipeBlocks = await getLatestSnipes();
      blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: "Latest Snipes 📸",
          emoji: true,
        },
      });
      blocks.push({
        type: "divider",
      });
      snipeBlocks.forEach((block) => {
        blocks.push(block);
      });
      const message = {
        user_id: user,
        view: {
          type: "home",
          blocks: blocks,
        },
      };
      try {
        const url = "https://slack.com/api/views.publish";
        const result = await fetch(url, {
          method: "post",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(message),
        });
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

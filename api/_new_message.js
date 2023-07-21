import { token } from "./_constants";
import { classificationToken } from "./_constants";
import { imgurToken } from "./_constants";
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
        await publishMessage(
          "C05JLAH7U80",
          "Class: " +
            classificationData.class +
            ". Confidence: " +
            classificationData.confidence,
          [
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
                  value: "contest_snipe",
                  action_id: "actionId-0",
                },
              ],
            },
          ]
        );
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

async function publishMessage(id, payload, blocks = null) {
  const message = {
    channel: id,
    text: payload,
    blocks: blocks,
  };
  try {
    const url = "https://slack.com/api/chat.postMessage";
    await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    });
  } catch (err) {}
}

async function fetchFile(id) {
  const url = "https://slack.com/api/files.info?file=" + id;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
}

async function downloadImage(url) {
  try {
    const slackResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const slackBlob = await slackResponse.blob();
    const formdata = new FormData();
    formdata.append("image", slackBlob);
    const results = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: imgurToken,
      },
      body: formdata,
    });
    const imgurData = await results.json();
    return imgurData;
  } catch (err) {}
}

async function getClassification(url) {
  const baseURL = "https://detect.roboflow.com/people-detection-general/7";
  const fullURL = baseURL + "?api_key=" + classificationToken + "&image=" + url;
  const response = await fetch(fullURL, {
    method: "POST",
  });
  const data = await response.json();
  return data;
}

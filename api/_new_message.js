import { token } from "./_constants";
import { classificationToken } from "./_constants";
import { imgurToken } from "./_constants";
import { supabase } from "./_constants";

export async function new_message(req, res) {
  let event = req.body.event;
  try {
    if (event.type == "file_shared") {
      await publishMessage("C05JLAH7U80", "New Snipe Posted!", res);
      const file = await fetchFile(event.file_id);
      const image = await downloadImage(file.file.url_private_download, res);
      const classification = await getClassification(image.data.link);
      await publishMessage("C05JLAH7U80", classification, res);
      const { error } = await supabase.from("snipes").insert([
        {
          user_id: event.user_id,
          image: image.data.link,
          description: file.file.title,
        },
      ]);
      if (error) {
        console.log(error);
        res.send({
          text: `${error}`,
        });
      } else {
        res.json({ ok: true });
      }
    } else {
      res.send({
        text: "Unsupported event type",
      });
    }
  } catch (e) {
    res.send({
      text: `${e}`,
    });
  }
}

async function publishMessage(id, payload, res) {
  const message = {
    channel: id,
    text: payload,
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
  } catch (err) {
    res.send({
      text: `${err}`,
    });
  }
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

async function downloadImage(url, res) {
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
  } catch (err) {
    console.log(err);
    res.send({
      text: `${err}`,
    });
  }
}

async function getClassification(url) {
  const baseURL = "https://api.imagga.com/v2/tags";
  const response = await fetch(baseURL + "?image_url=" + url, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Basic ${classificationToken}`,
    },
  });
  return response;
}

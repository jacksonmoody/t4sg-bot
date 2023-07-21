import { token } from "./_constants";
import { classificationToken } from "./_constants";
import { supabase } from "./_constants";
import { blobToBase64 } from "./_validate";
const FormData = require("form-data");

export async function new_message(req, res) {
  let event = req.body.event;
  try {
    if (event.type == "file_shared") {
      await publishMessage("C05JLAH7U80", "New Snipe Posted!", res);
      const file = await fetchFile(event.file_id);
      const fileID = await downloadImage(file.file.url_private_download, res);
      await publishMessage("C05JLAH7U80", fileID, res);
      const { error } = await supabase.from("snipes").insert([
        {
          user_id: event.user_id,
          image: fileID,
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
    const response = await fetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const imageBlob = await response.blob();
    blobToBase64(imageBlob).then((result) => {
      const formData = new FormData();
      formData.append("image_base64", result);
      publishMessage("C05JLAH7U80", "File Downloaded", res);
      fetch("https://api.imagga.com/v2/uploads", {
        method: "post",
        headers: {
          Authorization: `Basic ${classificationToken}`,
        },
        body: formData,
      })
        .then((response) => {
          console.log(response);
          response.json().then((data) => {
            const upload_id = data.result.upload_id;
            publishMessage("C05JLAH7U80", upload_id, res);
            return upload_id;
          });
        })
        .catch((err) => {
          console.log(err);
          res.send({
            text: `${err}`,
          });
        });
    });
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

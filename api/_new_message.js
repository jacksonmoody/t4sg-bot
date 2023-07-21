import { token } from "./_constants";
import { classificationToken } from "./_constants";
import { supabase } from "./_constants";
const fs = require("fs");

export async function new_message(req, res) {
  let event = req.body.event;
  try {
    if (event.type == "file_shared") {
      await publishMessage("C05JLAH7U80", "New Snipe Posted!", res);
      const file = await fetchFile(event.file_id);
      const fileID = await downloadImage(file.file.url_private, file.file.id, res);
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

async function downloadImage(url, filename, res) {
  let writeStream = fs.createWriteStream(`/tmp/${filename}.png`);
  try {
    const response = await fetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    response.body.pipe(writeStream);
    writeStream.on("finish", () => {
      const fileContent = fs.readFileSync(`/tmp/${filename}.png`);
      const params = {
        image: fileContent,
      };
      publishMessage("C05JLAH7U80", "File Downloaded", res);
      fetch("https://api.imagga.com/v2/uploads", {
        method: "post",
        headers: {
          Authorization: `Basic ${classificationToken}`,
        },
        body: params,
      })
        .then((response) => {
          response.json().then((data) => {
            const upload_id = data.result.upload_id;
            publishMessage("C05JLAH7U80", upload_id, res);
            return upload_id;
          });
        })
        .catch((err) => {
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

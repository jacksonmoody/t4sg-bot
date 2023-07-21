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
      await downloadImage(file.file.url_private_download, file.file.id);
      const { error } = await supabase.from("snipes").insert([
        {
          user_id: event.user_id,
          image: file.file.url_private_download,
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
      text: `${err}`,
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
    const response = await fetch(url, {
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

async function downloadImage(url, filename) {
  let writeStream = fs.createWriteStream(`/tmp/${filename}.pdf`);
  const response = await fetch(url, {
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  response.pipe(writeStream);
  writeStream.on("finish", () => {
    writeStream.close();
    const fileContent = fs.readFileSync(`/tmp/${filename}.pdf`);
    const params = {
      image: fileContent,
    };
    fetch("https://api.imagga.com/v2/uploads", {
      method: "post",
      headers: {
        Authorization: `Basic ${classificationToken}`,
      },
      body: params,
    }).then((response) => {
      console.log(response);
    });
  });
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

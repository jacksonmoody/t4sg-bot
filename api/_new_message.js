import { token } from "./_constants";
export async function new_message(req, res) {
  let event = req.body.event;
  try {
    if (event.type == "file_shared") {
      await publishMessage("C05JLAH7U80", "New Snipe Posted!", res);
      const file = await fetchFile(event.file_id);
      await publishMessage("C05JLAH7U80", file.file.url_private, res);
      res.json({ ok: true });
    } else {
      res.send({
        text: "Unsupported event type",
      })
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
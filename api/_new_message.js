import { token } from './_constants'
export async function new_message(req, res) {
  let event = req.body.event;
  console.log(event);
  try {
    await publishMessage("C05JLAH7U80", "Hello, World");
  } catch (e) {
    console.log(e);
  }
}

async function publishMessage(id, payload) {
  const message = {
    channel: id,
    text: payload,
  }
  try {
    const url = 'https://slack.com/api/chat.postMessage'
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    })
    const data = await response.json()
    res.json({ ok: true })
  } catch (err) {
    res.send({
      response_type: 'ephemeral',
      text: `${err}`,
    })
  }
}
import { token } from "./_constants";
import { classificationToken } from "./_constants";
import { imgurToken } from "./_constants";

export async function publishMessage(id, payload, blocks = null) {
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

export async function fetchFile(id) {
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

export async function downloadImage(url) {
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

export async function getClassification(url) {
  const baseURL = "https://detect.roboflow.com/people-detection-general/7";
  const fullURL = baseURL + "?api_key=" + classificationToken + "&image=" + url;
  const response = await fetch(fullURL, {
    method: "POST",
  });
  const data = await response.json();
  return data;
}

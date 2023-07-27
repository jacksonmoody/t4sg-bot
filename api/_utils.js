import { token } from "./_constants";
import { classificationToken } from "./_constants";
import { imgurToken } from "./_constants";
import { supabase } from "./_constants";

export async function publishMessage(
  id,
  payload,
  blocks = null,
  thread = null
) {
  const message = {
    channel: id,
    text: payload,
    blocks: blocks,
    thread_ts: thread,
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
    console.log(err);
  }
}

export async function getLatestMessage(id) {
  const url = "https://slack.com/api/conversations.history?channel=" + id;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  let mention = null;
  if (data.messages[0].text.includes("<@")) {
    mention = data.messages[0].text.split("<@")[1].split(">")[0];
  }
  const toReturn = {
    mention: mention,
    ts: data.messages[0].ts,
  };
  return toReturn;
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

export async function updateUser(id, change) {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id);
  if (error) return false;
  if (users.length == 0 && change == "subtract") {
    return false;
  }
  if (change == "add") {
    if (users.length == 0) {
      await supabase.from("users").insert([
        {
          id: id,
          score: 1,
        },
      ]);
      return true;
    } else {
      const score = users[0].score + 1;
      const { error } = await supabase
        .from("users")
        .update({ score: score })
        .eq("id", id);
      if (error) return false;
      return true;
    }
  } else if (change == "subtract") {
    let score = users[0].score;
    if (score > 0) {
      score = score - 1;
    } else {
      score = 0;
    }
    const { error } = await supabase
      .from("users")
      .update({ score: score })
      .eq("id", id);
    if (error) return false;
    return true;
  }
}

export async function getLeaderboard() {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("score", { ascending: false });
  if (error) console.log(error);

  let blocks = [];
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: "Sniping Leaderboard 🎉",
      emoji: true,
    },
  });
  blocks.push({
    type: "divider",
  });
  users.forEach((user, index) => {
    let point = "";
    if (user.score == 1) {
      point = " point";
    } else {
      point = " points";
    }
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*" + (index + 1) + ".* <@" + user.id + "> - " + user.score + point,
      },
    });
  });
  return blocks;
}

export async function getLatestSnipes() {
  let blocks = [];
  const { data: snipes, error } = await supabase
    .from("snipes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) console.log(error);
  snipes.forEach((snipe) => {
    let sniped_id = "";
    if (snipe.sniped_id != null) {
      sniped_id = "<@" + snipe.sniped_id + ">";
    }
    blocks.push({
      type: "image",
      image_url: snipe.image,
      alt_text: snipe.description,
    });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "<@" + snipe.user_id + ">" + " sniped " + sniped_id,
      },
    });
    blocks.push({
      type: "divider",
    });
  });
  return blocks;
}

export async function getWorkspaceUsers() {
  const url = "https://slack.com/api/users.list";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  const members = data.members;
  const ids = [];
  members.forEach((member) => {
    if (!member.is_bot && !member.deleted) {
      ids.push(member.id);
    }
  });
  return ids;
}

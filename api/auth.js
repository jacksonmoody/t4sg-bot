import { clientID, clientSecret } from "./_constants";
export default async function auth(req, res) {
  const code = req.query.code;
  const url = "https://slack.com/api/oauth.v2.access";
  const response = await fetch(url + "?client_id=" + clientID + "&client_secret=" + clientSecret + "&code=" + code, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  const data = await response.json();
  const token = data.access_token;
  res.status(200).send("Success! You can close this window now.");
}

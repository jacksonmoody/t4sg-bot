import { clientID, clientSecret } from "./_constants";
export default async function auth(req, res) {
  const code = req.query.code;
  const url = "https://slack.com/api/oauth.v2.access";
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      client_id: clientID,
      client_secret: clientSecret,
      code: code,
    }),
  });
    const data = await response.json();
    const token = data.access_token;
    console.log(token);
    res.status(200).send("Success! You can close this window now.");
}

import { clientID, clientSecret } from "./_constants";
export default async function auth(req, res) {
  const code = req.query.code;
  const url = "https://slack.com/api/oauth.v2.access";
  let headers = new Headers();
  headers.set('Authorization', 'Basic ' + Buffer.from(clientID + ":" + clientSecret).toString('base64'));
  const response = await fetch(url + "?code=" + code, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  console.log(response);
  const data = await response.json();
  const token = data.access_token;
  console.log(token);
  res.status(200).send("Success! You can close this window now.");
}

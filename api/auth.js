import { clientID } from "./_constants";
export default async function auth(req, res) {
  const code = req.query.code;
  const url = "https://slack.com/api/oauth.v2.access";
  let headers = new Headers();
  headers.set('Authorization', 'Basic ' + clientID);
  const response = await fetch(url + "?code=" + code, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  const data = await response.json();
  console.log(data);
  const token = data.access_token;
  console.log(token);
  res.status(200).send("Success! You can close this window now.");
}

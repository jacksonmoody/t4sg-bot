import { challenge } from "./_challenge";
import { validate } from "./_validate";
import { signingSecret } from "./_constants";

export default async function interactions(req, res) {
  if (!req.body) {
    res.status(400).send({ error: "Invalid request" });
    return;
  }
  const type = req.body.type;

  if (type === "url_verification") {
    await challenge(req, res);
  } else if (validate(req, signingSecret)) {
    const data = await req.body.payload.json();
    console.log(data);
    res.status(200).send({});
  } else {
    res.status(400).send({ error: "Invalid request" });
  }
}

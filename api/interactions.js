import { challenge } from "./_challenge";
import { validate } from "./_validate";
import { signingSecret } from "./_constants";

export default async function interactions(req, res) {
  if (!req.body) {
    res.status(400).send({ error: "Invalid request" });
    return;
  }
  try {
    const data = await req.body.payload.json();
    console.log(data);
    res.status(200).send({});
  } catch (err) {
    res.status(400).send({ error: "Invalid request" });
  }
}

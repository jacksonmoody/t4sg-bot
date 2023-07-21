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
    try {
      console.log(req.body.payload);
      const payload = JSON.parse(req.body.payload);
      const type = payload.type;
      if (type === "block_actions") {
        res.status(200).send({ok: true});
      } else {
        res.status(400).send({ error: "Invalid event type" });
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Invalid request" });
    }
  } else {
    res.status(400).send({ error: "Invalid request" });
  }
}

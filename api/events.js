import { challenge } from "./_challenge";
import { new_message } from "./_new_message";
import { validate } from "./_validate";
import { signingSecret } from "./_constants";

export default async function events(req, res) {
  if (!req.body) {
    res.status(400).send({ error: "Invalid request" });
    return;
  }
  const type = req.body.type;

  if (type === "url_verification") {
    await challenge(req, res);
  } else if (validate(req, signingSecret)) {
    if (type === "event_callback") {
      await new_message(req, res);
    } else {
      res.status(400).send({ error: "Invalid request" });
    }
  }
}

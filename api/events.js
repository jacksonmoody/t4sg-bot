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
      if (req.headers["x-slack-retry-num"] > 0) {
        res.status(200).send({});
        return;
      }
      await new_message(req, res);
      res.status(200).send({});
    } else {
      res.status(400).send({ error: "Invalid event type" });
    }
  } else {
    res.status(400).send({ error: "Invalid request" });
  }
}

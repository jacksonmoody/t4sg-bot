import { challenge } from "./_challenge";
import { new_message } from "./_new_message";
import { validate } from "./_validate";
import { signingSecret } from "./_constants";

export default async function events(req, res) {
  const type = req.body.type;

  if (type === "url_verification") {
    await challenge(req, res);
  } else if (validate(req, signingSecret)) {
    if (type === "event_callback") {
      const event_type = req.body.event.type;
      switch (event_type) {
        case "message":
          await new_message(req, res);
          break;
        default:
          break;
      }
    }
  }
}

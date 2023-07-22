import { publishMessage } from "./_utils";
import { adminID, adminUsername } from "./_constants";

export default async function interactions(req, res) {
  try {
    const payload = JSON.parse(req.body.payload);
    const type = payload.type;
    if (type === "block_actions") {
      const user = payload.user.username;
      const value = payload.message.blocks[1].elements[0].value;
      console.log(value);
      await publishMessage(
        adminID,
        "Hey, @" +
          adminUsername +
          "! " +
          user +
          " wants to contest this snipe: " +
          value
      );
      res.status(200).send({ ok: true });
    } else {
      res.status(400).send({ error: "Invalid event type" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Invalid request" });
  }
}

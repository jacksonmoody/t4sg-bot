import { publishMessage } from "./_utils";
import { engagementChannel } from "./_constants";

export default async function interactions(req, res) {
  try {
    const payload = JSON.parse(req.body.payload);
    const type = payload.type;
    if (type === "block_actions") {
      const user = payload.user.id;
      const value = payload.message.blocks[1].elements[0].value;
      const image = JSON.parse(value).image;
      const author = JSON.parse(value).author;
      const sniped = JSON.parse(value).sniped;
      const person = JSON.parse(value).person;
      await publishMessage(
        engagementChannel,
        "Hey, <!channel>! <@" +
          user +
          "> wants to contest <@" +
          author +
          ">'s snipe of <@" +
          sniped +
          ">: " +
          image
      );
      if (person) {
        await publishMessage(
          engagementChannel,
          "Type `/deny " + author + "` if you want to invalidate this snipe."
        );
      } else {
        await publishMessage(
          engagementChannel,
          "Type `/approve " + author + "` if you want to validate this snipe."
        );
      }
      res.status(200).send({ ok: true });
    } else {
      res.status(400).send({ error: "Invalid event type" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Invalid request" });
  }
}

import { publishMessage } from "./_utils";

export default async function interactions(req, res) {
  try {
    const payload = JSON.parse(req.body.payload);
    const type = payload.type;
    if (type === "block_actions") {
      const user = payload.user.id;
      const value = payload.message.blocks[1].elements[0].value;
      const image = JSON.parse(value).image;
      const author = JSON.parse(value).author;
      await publishMessage(
        //C058Z5DHNHM
        "C05JLAH7U80",
        "Hey, <!channel>! <@" +
          user +
          "> wants to contest <@" +
          author +
          ">'s snipe: " +
          image
      );
      await publishMessage(
        "C05JLAH7U80",
        "Type `/approve " +
          author +
          "` to approve the snipe or `/deny " +
          author +
          "` to deny it."
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

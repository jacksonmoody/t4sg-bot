export default async function interactions(req, res) {
  try {
    console.log(req.body.payload);
    const payload = JSON.parse(req.body.payload);
    const type = payload.type;
    if (type === "block_actions") {
      res.status(200).send({ ok: true });
    } else {
      res.status(400).send({ error: "Invalid event type" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Invalid request" });
  }
}

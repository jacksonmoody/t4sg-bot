export default async function interactions(req, res) {
  try {
    const data = await req.body.payload.json();
    console.log(data);
    res.status(200).send({});
    return;
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Invalid request" });
    return;
  }
}

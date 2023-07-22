import { updateUser } from "./_utils";
import { adminIDs } from "./_constants";

export default async function interactions(req, res) {
  try {
    const data = req.body;
    console.log(data);
    //const payload = JSON.parse(req.body.payload);
    const command = data.command;
    const user = data.text;
    const admin = data.user_id;
    switch (command) {
      case "/approve":
        if (adminIDs.includes(admin)) {
          await updateUser(user, "add");
          res.status(200).send("Approval successful!");
        } else {
          res.status(200).send("Sorry, you don't have permission to send that command. Slack <@" + adminIDs[0] + "> if you want access!");
        }
        break;
      case "/deny":
        if (adminIDs.includes(admin)) {
          await updateUser(user, "subtract");
          res.status(200).send("Denial successful!");
        } else {
          res.status(200).send("Sorry, you don't have permission to send that command. Slack <@" + adminIDs[0] + "> if you want access!");
        }
        break;
      case "/leaderboard":
        break;
      default:
        res.status(400).send({ error: "Invalid command" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Invalid request" });
  }
}

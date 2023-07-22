import { updateUser } from "./_utils";
import { adminIDs, supabase } from "./_constants";

export default async function interactions(req, res) {
  try {
    const data = req.body;
    const command = data.command;
    const user = data.text;
    const admin = data.user_id;
    switch (command) {
      case "/approve":
        if (adminIDs.includes(admin)) {
          await updateUser(user, "add");
          res.status(200).send("Approval successful!");
        } else {
          res
            .status(200)
            .send(
              "Sorry, you don't have permission to send that command. Slack <@" +
                adminIDs[0] +
                "> if you want access!"
            );
        }
        break;
      case "/deny":
        if (adminIDs.includes(admin)) {
          await updateUser(user, "subtract");
          res.status(200).send("Denial successful!");
        } else {
          res
            .status(200)
            .send(
              "Sorry, you don't have permission to send that command. Slack <@" +
                adminIDs[0] +
                "> if you want access!"
            );
        }
        break;
      case "/leaderboard":
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .order("score", { ascending: false });
        if (error) console.log(error);

        let blocks = [];
        blocks.push({
          type: "header",
          text: {
            type: "plain_text",
            text: "T4SG Sniping Leaderboard 🎉",
            emoji: true,
          },
        });
        blocks.push({
          type: "divider"
        });
        users.forEach((user, index) => {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*" + (index + 1) + ".* <@" + user.id + "> - " + user.score + " points",
            },
          });
        });

        res.status(200).send({
          blocks: blocks,
        });
        
        break;
      default:
        res.status(400).send({ error: "Invalid command" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Invalid request" });
  }
}

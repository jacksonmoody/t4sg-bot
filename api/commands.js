import { updateUser, getLeaderboard, getWorkspaceUsers } from "./_utils";
import { adminIDs } from "./_constants";

export default async function interactions(req, res) {
  try {
    const data = req.body;
    const command = data.command;
    const user = data.text;
    const admin = data.user_id;
    const workspaceUsers = await getWorkspaceUsers();
    switch (command) {
      case "/approve":
        if (adminIDs.includes(admin)) {
          if (workspaceUsers.includes(user)) {
            await updateUser(user, "add");
            res.status(200).send({
              response_type: "in_channel",
              text: "<@" + admin + "> has approved <@" + user + ">'s snipe!",
            });
          } else {
            res
              .status(200)
              .send(
                "Sorry, that snipe code is invalid. Please try again using the code provided above."
              );
          }
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
          if (workspaceUsers.includes(user)) {
            await updateUser(user, "subtract");
            res.status(200).send({
              response_type: "in_channel",
              text: "<@" + admin + "> has denied <@" + user + ">'s snipe",
            });
          } else {
            res
              .status(200)
              .send(
                "Sorry, that snipe code is invalid. Please try again using the code provided above."
              );
          }
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
        const blocks = await getLeaderboard();
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

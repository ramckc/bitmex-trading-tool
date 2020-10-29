require("dotenv").config({ path: ".env" });
const app = require("./app");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const realtimeManager = require("./utils/realtimeManager");

// Start our app!
io.on("connection", (client) => {
  console.log("Client connected");

  client.on("REGISTER", (userInfo) => {
    if (!userInfo) return;
    const uid = JSON.parse(userInfo).uid;
    console.log("Client registered", uid);
    const user = {
      uid,
      client,
    };
    realtimeManager.register(user);
  });

  client.on("disconnect", () => {
    console.log("Client disconnected");
    realtimeManager.removeDisconnectedClients();
  });
});

server.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

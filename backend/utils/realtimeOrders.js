const BitMEXClient = require("bitmex-realtime-api");
const bitmex = require("./bitmex");

const apiKey = "3E-EmQwG14pT7pPXPiJsJOJk";
const apiSecret = "E-71jR4dIKZzKIzevp1q3T3ga-krelGaPDRMpWpuWgkZMFCV";
const clOrdID = "";

//async function Connect(clOrdID) {

const io = require("socket.io");

const client = new BitMEXClient({
  testnet: process.env.TESTNET === "true",
  apiKeyID: apiKey,
  apiKeySecret: apiSecret,
});

client.on("error", console.error);
client.on("open", () => console.log("Connection opened."));
client.on("close", () => console.log("Connection closed."));
client.on("initialize", () =>
  console.log("Client initialized, data is flowing.")
);

client.addStream("XBTUSD", "order", async function (data) {
  let activeOrders = data;
  const length = data.length;

  for (let x = 0; x < length; x++) {
    if (activeOrders[x].clOrdID === clOrdID) {
      const best = await bitmex.getBestTrades();
      const side = activeOrders[x].side;

      if (activeOrders[x].ordStatus === "New") {
        // Empezar a revisar los cambios en el precio
      } else if (activeOrders[x].ordStatus === "Filled") {
        // Cerrar ciclo.
      }
    }
  }
});

//}

//module.exports = {Connect}

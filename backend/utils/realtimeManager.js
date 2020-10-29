const BitmexClient = require("bitmex-realtime-api");
const firebase = require("./firebase");
const symbol = "XBTUSD";

const client = new BitmexClient({ testnet: process.env.TESTNET === "true" });
let rtClients = [];

module.exports = (function () {
  function removeDisconnectedClients() {
    rtClients = rtClients.filter(
      (rtClient) =>
        !rtClient.client.disconnected || rtClient.trackedOrders.length > 0
    );
  }

  function register(rtClient) {
    //console.log("LOGIN", rtClient);
    // check if user already exist and only update client
    let clientExists = false;
    //console.log("rtClients", rtClients);
    rtClients = rtClients.map((client) => {
      if (client.uid === rtClient.uid) {
        clientExists = true;
        client.client = rtClient.client;
      }
      return client;
    });

    if (!clientExists) {
      rtClient.trackedOrders = [];
      rtClients.push(rtClient);
    }
    registerPrivateStreams(rtClient);
    removeDisconnectedClients();
  }

  function trackOrder(uid, order) {
    rtClients = rtClients.map((rtClient) => {
      if (rtClient.uid === uid) {
        rtClient.trackedOrders.push(order);
      }

      return rtClient;
    });
  }

  function removeOrder(uid, orderId) {
    rtClients = rtClients.map((rtClient) => {
      if (rtClient.uid === uid) {
        rtClient.trackedOrders = rtClient.trackedOrders.filter(
          (order) => order.clOrdID !== orderId
        );
      }

      return rtClient;
    });
  }

  async function registerPrivateStreams(rtClient) {
    const { uid, client } = rtClient;

    const privateUser = await firebase.getUserKey(uid);
    if (privateUser && privateUser.api && privateUser.secret) {
      const privateClient = new BitmexClient({
        testnet: process.env.TESTNET === "true",
        apiKeyID: privateUser.api,
        apiKeySecret: privateUser.secret,
      });

      privateClient.addStream(symbol, "margin", function (data) {
        client.emit("MARGIN", JSON.stringify(data));
      });

      privateClient.addStream(symbol, "position", function (data) {
        const position = data[data.length - 1];
        client.emit("POSITION", JSON.stringify(position));
      });

      privateClient.addStream(symbol, "order", function (data) {
        const { trackedOrders } = rtClients.find(
          (rtClient) => rtClient.uid === uid
        );
        checkOrderStatus(uid, trackedOrders, data);
        client.emit("ORDER", JSON.stringify(data));
      });
    }
  }

  function checkOrderStatus(uid, ordersToTrack, orders) {
    return orders.map((order) => {
      const { clOrdID, ordStatus, side, price } = order;
      const trackedOrder = ordersToTrack.find(
        (trackedOrder) => trackedOrder.clOrdID === clOrdID
      );
      if (trackedOrder) {
        const { variancePercent } = trackedOrder;
        const variance = price * variancePercent;
        const limitPriceAllowed =
          side === "Buy" ? price + variance : price - variance;

        if (ordStatus === "Filled") {
          // Filled
          // remove order from tracked orders and update firebase
          removeOrder(uid, clOrdID);
        } else if (ordStatus === "Canceled") {
          //Si la orden se cancela por ser PostOnly, hay que re-hacerla con nuevo precio
          removeOrder(uid, clOrdID);
        }

        // not filled
        // 1. getBestTrades from Realtime
        let priceCompare;
        const bestPrices = {
          buy: 0,
          sell: 0,
        }; //await exports.getBestTrades();
        if (side === "Buy") priceCompare = bestPrices.buy;
        else priceCompare = bestPrices.sell;

        // 2. compare current order price with best price
        if (price !== priceCompare) {
          if (
            (side === "Buy" && priceCompare <= limitPriceAllowed) ||
            (side === "Sell" && priceCompare >= limitPriceAllowed)
          ) {
            // 3. update order with price if needed
            //exports.changeOrderPrice(clOrdID, priceCompare, userID);
          }
        }
      }
    });
  }

  client.addStream(symbol, "trade", function (data) {
    const trade = data[data.length - 1];
    rtClients.map((rtClient) => {
      rtClient.client.emit("CANDLE", JSON.stringify(trade));
    });
  });

  return {
    register,
    removeDisconnectedClients,
    trackOrder,
  };
})();

"use strict";

const axios = require("axios");
const crypto = require("crypto");
const firebase = require("./firebase");
const realtimeManager = require("./realtimeManager");

const symbol = process.env.SYMBOL;
const bitmexApi = process.env.BITMEX_API;

async function getHeaders(method, userID, path, data = null) {
  path = `/api/v1${path}`;
  const expires = Math.round(new Date().getTime() / 1000) + 1000;
  const postBody = data ? JSON.stringify(data) : "";

  const userData = await firebase.getUserKey(userID);

  const apiKey = userData.api;
  const apiSecret = userData.secret;
  console.log(apiKey, apiSecret);

  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(method + path + expires.toString() + postBody)
    .digest("hex");

  return {
    "content-type": "application/json",
    Accept: "application/json",
    "X-Request-With": "XMLHTTPRequest",
    "api-expires": expires,
    "api-key": apiKey,
    "api-signature": signature,
  };
}

exports.changeLevType = async (levInfo) => {
  const userID = levInfo.userID;
  const pathLevType = "/position/isolate";
  const method = "POST";

  const dataType = { symbol, enabled: true };
  const headersType = await getHeaders(method, userID, pathLevType, dataType);
  const typeUrl = `${bitmexApi}${pathLevType}`;

  const levTypeResponse = await axios.post(typeUrl, dataType, {
    headers: headersType,
  });

  if (levTypeResponse.status === 200) {
    const newLevInfo = {
      ...levInfo,
      isIsolated: true,
    };
    exports.changeLeverage(newLevInfo);
  } else return { status: "failure", message: levTypeResponse.error };
};

exports.cancelOrder = async (orderToCancel) => {
  //side, orderQty, variance, price)
  const path = "/order";
  const cancelOrderURL = `${bitmexApi}${path}`;
  const method = "DELETE";
  const { orderID, userID } = orderToCancel;

  const data = { orderID };

  try {
    const headers = await getHeaders(method, userID, path, data);
    const orderResponse = await axios.delete(cancelOrderURL, { headers, data });
    return { status: "success" };
  } catch (error) {
    return { status: "failure", message: error.message };
  }
};

exports.changeLeverage = async (levInfo) => {
  const userID = levInfo.userID;
  let leverage = levInfo.newLeverage;
  const isIsolated = levInfo.isIsolated;
  const pathLevChange = "/position/leverage";
  const method = "POST";

  if (isIsolated === false) exports.changeLevType(levInfo);
  else {
    leverage = parseInt(leverage);
    const data = { symbol, leverage };
    const headers = await getHeaders(method, userID, pathLevChange, data);
    const typeUrl = `${bitmexApi}${pathLevChange}`;

    const levChangeResponse = await axios.post(typeUrl, data, { headers });

    if (levChangeResponse.status === 200) {
      return { status: "success" };
    } else {
      return { status: "failure" };
    }
  }

  if (isIsolated === false) exports.changeLevType(levInfo);
  else {
    leverage = parseInt(leverage);
    const data = { symbol, leverage };
    const headers = await getHeaders(method, userID, pathLevChange, data);
    const typeUrl = `${bitmexApi}${pathLevChange}`;

    const levChangeResponse = await axios.post(typeUrl, data, { headers });

    if (levChangeResponse.status === 200) {
      return { status: "success" };
    } else {
      return { status: "failure" };
    }
  }
};

exports.bulkOrders = async (orders) => {
  const method = "POST";
  const path = "/order/bulk";
  const orderUrl = `${bitmexApi}${path}`;

  const order = {
    tag: orders.order.tag,
    type: orders.order.type,
    exec: orders.order.exec,
    side: orders.order.side,
    orderQty: parseFloat(orders.order.orderQty).toFixed(2),
    price: parseFloat(orders.order.price).toFixed(2),
    variancePercent: parseFloat(orders.order.variancePercent).toFixed(2),
    marketPercent: parseFloat(orders.order.marketPercent).toFixed(2),
    triggerPrice: parseFloat(orders.order.triggerPrice).toFixed(2),
    reduced: orders.order.reduced,
    userID: orders.userID,
  };

  const userID = order.userID;

  let newOrder;
  let newSL;
  let newTP;

  if (
    order.triggerPrice !== undefined &&
    order.triggerPrice > 0 &&
    order.triggerPrice !== ""
  ) {
    newOrder = await exports.prepareWithTrigger(order);
  } else newOrder = await exports.prepareOrder(order);

  const slOrder = {
    tag: orders.slOrder.tag,
    type: orders.slOrder.type,
    exec: orders.slOrder.exec,
    side: orders.slOrder.side,
    orderQty: parseFloat(orders.slOrder.orderQty).toFixed(2),
    price: parseFloat(orders.slOrder.price).toFixed(2),
    variancePercent: parseFloat(orders.slOrder.variancePercent).toFixed(2),
    marketPercent: parseFloat(orders.slOrder.marketPercent).toFixed(2),
    triggerPrice: parseFloat(orders.slOrder.triggerPrice).toFixed(2),
    reduced: orders.slOrder.reduced,
    userID: orders.userID,
  };

  if (
    slOrder.triggerPrice !== undefined &&
    (slOrder.triggerPrice > 0) & (slOrder.triggerPrice !== "")
  )
    newSL = await exports.prepareWithTrigger(slOrder);
  else newSL = await exports.prepareOrder(slOrder);

  const tpOrder = {
    tag: orders.tpOrder.tag,
    type: orders.tpOrder.type,
    exec: orders.tpOrder.exec,
    side: orders.tpOrder.side,
    orderQty: parseFloat(orders.tpOrder.orderQty),
    price: parseFloat(orders.tpOrder.price),
    variancePercent: parseFloat(orders.tpOrder.variancePercent),
    marketPercent: parseFloat(orders.tpOrder.marketPercent),
    triggerPrice: parseFloat(orders.tpOrder.triggerPrice),
    reduced: orders.tpOrder.reduced,
    userID: orders.userID,
  };

  if (
    tpOrder.triggerPrice !== undefined &&
    (tpOrder.triggerPrice > 0) & (tpOrder.triggerPrice !== "")
  )
    newTP = await exports.prepareWithTrigger(tpOrder);
  else newTP = await exports.prepareOrder(tpOrder);

  const bulks = { orders: [newOrder.data, newSL.data, newTP.data] };

  const headers = await getHeaders(method, userID, path, bulks);

  try {
    const orderResponse = await axios.post(orderUrl, bulks, { headers });
    const orders = orderResponse.data;
    const entry = orders[0];
    const sl = orders[1];
    const tp = orders[2];
    let addedOrder;
    let addedSL;
    let addedTP;

    addedOrder = {
      ...newOrder.newOrder,
      status: entry.ordStatus,
      clOrdID: entry.clOrdID,
      orderID: entry.orderID,
      originalPrice: entry.price,
    };

    firebase.saveOrder(userID, addedOrder.clOrdID, addedOrder);

    addedSL = {
      ...newSL.newOrder,
      status: sl.ordStatus,
      clOrdID: sl.clOrdID,
      orderID: sl.orderID,
      originalPrice: sl.price,
    };

    firebase.saveOrder(userID, addedSL.clOrdID, addedSL);

    addedTP = {
      ...newTP.newOrder,
      status: tp.ordStatus,
      clOrdID: tp.clOrdID,
      orderID: tp.orderID,
      originalPrice: tp.price,
    };

    firebase.saveOrder(userID, addedTP.clOrdID, addedTP);

    return [addedOrder, addedSL, addedTP];
  } catch (error) {
    console.log(error.message);
  }
};

exports.createBestOrder = async (newOrder) => {
  const path = "/order";
  const orderUrl = `${bitmexApi}${path}`;
  const method = "POST";

  const data = newOrder.data;
  const order = newOrder.newOrder;
  const side = data.side;

  const userID = order.userID;

  const headers = await getHeaders(method, userID, path, data);
  const clOrdID = data.clOrdID;
  const variancePercent = parseFloat(order.variancePercent);

  try {
    const orderResponse = await axios.post(orderUrl, data, { headers });
    if (orderResponse.status === 200) {
      realtimeManager.trackOrder(userID, { clOrdID, variancePercent });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.orderDispatch = async (order) => {
  const type = order.type;
  let newOrder;

  if (
    order.triggerPrice !== undefined &&
    order.triggerPrice > 0 &&
    order.triggerPrice !== ""
  )
    newOrder = await exports.prepareWithTrigger(order);
  else newOrder = await exports.prepareOrder(order);

  switch (
    type //Iterar sobre los tipos de ordenes
  ) {
    case "normal": // Orden normal, que debe ir al order book de inmediato
      return exports.createOrder(newOrder);

    case "tracked": // tracked order. En este caso, exec=Best && triggerPrice !== undefined
      return exports.createBestOrder(newOrder);

    case "pending": // pending orders >> tracker
      return exports.pendingOrder(order);
  }
};

exports.pendingOrder = async (newOrder) => {
  /*
        const order = {
            tag,
            type,
            exec,
            side,
            orderQty,
            triggerPrice,
            reduced,
            userID
        };

    */
  const userID = newOrder.userID;
  const newKey = firebase.newKey(userID);
  newOrder.clOrdID = newKey;
  const pendingOrder = await firebase.saveOrder(userID, newKey, newOrder);
};

exports.executePending = async (order) => {
  /*
        const order = {
            tag,
            type,
            exec,
            side,
            orderQty,
            triggerPrice,
            reduced,
            userID,
            clOrdID
        };

    */
  const key = order.clOrdID;
  const newOrder = await exports.prepareOrder(order, key);
  const data = newOrder.data;

  const path = "/order";
  const orderUrl = `${bitmexApi}${path}`;
  const method = "POST";

  const orderReference = newOrder.newOrder;

  const userID = order.userID;

  try {
    const headers = await getHeaders(method, userID, path, data);
    const clOrdID = data.clOrdID;
    const exec = orderReference.exec;
    const tag = orderReference.tag;

    const orderResponse = await axios.post(orderUrl, data, { headers });
    if (orderResponse.status === 200) {
      const order = orderResponse.data;

      const completedOrder = {
        ...newOrder.newOrder,
        symbol,
        exec,
        orderID: order.orderID,
        status: "New",
        originalPrice: order.price,
        tag,
      };

      firebase.updateOrder(userID, clOrdID, completedOrder);
      return completedOrder;
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.prepareWithTrigger = async (newOrder) => {
  const prices = await exports.getBestTrades();
  const orderQty = parseFloat(newOrder.orderQty);
  const side = newOrder.side;
  const exec = newOrder.exec;
  const tag = newOrder.tag;
  let triggerPrice = parseFloat(newOrder.triggerPrice);
  let ordType;
  let price = parseFloat(newOrder.price);
  const userID = newOrder.userID;
  const reduced = newOrder.reduced;

  const clOrdID = await firebase.newKey(userID);

  let data = {
    symbol,
    side,
    orderQty,
    clOrdID,
  }; //Se crea la DATA de la orden SIN EL PRECIO

  switch (exec) {
    case "Limit": //Ordenes Limit
      if (side === "Buy") {
        // Compras

        if (prices.buy <= triggerPrice) ordType = "StopLimit";
        else ordType = "LimitIfTouched";
      } else {
        // Ventas

        if (prices.sell <= triggerPrice) ordType = "LimitIfTouched";
        else ordType = "StopLimit";
      }

      data.price = price;
      data.stopPx = triggerPrice;
      break;

    case "Market":
      if (side === "Buy") {
        // Compras

        if (prices.buy <= triggerPrice) ordType = "Stop";
        else ordType = "MarketIfTouched";
      } else {
        // Ventas

        if (prices.sell <= triggerPrice) ordType = "MarketIfTouched";
        else ordType = "Stop";
      }

      data.stopPx = triggerPrice;

      break;

    case "Best":
      console.log("Best");
      break;
  }

  data.execInst = "LastPrice";
  data.ordType = ordType;

  if (tag === "Stop" || tag === "Stop Loss") {
    data.ordType = "Stop";
  }

  if (reduced === true) {
    if (data.execInst !== undefined) {
      data.execInst = data.execInst + ",ReduceOnly";
    } else data.execInst = "ReduceOnly";
  }

  return { data, newOrder };
};

exports.prepareOrder = async (newOrder, OrderKey) => {
  const prices = await exports.getBestTrades();

  const orderQty = parseFloat(newOrder.orderQty);
  const side = newOrder.side;
  const exec = newOrder.exec;
  const tag = newOrder.tag;
  let ordType;
  let price = parseFloat(newOrder.price);
  const userID = newOrder.userID;
  const reduced = newOrder.reduced;
  let clOrdID;

  if (!OrderKey) clOrdID = await firebase.newKey(userID);
  else clOrdID = OrderKey;

  let data = {
    symbol,
    side,
    orderQty,
    price,
    clOrdID,
  }; //Se crea la DATA de la orden SIN EL PRECIO

  switch (exec) {
    case "Limit":
      ordType = exec;
      break;

    case "Market":
      ordType = exec;
      break;

    case "Best":
      ordType = "Limit";
      if (side === "Buy") data.price = prices.buy;
      else data.price = prices.sell;
      data.execInst = "ParticipateDoNotInitiate";
      break;
  }

  data.ordType = ordType;

  // Detectar si el tipo de la orden es un stop (tag = stop)

  if (tag === "Stop" || tag === "Stop Loss") {
    data.ordType = "Stop";
  }

  if (reduced === true) {
    if (data.execInst !== undefined) {
      data.execInst = data.execInst + ",ReduceOnly";
    } else data.execInst = "ReduceOnly";
  }

  return { data, newOrder };
};

exports.createOrder = async (newOrder) => {
  //side, orderQty, variance, price)
  const path = "/order";
  const orderUrl = `${bitmexApi}${path}`;
  const method = "POST";

  const data = newOrder.data;
  const order = newOrder.newOrder;

  const userID = order.userID;

  const headers = await getHeaders(method, userID, path, data);
  const clOrdID = data.clOrdID;
  const exec = order.exec;
  const tag = order.tag;

  try {
    const orderResponse = await axios.post(orderUrl, data, { headers });
    if (orderResponse.status === 200) {
      const order = orderResponse.data;

      const completedOrder = {
        ...newOrder.newOrder,
        clOrdID,
        symbol,
        exec,
        orderID: order.orderID,
        status: "New",
        originalPrice: order.price,
        tag,
      };

      firebase.saveOrder(userID, clOrdID, completedOrder);
      return { status: "success" };
    } else {
      return { status: "failure" };
    }
  } catch (error) {
    return { status: "failure" };
  }
};

exports.getBestTrades = async () => {
  const bestTradesUrl = `${bitmexApi}/orderBook/L2?symbol=${symbol}&depth=1`;
  const result = await axios.get(bestTradesUrl);
  const { status, data } = result;
  if (status === 200 && data.length === 2) {
    const sell = data[0].price;
    const buy = data[1].price;
    return {
      sell,
      buy,
    };
  }
};

exports.changeOrderPrice = async (origClOrdID, price, userID) => {
  const data = {
    origClOrdID,
    price,
  };

  const method = "PUT";
  const path = "/order";
  const headers = await getHeaders(method, userID, path, data);
  const orderUrl = `${bitmexApi}${path}`;

  const orderChangeResponse = await axios.put(orderUrl, data, { headers });

  if (
    orderChangeResponse.status === 200 &&
    orderChangeResponse.data &&
    orderChangeResponse.data.ordStatus &&
    orderChangeResponse.data.price
  ) {
    const order = orderChangeResponse.data;
    //const query = { clOrdID: order.clOrdID };
    //const newValues = {$set: { price: order.price, status: 'Price Updated' }};
    return order;
  }
};

exports.getMarketChart = async (interval, count) => {
  const symbol = "XBT:perpetual";
  const query = `symbol=${symbol}&binSize=${interval}&count=${count}&reverse=true&partial=true`;
  const path = "/trade/bucketed?" + query;
  const tradeUrl = `${bitmexApi}${path}`;

  const chartResponse = await axios.get(tradeUrl);

  if (chartResponse.status == 200 && chartResponse.data) {
    const chart = chartResponse.data;
    return chart;
  }
};

exports.getOrderStatus = async (clOrdID, userID) => {
  const method = "GET";
  const filter = JSON.stringify({ clOrdID });
  const query = encodeURI(`symbol=XBTUSD&filter=${filter}`);
  const path = "/order?" + query;
  const orderUrl = `${bitmexApi}${path}`;

  const headers = await getHeaders(method, userID, path);

  const orderStatusResponse = await axios.get(orderUrl, { headers });
  if (
    orderStatusResponse.status === 200 &&
    orderStatusResponse.data &&
    orderStatusResponse.data.length === 1 &&
    orderStatusResponse.data[0].ordStatus
  ) {
    return orderStatusResponse.data[0].ordStatus;
  }
};

/*exports.trackOrderStatus = async () => {
    const orders = await exports.getOrders({ status: { $ne: 'Filled' }});
    orders.map((order) => {
        const { clOrdID, originalPrice, side, variance } = order;
        if (trackedOrders.includes(clOrdID)) return;
        trackedOrders.push(clOrdID);
        const orderId = clOrdID.toString();
        const orderPrice = originalPrice;
        let limitPriceAllowed = 0;
        if (side === 'Buy') limitPriceAllowed = orderPrice + (orderPrice*variance);
        else limitPriceAllowed = orderPrice - (orderPrice*variance);
        let checkOrderId = setInterval(async function() {
            const orderStatus = await exports.getOrderStatus(orderId);
            if (orderStatus === 'Filled') {
                // Filled
                clearInterval(checkOrderId);
                return;
            }

            // not filled
            // 1. getBestTrades
            let priceCompare;
            const bestPrices = await exports.getBestTrades();
            if (side === 'Buy') priceCompare = bestPrices.buy;
            else priceCompare = bestPrices.sell;

            // 2. compare current order price with best price
            if(orderPrice !== priceCompare) {
                if ((side === 'Buy' && priceCompare <= limitPriceAllowed) ||
            (side === 'Sell' && priceCompare >= limitPriceAllowed)) {
                    // 3. update order with price if needed
                    await exports.changeOrderPrice(orderId, priceCompare);
                }
            }
        }, 1000);
    });
};*/

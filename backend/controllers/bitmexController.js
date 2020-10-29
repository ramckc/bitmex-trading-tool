const bitmex = require('../utils/bitmex');


exports.createOrder = async (req, res) => {
    const variancePercent = (req.body.variancePercent) ? parseFloat(req.body.variancePercent) / 100 : null;
    const newOrder = { ...req.body, variancePercent };
    const result = await bitmex.orderDispatch(newOrder);
    res.json(result);
};

exports.updateLeverage = async (req, res) => {
    const newLeverage = req.body.newLev;
    const userID = req.body.userID;
    const isIsolated = req.body.isIsolated;
    const newLevInfo = {newLeverage, isIsolated, userID};
    const result = await bitmex.changeLeverage(newLevInfo);
    res.json(result);
}

exports.managedOrders = async (req, res) => {
    console.log(req.body);
    const result = await bitmex.bulkOrders(req.body);
    //console.log(result);
    res.json(result);
};

exports.getCandles = async (req, res) => {
    const { interval, count } = req.query;
    const chart = await bitmex.getMarketChart(interval, count);
    //console.log(req.query);
    res.json(chart);
};

exports.cancelOrder = async (req, res) => {
    const data = req.body;
    const result = await bitmex.cancelOrder(data);
    res.json(result);
}
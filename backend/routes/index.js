const express = require("express");
const router = express.Router();
const bitmexController = require("../controllers/bitmexController");
const userController = require("../controllers/userController");
const { catchErrors } = require("../handlers/errorHandlers");

router.get("/bitmex/getCandles", catchErrors(bitmexController.getCandles));
router.post("/bitmex/add", catchErrors(bitmexController.createOrder));
router.post("/bitmex/managed", catchErrors(bitmexController.managedOrders));
router.post("/user/registerUser", catchErrors(userController.registerUser));
router.post('/bitmex/leverage', catchErrors(bitmexController.updateLeverage));
router.post('/bitmex/cancelOrder', catchErrors(bitmexController.cancelOrder));

router.get("/", (req, res) => {
  res.send("Hello");
});

module.exports = router;

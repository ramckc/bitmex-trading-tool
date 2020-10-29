const firebase = require("firebase-admin");
const serviceAccount = require("../cryptotrading-radp-firebase-adminsdk-f34qx-fca22940b7.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://cryptotrading-radp.firebaseio.com/",
});

const db = firebase.database();

exports.saveOrder = (userID, key, order) => {
  return new Promise((resolve, reject) => {
    const db = firebase.database();
    let userOrder = db.ref("Users/" + userID + "/orders/" + key + "");

    userOrder.set(order, (error) => {
      if (error) {
        resolve({
          statusCode: 201,
          message: "error saving order",
        });
      } else {
        if (order.type === "pending") {
          // Chequear si es pending y crear Pending Order
          const pendingOrders = db.ref("Pending Orders/" + key);

          pendingOrders.set(order);
          resolve({
            statusCode: 200,
            message: "order successfully added",
            result: {
              userID,
              key,
            },
          });
        } else {
          resolve({
            statusCode: 200,
            message: "order successfully added",
            result: {
              userID,
              key,
            },
          });
        }
      }
    });
  });
};

exports.getOrders = (userID) => {
  return new Promise((resolve, reject) => {
    const db = firebase.database();
    let userOrders = db.ref("Users/" + userID + "/orders/");

    userOrders.once("value", (snapshot) => {
      let orders = snapshot.val();
      resolve({
        statusCode: 200,
        message: "order list",
        result: {
          orders,
        },
      });
    });
  });
};

exports.updateOrder = (userID, orderID, toUpdate) => {
  return new Promise((resolve, reject) => {
    const db = firebase.database();
    const orderRef = db.ref("Users/" + userID + "/orders/" + orderID);

    orderRef.update(toUpdate, (error) => {
      if (error) {
        // Error when updating order
      } else {
        // Verify if order is tracked to also update trackedOrders
        orderRef.once("value", function (snapshot) {
          const type = snapshot.val().type;

          if (type === "tracked") {
            let trackedRef = db.ref("Tracked Orders/" + orderID);
            trackedRef.update(toUpdate);
          }

          // order successfully updated
          resolve({
            statusCode: 200,
            message: "order successfully updated",
          });
        });
      }
    });
  });
};

exports.deleteOrder = (userID, orderID) => {
  const db = firebase.database();
  const orderRef = db.ref("Users/" + userID + "/orders/" + orderID);

  orderRef.once("value", function (snapshot) {
    const type = snapshot.val().type;

    if (type === "tracked") {
      const trackedRef = db.ref("Tracked Orders/" + orderID);
      trackedRef.remove();
      orderRef.remove();
    } else {
      orderRef.remove();
    }
  });
};

exports.newKey = (userID) => {
  const db = firebase.database();
  let userOrders = db.ref("Users/" + userID + "/orders/");
  let newOrder = userOrders.push();
  let newOrderID = newOrder.key;
  return newOrderID;
};

exports.createrUser = (user) => {
  return new Promise(async (resolve, reject) => {
    const { email, password, key, secret } = user;
    const data = await firebase.auth().createUser({ email, password });

    if (data.uid) {
      const newID = data.uid;
      const newUserApi = db.ref("Private/Users/" + newID + "/Keys/");

      const userInfo = {
        key,
        secret,
      };

      newUserApi.set(userInfo, function (error) {
        if (error) {
          resolve({
            status: "failure",
            message: error.message,
            result: {
              userID: newID,
            },
          });
        } else {
          resolve({
            status: "success",
            message: "User stored in database",
            result: {
              userID: newID,
            },
          });
        }
      });
    } else {
      resolve({
        status: "failure",
        message: "Failed to create user",
      });
    }
  });
};

exports.getUserKey = (userID) => {
  return new Promise((resolve, reject) => {
    const db = firebase.database();
    let userRef = db.ref("Private/Users/" + userID + "/Keys/");

    userRef.once("value", function (snapshot) {
      const data = snapshot.val();
      let api = data.key;
      let secret = data.secret;
      resolve({ api, secret });
    });
  });
};

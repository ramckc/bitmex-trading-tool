const firebase = require("../utils/firebase");

exports.registerUser = async (req, res) => {
  const { email, password, key, secret } = req.body;
  if (email && password && key && secret) {
    // TODO: validations and send validated user
    const result = await firebase.createrUser(req.body);
    res.json(result);
  } else {
    res.json({
      status: "failure",
      message: "Unable to create user because information is missing",
    });
  }
};

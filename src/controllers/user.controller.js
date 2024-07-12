const { SuccessResponse } = require("../core/success.response");
const { newUser, checkLoginEmailToken } = require("../services/user.service");

class UserController {
  // new user
  newUser = async (req, res, next) => {
    const response = await newUser({
      email: req.body.email,
    });
    console.log(req.body.email);
    console.log("user", response);
    new SuccessResponse(response).send(res);
  };

  // check user token via Email
  checkLoginEmailToken = async (req, res, next) => {
    const { token } = req.query;
    const response = await checkLoginEmailToken({
      token: token,
    });
    new SuccessResponse(response).send(res);
  };
}

module.exports = new UserController();

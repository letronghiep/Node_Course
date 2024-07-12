"use strict";
const { SuccessResponse } = require("../core/success.response");
const dataProfiles = [
  {
    usr_id: 1,
    usr_name: "John",
    usr_avatar: "image.com/user/1",
  },
  {
    usr_id: 2,
    usr_name: "John2",
    usr_avatar: "image.com/user/2",
  },
];

class ProfileController {
  profiles = async (req, res, next) => {
    new SuccessResponse({
      message: "view all profiles",
      metadata: dataProfiles,
    }).send(res);
  };
  profile = async (req, res, next) => {
    new SuccessResponse({
      message: "view own profiles",
      metadata: {
        usr_id: 2,
        usr_name: "John2",
        usr_avatar: "image.com/user/2",
      },
    }).send(res);
  };
}

module.exports = new ProfileController();

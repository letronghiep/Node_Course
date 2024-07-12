"use strict";
const Template = require("../models/templates.model");
const { htmlEmailToken } = require("../utils/tem.html");
const newTemplate = async ({ tem_id = 0, tem_name }) => {
  // 1. check exists
  // 2. create template
  const newTemplate = await Template.create({
    tem_id,
    tem_name: tem_name,
    tem_html: htmlEmailToken(),
  });
  return newTemplate;
};

const getTemplate = async ({ tem_name }) => {
  const template = await Template.findOne({
    tem_name: tem_name,
  });
  return template;
};

module.exports = {
  newTemplate,
  getTemplate,
};

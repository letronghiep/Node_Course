const { Types } = require("mongoose");

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};
const convertToObjMongo = (id) => new Types.ObjectId(id);
const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};
// replacePlaceholder
const replacePlaceholder = (template, params) => {
  Object.keys(params).forEach((k) => {
    const placeholder = `{{${k}}}`; // {{verify key}}
    template = template.replace(new RegExp(placeholder, "g"), params[k]);
  });
  return template;
};
// random product id
const randomProductId = () => {
  return Math.floor(Math.random() * 899999 + 100000);
};

module.exports = {
  getSelectData,
  getUnSelectData,
  convertToObjMongo,
  replacePlaceholder,
  randomProductId,
};

const { Types } = require("mongoose");

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};
const convertToObjMongo = (id) => new Types.ObjectId(id);
const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};
module.exports = {
  getSelectData,
  getUnSelectData,
  convertToObjMongo
};

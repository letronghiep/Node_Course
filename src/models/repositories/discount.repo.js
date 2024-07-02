"use strict";

const { getUnSelectData, getSelectData } = require("../../utils");

async function findAllDiscountUnSelect({
  limit,
  sort,
  page,
  filter,
  unSelect,
  model,
}) {
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const skip = (page - 1) * limit;
  return await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getUnSelectData(unSelect))
    .lean();
}

async function findAllDiscountSelect({
  limit,
  sort,
  page,
  filter,
  select,
  model,
}) {
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const skip = (page - 1) * limit;
  return await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
}
const checkDiscountExists = async ({ model, filter }) => {
  return await model.findOne(filter).lean();
};
module.exports = {
  findAllDiscountSelect,
  findAllDiscountUnSelect,
  checkDiscountExists,
};

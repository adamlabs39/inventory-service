import moment from "moment";

const toEpochDate = (date) => {
  return moment(date).unix();
};

export {toEpochDate}

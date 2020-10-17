export default class Validator {
  static register = (must = true) => ({
    name: {
      presence: must,
      type: "string",
    },
    phone: {
      presence: must,
      type: "string",
      length: { maximum: 15, minimum: 10 },
    },
    password: {
      presence: must,
      type: "string",
      length: { maximum: 15, minimum: 4 },
    },
  });
  static login = (must = true) => ({
    phone: {
      presence: must,
      type: "string",
      length: { maximum: 15, minimum: 10 },
    },
    password: {
      presence: must,
      type: "string",
      length: { maximum: 15, minimum: 4 },
    },
  });
  static category = (must = true) => ({
    title: {
      presence: must,
      type: "string",
    },
    image: {
      presence: must,
      type: "string",
    },
  });
  static product = (must = true) => ({
    name: {
      presence: must,
      type: "string",
    },
    price: {
      presence: must,
    },
    image: {
      presence: must,
      type: "string",
    },
    description: {
      presence: must,
      type: "string",
    },
  });
  static payment = (must = true) => ({
    title: {
      presence: must,
      type: "string",
    },
    min: {
      presence: must,
    },
    max: {
      presence: must,
    },
    image: {
      presence: must,
      type: "string",
    },
    url: {
      presence: must,
      type: "string",
    },
  });
}

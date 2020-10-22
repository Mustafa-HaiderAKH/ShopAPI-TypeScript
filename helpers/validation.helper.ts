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
  static otp = (must = true) => ({
    otp: {
      presence: must,
      type: "number",
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
  static makeInvoice = (must = true) => ({
    address: {
      presence: must,
      type: "string",
    },
    method: {
      presence: must,
      type: "string",
      inclusion: {
        within: {
          zc: "zc",
          ah: "ah",
          cd: "cd",
        },
        message: "^%{value} is not valid",
      },
    },
    long: {
      presence: must,
      type: "string",
    },
    lat: {
      presence: must,
      type: "string",
    },
    products: {
      presence: must,
      type: "array",
    },
  });
  static oneProduct = (must = true) => ({
    id: {
      presence: must,
      type: "number",
    },
    quantity: {
      presence: must,
      type: "number",
    },
  });
  static userUpdate = (must = true) => ({
    name: {
      type: "string",
    },
    phone: {
      type: "string",
      length: { maximum: 15, minimum: 10 },
    },
    password: {
      type: "string",
      length: { maximum: 15, minimum: 4 },
    },
  });
  static forgetpassword = (must = true) => ({
    phone: {
      type: "string",
    },
  });
}

require("dotenv").config();
let config: any;
export default config = {
  jwtsecret: process.env.JWT_SECRET || "shhh",
};

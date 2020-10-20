import { errRes } from "../../helpers/tools";
import * as jwt from "jsonwebtoken";
import config from "../../config/config";
import { User } from "../../src/entity/User";

let userAuth: any;
export default userAuth = async (req, res, next): Promise<object> => {
  const token = req.headers.token;
  if (!token) return errRes(res, "Miss token");
  let payload: any;
  try {
    payload = jwt.verify(token, config.jwtsecret);
  } catch (error) {
    return errRes(res, "invalid token");
  }
  let user = await User.findOne({
    where: { id: payload.id, active: true, complete: true },
  });
  if (!user) return errRes(res, "please complete register proccess");

  req.user = user;

  return next();
};

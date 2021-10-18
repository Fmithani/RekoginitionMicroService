const { Response } = require('../config/Util');
const MESSAGE = require('../config/messages');

exports.Valid = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    if (
      bearerToken ==
      "VEEtQmFja2VuZCBBUEkgQWNjZXNzIFRva2VuClByb2plY3Q6Tm9kZUpTMTQuMTM="
    ) {
      req.token = bearerToken;
      next();
    } else {
        return Response(res, false, MESSAGE.UNAUTHORISED_USER, null, 401);
    }
  } else {
    // Forbidden
    return Response(res, false, MESSAGE.UNAUTHORISED_USER, null, 401);
  }
};

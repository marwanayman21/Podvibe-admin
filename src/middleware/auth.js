const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {  
  const token = req.header("x-auth-token");
  
  if (!token) {
    return res
      .status(400)
      .send({ message: "Access denied, no token provided" });
  }
  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decodedToken) => {
    if (err) {
      return res.status(400).send({ message: "Invalid token" });
    }

    // console.log(decodedToken);
    
    req.user = decodedToken;
    next();
  });
};

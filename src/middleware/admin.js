const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // console.log(req.cookies.token);
  
  const token = req.cookies.token || req.header("x-auth-token");
  if (!token) {
    console.log("token not available");
    
    return res
      .status(400)
      .redirect("/register/signup")
  }
  try{
    const decodedToken = jwt.verify(token, process.env.JWTPRIVATEKEY);
    
    if(!decodedToken.isAdmin){ // not an admin
      return res.status(403).render("error", {
        message: "You don't have access to this content",
        back_url: "/",
      });
    }
    req.user = decodedToken;
    next();
  }catch (err){
    console.error(err);
    return res.status(400).render("error", {
      message: "Error while Authenticating admin",
      back_url: "/register/signin",
    });
  }

};

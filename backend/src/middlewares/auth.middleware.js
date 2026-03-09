import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {

//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: "No token" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {

//     const decoded = jwt.decode(token);

//     req.user = decoded;

//     next();

//   } catch (err) {

//     return res.status(401).json({ message: "Invalid token" });

//   }
// };

export const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  // ในช่วงทดสอบ ให้ mock user ไปก่อน
  req.user = {
    id: 1,
    role: "admin"
  };

  next();
};
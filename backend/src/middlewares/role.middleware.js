export const checkRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนทำรายการ (Unauthorized)" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `ไม่มีสิทธิ์เข้าถึงส่วนนี้ (สิทธิ์ปัจจุบัน: ${req.user.role}, ต้องการ: ${roles.join(" หรือ ")})` 
      });
    }

    next();
  };
};
import crypto from "crypto";

/**
 * Hash a password using scrypt with a random 16-byte salt
 * Format returned: salt:hash (hex encoded)
 */
export function hashPassword(password) {
  if (!password) throw new Error("Password cannot be empty");
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a password against stored salt:hash or environment fallback
 */
export function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) return false;

  // Stored in standard salt:hash format
  if (storedPassword.includes(":")) {
    try {
      const [salt, key] = storedPassword.split(":");
      const keyBuffer = Buffer.from(key, "hex");
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch (err) {
      console.error("Password verification error:", err);
      return false;
    }
  }

  // Fallback for simple string comparison (timing safe)
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(storedPassword);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return password === storedPassword;
  }
}

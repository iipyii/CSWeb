import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

/*
========================
1. LOGIN
========================
*/
router.get("/login", (req, res) => {

  const url = `${process.env.SSO_AUTH_URL}?response_type=code&client_id=${process.env.SSO_CLIENT_ID}&redirect_uri=${process.env.SSO_REDIRECT_URI}&scope=openid%20profile%20email%20personnel_info`;

  res.redirect(url);
});


/*
========================
2. CALLBACK
========================
*/
router.get("/callback", async (req, res) => {

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No authorization code" });
  }

  try {

    /*
    exchange code → token
    */
    const tokenRes = await axios.post(
      process.env.SSO_TOKEN_URL,
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.SSO_REDIRECT_URI,
        client_id: process.env.SSO_CLIENT_ID,
        client_secret: process.env.SSO_CLIENT_SECRET
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const access_token = tokenRes.data.access_token;


    /*
    get user profile
    */
    const userRes = await axios.get(
      process.env.SSO_USERINFO_URL,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    const profile = userRes.data;

    const email = profile.email;
    const name = profile.display_name;
    const username = profile.username;


    /*
    create or update user in database
    */
    let user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {

      user = await prisma.users.create({
        data: {
          email: email,
          full_name: name,
          role: "lecturer"
        }
      });

    }


    /*
    create JWT
    */
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    /*
    set cookie
    */
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    });


    /*
    redirect frontend
    */
    res.redirect(`${process.env.FRONTEND_URL}/admin/dashboard`);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "SSO login failed" });

  }

});


/*
========================
3. GET CURRENT USER
========================
*/
router.get("/me", (req, res) => {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json(decoded);

  } catch (err) {

    res.status(401).json({ error: "Invalid token" });

  }

});


/*
========================
4. LOGOUT
========================
*/
router.get("/logout", (req, res) => {

  res.clearCookie("token");

  res.json({ message: "Logged out" });

});

export default router;
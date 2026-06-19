import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyMail } from "../emailVerify/verifyMail.js";
import { sendOtpMail } from "../emailVerify/sendOtpMail.js";
import nodemailer from "nodemailer";
import { adminAuth } from "../config/firebaseAdmin.js";

const FRONTEND_URL = "https://noteshub-five.vercel.app/";

//  register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    if (existingUser && !existingUser.isVerified) {
      const token = jwt.sign(
        { id: existingUser._id },
        process.env.SECRET_KEY,
        { expiresIn: "10m" }
      );

      existingUser.token = token;
      await existingUser.save();

      await verifyMail(token, email);

      return res.status(200).json({
        success: true,
        message: "Verification email resent.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
  username: name,
  email,
  password: hashedPassword,
  isVerified: false,
  isLoggedIn: false,
  termsAccepted: false,
});


    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "10m" }
    );

    user.token = token;
    await user.save();

    await verifyMail(token, email);

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Verify your email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//email verification
export const verification = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.redirect(`${FRONTEND_URL}?verified=false`);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.redirect(
        err.name === "TokenExpiredError"
          ? `${FRONTEND_URL}?verified=expired`
          : `${FRONTEND_URL}?verified=false`
      );
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.redirect(`${FRONTEND_URL}?verified=false`);
    }

    if (user.isVerified) {
      return res.redirect(`${FRONTEND_URL}?verified=true`);
    }

    user.isVerified = true;
    user.token = null;
    await user.save();

    return res.redirect(`${FRONTEND_URL}?verified=true`);
  } catch (error) {
    return res.redirect(`${FRONTEND_URL}?verified=false`);
  }
};

//login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email",
      });
    }

    await Session.deleteMany({ userId: user._id });
    await Session.create({ userId: user._id });

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "10d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    user.isLoggedIn = true;
    await user.save();

    return res.status(200).json({
  success: true,
  message: `Welcome ${user.username}`,
  accessToken,
  refreshToken,
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    termsAccepted: user.termsAccepted,
  },
});

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//logout
export const logoutUser = async (req, res) => {
  try {
    const userId = req.userId;

    await Session.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOtpMail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//change password
export const changePassword = async (req, res) => {
  try {
    const { email } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.isLoggedIn = false;
    await user.save();

    await Session.deleteMany({ userId: user._id });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Google Sign-In
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required",
      });
    }

let decodedFirebase;
    try {
      decodedFirebase = await adminAuth.verifyIdToken(idToken);
    } catch (err) {
      console.log("FIREBASE TOKEN VERIFY ERROR:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token",
      });
    }

    console.log("DECODED FIREBASE:", JSON.stringify({ email: decodedFirebase.email, name: decodedFirebase.name }));
    const { email, name, email_verified } = decodedFirebase;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account has no email associated",
      });
    }

let user = await User.findOne({ email });

    if (!user) {
      try {
        user = await User.create({
          username: name || email.split("@")[0],
          email,
          isVerified: email_verified ?? true,
          isLoggedIn: false,
          termsAccepted: false,
          authProvider: "google",
        });
       
      } catch (createErr) {
        
        return res.status(500).json({ success: false, message: createErr.message });
      }
    } else if (user.authProvider === "local") {
      // existing local account, same email -> link Google sign-in to it
      user.authProvider = "google";
      if (!user.isVerified && email_verified) {
        user.isVerified = true;
      }
      await user.save();
    }

    await Session.deleteMany({ userId: user._id });
    await Session.create({ userId: user._id });

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "10d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    user.isLoggedIn = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Welcome ${user.username}`,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        termsAccepted: user.termsAccepted,
      },
    });
} catch (error) {
console.log("GOOGLE AUTH ERROR FULL:", JSON.stringify(error, null, 2));
    console.log("GOOGLE AUTH ERROR MSG:", error.message);
    console.log("GOOGLE AUTH ERROR CODE:", error.code);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const sendContactMail = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"NotesHub Contact" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: `New Contact Message from ${fullName}`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: "Mail sent successfully"
    });

  } catch (error) {
    console.log("CONTACT MAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Mail sending failed"
    });
  }
};

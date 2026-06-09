import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";
import notesRoute from "./routes/notesRoute.js";
import termsRoutes from "./routes/termsRoutes.js";
import adminRoute from "./routes/adminRoute.js";

const app = express();

const allowedOrigins = [
  "https://noteshub-five.vercel.app",
  "https://noteshub-admin.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",

  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "username", "password"],
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use("/api/auth", userRoute);
app.use("/api/notes", notesRoute);
app.use("/api/terms", termsRoutes);
app.use("/api/admin", adminRoute);


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  });

export default app;
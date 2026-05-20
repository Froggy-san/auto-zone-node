import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "./.env" });

// Handling unchought excptions. use an undefined variable to trigger this process.

process.on("uncaughtException", (err) => {
  console.log("UNCOUGHT EXCEPTIONS! 🧨 Shutting down....");
  console.log(err.name, err.message);
  console.log(err);
  //! process.exit(1); // Closing the server that way is unrecommended becasue it closes the server right away before handling any request might have been fired before crashing, The right way of closing it is down below.

  process.exit(1);
});

import app from "./app";

// 1) Get the mongoDB driver link
const DB = process.env.DATABASE!.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD!,
);

// 2) connect to the DB

mongoose
  .connect(DB)
  .then(() => {
    console.log("✅ DB connection successful!");
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`🚀 App running on port ${port}...`);
});

// Handle unhandled rejections (like database connection issues)
process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

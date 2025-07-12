require("dotenv").config();
const express = require("express");
const cors = require("cors");
const invoiceRoutes = require("./routes/invoice.route");
const connectDB = require("./db/db.connect");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment PORT
const PORT = process.env.PORT || 5000;

// ✅ Root Route (to fix "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Welcome to the Invoice API!");
});

// API Routes
app.use("/api/invoices", invoiceRoutes);

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
  });
});

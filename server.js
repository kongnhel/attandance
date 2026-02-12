const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const participantRoutes = require("./Routes/participantRoutes");
const adminRoutes = require('./Routes/adminRoutes');

const app = express();

// ==========================================
// ១. ការកំណត់ Session Middleware
// ==========================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cambo-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // ចាំមុខ Admin ១ ថ្ងៃ
      secure: false, // ប្រើ false សម្រាប់ការតេស្តលើ Local IP
    },
  }),
);

// ==========================================
// ២. Global Middleware (បោះទិន្នន័យទៅ Header)
// ==========================================
app.use((req, res, next) => {
  // ជួយឱ្យរាល់ File .ejs ទាំងអស់ស្គាល់ Variable "isAdmin"
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

// ==========================================
// ៣. Standard Middlewares
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==========================================
// ៤. ការតភ្ជាប់ Database (MongoDB Atlas)
// ==========================================
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ កំហុស៖ រកមិនឃើញ MONGO_URI ក្នុង File .env ទេបង!");
  process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("-----------------------------------------");
    console.log("✅ DATABASE: ភ្ជាប់ទៅ Atlas ជោគជ័យហើយបង!");
    console.log("🚀 STATUS: ប្រព័ន្ធ Evolution V5 ដំណើរការយ៉ាងរលូន!");
    console.log("-----------------------------------------");
  })
  .catch((err) => {
    console.error("❌ ភ្ជាប់ទៅ Atlas បរាជ័យ៖", err.message);
  });

// ==========================================
// ៥. ការកំណត់ Routes
// ==========================================

// បំបាត់ Error Favicon ឱ្យស្អាត Console
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ផ្លូវមេសម្រាប់ប្រព័ន្ធ
app.use("/", participantRoutes);

// ទំព័រដើមបាញ់ទៅកន្លែងចុះឈ្មោះ
app.get("/", (req, res) => {
  res.redirect("/manager/qr-reg");
});

app.use('/admin', adminRoutes);

// ការពារផ្លូវដែលរកមិនឃើញ (404)
app.use((req, res) => {
  res.status(404).render("result", {
    title: "រកមិនឃើញផ្លូវ (404)",
    message: "បងទៅណា? ផ្លូវនេះគ្មានមនុស្សដើរទេ! ស្កែន QR ឱ្យត្រឹមត្រូវផង! 😂",
    color: "red",
  });
});

// ==========================================
// ៦. បើកដំណើរការ Server
// ==========================================
const PORT = process.env.PORT || 3000;
const LOCAL_IP = "192.168.171.179"; // កុំភ្លេចឆែកមើល IP ពេលដូរ Wi-Fi ផងបង! 😂

app.listen(PORT, () => {
  console.log(`📡 SERVER IS LIVE AT: http://${LOCAL_IP}:${PORT}`);
  console.log("-----------------------------------------");
  console.log("💡 LOGIC ACTIVE: Navbar នឹងដឹងថាពេលណាត្រូវបង្ហាញប៊ូតុង Logout!");
});

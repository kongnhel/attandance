const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const session = require("express-session"); // ១. ហៅ Library Session មកប្រើ
require("dotenv").config();

const participantRoutes = require("./Routes/participantRoutes");

const app = express();

// ២. ការកំណត់ Session Middleware (Evolution V3)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cambo-secret-key", // សោរសម្រាប់ Encrypt Session
    resave: false, // កុំរក្សាទុក Session បើគ្មានការប្រែប្រួល
    saveUninitialized: true, // បង្កើត Session ភ្លាមៗពេលមានអ្នកចូលមើល
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // ឱ្យវាចាំបាន ១ ថ្ងៃ (២៤ ម៉ោង)
      secure: false, // ដាក់ false បើប្រើ http ធម្មតា (តេស្តលើ Local IP)
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
    console.log("🚀 STATUS: ប្រព័ន្ធ Evolution V3 (Session) ដំណើរការហើយ!");
    console.log("-----------------------------------------");
  })
  .catch((err) => {
    console.error("❌ ភ្ជាប់ទៅ Atlas បរាជ័យ៖", err.message);
  });

app.use("/", participantRoutes);

app.get("/", (req, res) => {
  res.redirect("/manager/qr-reg");
});
// ដាក់នៅខាងលើ app.use("/", participantRoutes);
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use((req, res) => {
  res.status(404).render("result", {
    title: "រកមិនឃើញផ្លូវ (404)",
    message: "បងទៅណា? ផ្លូវនេះគ្មានមនុស្សដើរទេ! ស្កែន QR ឱ្យត្រឹមត្រូវផង! 😂",
    color: "red",
  });
});

const PORT = process.env.PORT || 3000;
const LOCAL_IP = "10.10.17.244";

app.listen(PORT, () => {
  console.log(`📡 SERVER IS LIVE AT: http://${LOCAL_IP}:${PORT}`);
  console.log("-----------------------------------------");
  console.log("💡 SESSION IS ACTIVE: Admin អាច Login ជាប់បានហើយ!");
});

const express = require("express");
const router = express.Router();

// ១. ទាញយក "អ្នកយាមទ្វារ" (Middleware) និង Controller
const adminAuth = require("../Middleware/authMiddleware");
const ctrl = require("../Controllers/participantController");

// ==========================================
// 🛡️ ផ្នែក ADMIN AUTHENTICATION (Login/Logout)
// ==========================================
router.get("/admin/login", ctrl.getLoginPage);
router.post("/admin/login", ctrl.loginAdmin);
router.get("/admin/logout", ctrl.logoutAdmin);

// ==========================================
// 📅 ផ្នែក EVENT PROGRAM MANAGEMENT (New! Evolution V8.0)
// ==========================================
// ទំព័រមើលបញ្ជីកម្មវិធី និងបង្កើតកម្មវិធីថ្មី
router.get("/admin/programs", adminAuth, ctrl.getProgramsPage);
// ផ្លូវសម្រាប់ Save កម្មវិធីថ្មីចូល Database
router.post("/admin/programs/create", adminAuth, ctrl.createProgram);

// ==========================================
// 📊 ផ្នែក ADMIN DASHBOARD & MANAGEMENT
// ==========================================
// មើលបញ្ជីឈ្មោះសិស្សសរុប និងស្ថិតិ
router.get("/admin/dashboard", adminAuth, ctrl.getAdminDashboard);
// លុបទិន្នន័យសិស្ស (Hard Delete)
router.delete("/admin/delete-student/:id", adminAuth, ctrl.deleteStudent);
// ចុះវត្តមានដោយដៃពី Dashboard
router.post("/admin/check-in/:id", adminAuth, ctrl.markAttendance);

// ==========================================
// 🛠️ ផ្នែក MANAGER (QR Code Pages)
// ==========================================
router.get("/manager/qr-reg", ctrl.showRegisterQR);
router.get("/manager/qr-att", ctrl.showAttendanceQR);

// ==========================================
// 🎓 ផ្នែកសម្រាប់សិស្ស (Public Routes)
// ==========================================
// ១. ការចុះឈ្មោះ (Registration)
router.get("/register", ctrl.getRegisterPage);
router.post("/api/register", ctrl.registerParticipant);

// ២. ប្រវត្តិរូប និងកាតវត្តមាន (Student Profile & Pass)
router.get("/student/profile/:id", ctrl.getStudentProfile);
router.put("/student/profile/update/:id", ctrl.updateStudentProfile);

// ៣. ការស្កែនវត្តមាន (Attendance API)
// ផ្លូវនេះប្រើសម្រាប់ទទួលទិន្នន័យពី Scanner នៅពេល Manager ស្កែន QR សិស្ស
router.post("/api/check-in", ctrl.processCheckIn);

module.exports = router;

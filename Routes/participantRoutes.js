const express = require("express");
const router = express.Router();

// ១. ទាញយក "អ្នកយាមទ្វារ" (Middleware) និង Controller
const adminAuth = require("../Middleware/authMiddleware");
const ctrl = require("../Controllers/participantController");

// --- 🛠️ ផ្នែកសម្រាប់ MANAGER (QR Pages) ---
router.get("/manager/qr-reg", ctrl.showRegisterQR); 
router.get("/manager/qr-att", ctrl.showAttendanceQR); 

// --- 🛡️ ផ្នែក ADMIN AUTHENTICATION (Login/Logout) ---
// បង្ហាញទំព័រ Login
router.get("/admin/login", ctrl.getLoginPage); 

// ទទួល Password តាម POST និងបង្កើត Session
router.post("/admin/login", ctrl.loginAdmin); 

// បំផ្លាញ Session និងចាកចេញពីប្រព័ន្ធ
router.get("/admin/logout", ctrl.logoutAdmin); 

// --- 📊 ផ្នែក ADMIN DASHBOARD (Protected) ---
// ប្រើ adminAuth ដើម្បីឆែកមើល "សំបុត្រអនុញ្ញាត" ក្នុង Session
router.get("/admin/dashboard", adminAuth, ctrl.getAdminDashboard); 
// ផ្លូវសម្រាប់លុបសិស្ស (ត្រូវការពារដោយ adminAuth ជានិច្ច!)
router.delete("/admin/delete-student/:id", adminAuth, ctrl.deleteStudent);

// ការចុះវត្តមានដោយដៃ (Manual Check-in) ពី Dashboard
router.post("/admin/check-in/:id", adminAuth, ctrl.markAttendance); 

// --- 🎓 ផ្នែកសម្រាប់សិស្ស (Public Routes) ---
// ចុះឈ្មោះសិស្សថ្មី
router.get("/register", ctrl.getRegisterPage);
router.post("/api/register", ctrl.registerParticipant);

// កត់ត្រាវត្តមាន (Scan QR)
router.get("/check-in", ctrl.getCheckInPage);
router.post("/api/check-in", ctrl.processCheckIn);

// ផ្លូវសម្រាប់ Profile សិស្ស
router.get("/student/profile/:id", ctrl.getStudentProfile);
router.put("/student/profile/update/:id", ctrl.updateStudentProfile);


module.exports = router;
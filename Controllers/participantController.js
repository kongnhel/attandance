const Participant = require("../models/Participant");
const Attendance = require("../models/Attendance");

// ==========================================
// 🛡️ ផ្នែក ADMIN AUTHENTICATION (Session)
// ==========================================

// ១. បង្ហាញទំព័រ Login
exports.getLoginPage = (req, res) => {
  res.render("login");
};

// ២. Logic ត្រួតពិនិត្យ Password និងបង្កើត Session
exports.loginAdmin = (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true; // ✅ បង្កើតសំបុត្រអនុញ្ញាតក្នុង Session
    return res.redirect("/admin/dashboard"); 
  } else {
    return res.render("result", { 
      title: "Error", 
      message: "Password ខុសបងអើយ! 😂", 
      color: "red" 
    });
  }
};

// ៣. បំផ្លាញ Session និងចាកចេញពីប្រព័ន្ធ
exports.logoutAdmin = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.redirect("/admin/dashboard");
    }
    res.clearCookie('connect.sid'); // លុប Cookie ចេញពី Browser Admin ឱ្យស្អាត
    res.redirect("/admin/login"); 
  });
};

// ==========================================
// 📊 ផ្នែក ADMIN DASHBOARD & MANAGEMENT
// ==========================================

// ៤. បង្ហាញ Dashboard (ទាញទិន្នន័យសិស្សមកបង្ហាញ)
exports.getAdminDashboard = async (req, res) => {
  try {
    const students = await Participant.find().sort({ createdAt: -1 });
    const attendanceRecords = await Attendance.find();
    const checkedInIds = attendanceRecords.map(r => r.participantId.toString());
    
    res.render("adminDashboard", { students, checkedInIds });
  } catch (err) { 
    res.status(500).send("មិនអាចបើក Dashboard បានទេបង!"); 
  }
};

// ៥. ចុះវត្តមានដោយដៃពី Dashboard
exports.markAttendance = async (req, res) => {
  try {
    const participantId = req.params.id;
    const newRecord = new Attendance({ participantId });
    await newRecord.save();
    res.redirect("/admin/dashboard"); 
  } catch (err) {
    res.status(500).send("បញ្ហាក្នុងការកត់វត្តមានបង!");
  }
};

// ==========================================
// 🛠️ ផ្នែក MANAGER (QR Code Pages)
// ==========================================

exports.showRegisterQR = (req, res) => {
  const link = `${req.protocol}://${req.get("host")}/register`;
  res.render("manager/qr_register", { link });
};

exports.showAttendanceQR = async (req, res) => {
  try {
    const link = `${req.protocol}://${req.get("host")}/check-in`;
    const students = await Participant.find();
    const attendanceRecords = await Attendance.find();
    const checkedInIds = attendanceRecords.map((r) => r.participantId.toString());

    res.render("manager/qr_attendance", { link, students, checkedInIds });
  } catch (err) {
    res.status(500).send("កំហុសទំព័រ QR បងអើយ!");
  }
};

// ==========================================
// 🎓 ផ្នែកសិស្ស (Public Registration & Check-in)
// ==========================================

exports.getRegisterPage = (req, res) => res.render("register");
exports.getCheckInPage = (req, res) => res.render("checkin");

exports.registerParticipant = async (req, res) => {
    try {
        // ១. បង្កើត Object ថ្មីពី req.body
        const newUser = new Participant(req.body);
        
        // ២. ព្យាយាម Save ចូល Database
        await newUser.save();

        // ✅ បើជោគជ័យ បោះ JSON ទៅឱ្យ AJAX
        return res.status(200).json({ 
            success: true, 
            message: "ចុះឈ្មោះរួចរាល់ហើយបង! 🎉" 
        });

    } catch (err) {
        // ❌ បើមានកំហុស (ដូចជាជាន់លេខទូរស័ព្ទ)
        console.error("❌ កំហុសចុះឈ្មោះ:", err.message);

        let errorMsg = "មានបញ្ហាបច្ចេកទេសបងអើយ!";
        
        // ឆែកមើលថា តើមកពីជាន់លេខទូរស័ព្ទ (Unique Constraint) ឬអត់?
        if (err.code === 11000) {
            errorMsg = "លេខទូរស័ព្ទនេះមានក្នុងប្រព័ន្ធរួចហើយ! សាកលេខផ្សេងមើលបង។";
        } else if (err.name === 'ValidationError') {
            errorMsg = "បងបំពេញព័ត៌មានអត់គ្រប់តាមលក្ខខណ្ឌទេ!";
        }

        // បោះ Error 400 ជា JSON ទៅឱ្យ AJAX បង្ហាញ Popup ក្រហម
        return res.status(400).json({ 
            success: false, 
            message: errorMsg 
        });
    }
};

exports.processCheckIn = async (req, res) => {
  const { phone } = req.body;
  try {
    const student = await Participant.findOne({ phone });
    if (!student) return res.render("result", { title: "Error", message: "រកមិនឃើញឈ្មោះទេ!", color: "red" });

    const newRecord = new Attendance({ participantId: student._id });
    await newRecord.save();
    res.render("result", { title: "ជោគជ័យ", message: `សួស្តី ${student.name_kh}! វត្តមានបានកត់ត្រា។`, color: "green" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// មុខងារលុបទិន្នន័យសិស្ស (Evolution V4.1)
exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // ១. លុបសិស្សចេញពី Table Participants
        const deletedStudent = await Participant.findByIdAndDelete(studentId);

        if (!deletedStudent) {
            return res.status(404).json({ 
                success: false, 
                message: "រកមិនឃើញសិស្សនេះក្នុងប្រព័ន្ធទេបង! 😂" 
            });
        }

        // ២. លុបវត្តមានទាំងអស់ដែលពាក់ព័ន្ធនឹងសិស្សនេះ (Cleanup)
        await Attendance.deleteMany({ participantId: studentId });

        console.log(`✅ លុបសិស្ស ${deletedStudent.name_kh} រួចរាល់!`);

        // ៣. បោះ JSON ទៅឱ្យ Frontend (SweetAlert2)
        res.json({ 
            success: true, 
            message: "ទិន្នន័យសិស្ស និងវត្តមានត្រូវបានលុបស្អាតហើយបង!" 
        });

    } catch (err) {
        console.error("❌ Delete Error:", err.message);
        res.status(500).json({ 
            success: false, 
            message: "អាឡូ! Server មានបញ្ហា លុបអត់ចូលទេបង!" 
        });
    }
};

// ១. Update មុខងារ Register ឱ្យបោះ ID ទៅឱ្យ Frontend
exports.registerParticipant = async (req, res) => {
    try {
        const newUser = new Participant(req.body);
        const savedUser = await newUser.save();
        // បោះ studentId ទៅឱ្យ AJAX ដើម្បី Redirect
        return res.status(200).json({ 
            success: true, 
            studentId: savedUser._id 
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: "លេខទូរស័ព្ទមានរួចហើយ!" });
    }
};

// ២. បង្ហាញទំព័រ Profile សិស្ស
exports.getStudentProfile = async (req, res) => {
    try {
        const student = await Participant.findById(req.params.id);
        if (!student) return res.redirect('/register');
        res.render("studentProfile", { student });
    } catch (err) { res.redirect('/register'); }
};

// ៣. Logic កែប្រែព័ត៌មាន (Update)
exports.updateStudentProfile = async (req, res) => {
    try {
        await Participant.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true, message: "ព័ត៌មានរបស់ប្អូនបានកែប្រែជោគជ័យ! 🎉" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};
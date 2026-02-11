const Participant = require("../models/Participant");
const Attendance = require("../models/Attendance");
const Program = require("../models/Program"); // 👈 ត្រូវប្រាកដថាបងមាន Model នេះ

// ==========================================
// 🛡️ ផ្នែក ADMIN AUTHENTICATION (Session)
// ==========================================

// ១. បង្ហាញទំព័រ Login
exports.getLoginPage = (req, res) => {
    res.render("login", { title: "Admin Login" });
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
            color: "red",
        });
    }
};

// ៣. បំផ្លាញ Session និងចាកចេញពីប្រព័ន្ធ
exports.logoutAdmin = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.redirect("/admin/dashboard");
        res.clearCookie("connect.sid"); // លុប Cookie ឱ្យស្អាត
        res.redirect("/admin/login");
    });
};

// ==========================================
// 📅 ផ្នែក EVENT PROGRAM MANAGEMENT (New!)
// ==========================================

// ៤. បង្ហាញទំព័រគ្រប់គ្រងកម្មវិធី
exports.getProgramsPage = async (req, res) => {
    try {
        const programs = await Program.find().sort({ date: -1 });
        res.render("admin/programs", { programs, title: "គ្រប់គ្រងកម្មវិធី" });
    } catch (err) {
        res.status(500).send("មិនអាចបើកទំព័រកម្មវិធីបានទេ!");
    }
};

// ៥. បង្កើតកម្មវិធីថ្មី
exports.createProgram = async (req, res) => {
    try {
        const newProgram = new Program(req.body);
        await newProgram.save();
        res.redirect("/admin/programs");
    } catch (err) {
        res.status(400).send("បំពេញព័ត៌មានកម្មវិធីអត់ត្រូវទេបង!");
    }
};

// ==========================================
// 📊 ផ្នែក ADMIN DASHBOARD & MANAGEMENT
// ==========================================

// ៦. បង្ហាញ Dashboard
exports.getAdminDashboard = async (req, res) => {
    try {
        const students = await Participant.find().sort({ createdAt: -1 });
        const attendanceRecords = await Attendance.find();
        const checkedInIds = attendanceRecords.map((r) => r.participantId.toString());

        res.render("adminDashboard", { students, checkedInIds, title: "Admin Dashboard" });
    } catch (err) {
        res.status(500).send("មិនអាចបើក Dashboard បានទេបង!");
    }
};

// ៧. ចុះវត្តមានដោយដៃពី Dashboard
exports.markAttendance = async (req, res) => {
    try {
        const participantId = req.params.id;
        // ចំណាំ៖ ក្នុង V8 បងគួរជ្រើសរើស ProgramId ផង តែនេះជា Fallback
        const newRecord = new Attendance({ participantId });
        await newRecord.save();
        res.redirect("/admin/dashboard");
    } catch (err) {
        res.status(500).send("បញ្ហាក្នុងការកត់វត្តមានបង!");
    }
};

// ៨. លុបទិន្នន័យសិស្ស (Evolution V4.1)
exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const deletedStudent = await Participant.findByIdAndDelete(studentId);

        if (!deletedStudent) {
            return res.status(404).json({ success: false, message: "រកមិនឃើញសិស្សទេ!" });
        }
        await Attendance.deleteMany({ participantId: studentId });
        res.json({ success: true, message: "ទិន្នន័យត្រូវបានលុបស្អាតហើយបង!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 🛠️ ផ្នែក MANAGER (QR Code Pages)
// ==========================================

exports.showRegisterQR = (req, res) => {
    const link = `${req.protocol}://${req.get("host")}/register`;
    res.render("manager/qr_register", { link, title: "QR Register" });
};

exports.showAttendanceQR = async (req, res) => {
    try {
        const link = `${req.protocol}://${req.get("host")}/api/check-in`;
        const students = await Participant.find();
        const attendanceRecords = await Attendance.find();
        const checkedInIds = attendanceRecords.map((r) => r.participantId.toString());

        res.render("manager/qr_attendance", { link, students, checkedInIds, title: "QR Attend" });
    } catch (err) {
        res.status(500).send("កំហុសទំព័រ QR បងអើយ!");
    }
};

// ==========================================
// 🎓 ផ្នែកសិស្ស (Registration & Profile)
// ==========================================

exports.getRegisterPage = (req, res) => res.render("student/register", { title: "ចុះឈ្មោះសិស្ស" });

exports.registerParticipant = async (req, res) => {
    try {
        const newUser = new Participant(req.body);
        const savedUser = await newUser.save();
        
        // រក្សាទុកក្នុង Session ដើម្បីឱ្យ Header បង្ហាញប៊ូតុង "MY PASS"
        req.session.studentId = savedUser._id; 

        return res.status(200).json({
            success: true,
            studentId: savedUser._id,
            message: "ចុះឈ្មោះរួចរាល់ហើយបង! 🎉",
        });
    } catch (err) {
        console.error("❌ Error:", err.message);
        let msg = "មានបញ្ហាបច្ចេកទេស!";
        if (err.code === 11000) msg = "លេខទូរស័ព្ទនេះមានរួចហើយ!";
        return res.status(400).json({ success: false, message: msg });
    }
};

// exports.getStudentProfile = async (req, res) => {
//     try {
//         const student = await Participant.findById(req.params.id);
//         if (!student) return res.redirect("/register");
//        res.render("student/studentProfile", { student, title: "ប្រវត្តិរូបប្អូន" });
//     } catch (err) {
//         res.redirect("/register");
//     }
// };

// exports.getStudentProfile = async (req, res) => {
//     try {
//         // ១. រកព័ត៌មានសិស្សដូចមុន
//         const student = await Participant.findById(req.params.id);
//         if (!student) return res.redirect("/register");

//         // ២. 🔥 [NEW] រកប្រវត្តិវត្តមានរបស់គាត់ ហើយ "Populate" យកព័ត៌មានកម្មវិធីមក
//         const history = await Attendance.find({ studentId: student._id })
//                                       .populate('programId') // <--- កន្លែងវេទមន្ត! វាទៅយកព័ត៌មាន Program មកដាក់ជំនួស ID
//                                       .sort({ scannedAt: -1 }); // រៀបយកអាថ្មីបំផុតមកដាក់លើគេ

//         // ៣. បោះទិន្នន័យ history ទៅឱ្យ View
//         res.render("student/studentProfile", { 
//             student, 
//             history, // <--- បោះទៅឱ្យ EJS
//             title: "កាតវត្តមាន - " + student.name_en,
//             studentId: student._id,
//             isAdmin: false
//         });

//     } catch (err) {
//         console.error(err);
//         res.redirect("/register");
//     }
//   }

exports.getStudentProfile = async (req, res) => {
    try {
        const student = await Participant.findById(req.params.id);
        if (!student) return res.redirect("/register");

        // 🔥 កែត្រង់នេះ៖ ប្រើ "participantId" មិនមែន "studentId" ទេ!
        const history = await Attendance.find({ participantId: student._id }) 
                                      .populate('programId')
                                      .sort({ createdAt: -1 }); // យកអាថ្មីបំផុតមកលើ

        res.render("student/studentProfile", { 
            student,
            history, // បោះទិន្នន័យទៅឱ្យ View
            title: "Digital Pass - " + student.name_en,
            studentId: student._id,
            isAdmin: false
        });

    } catch (err) {
        console.error("Error:", err);
        res.redirect("/register");
    }
};

exports.updateStudentProfile = async (req, res) => {
    try {
        await Participant.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true, message: "ព័ត៌មានបានកែប្រែជោគជ័យ! 🎉" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// ==========================================
// 🤳 ផ្នែក SCAN ATTENDANCE (Smart Check-in)
// ==========================================

exports.processCheckIn = async (req, res) => {
    const { studentId, programId } = req.body; // ទទួល ID ពី QR និង Program ពី Scanner

    try {
        const student = await Participant.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "រកមិនឃើញសិស្ស!" });

        // ១. កំណត់ពេលវេលាថ្ងៃនេះ (Once Per Day Logic)
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(); end.setHours(23,59,59,999);

        // ២. ឆែកមើលថាតើគាត់បានស្កែនក្នុងកម្មវិធីនេះសម្រាប់ថ្ងៃនេះហើយឬនៅ?
        const alreadyChecked = await Attendance.findOne({
            participantId: studentId,
            programId: programId,
            createdAt: { $gte: start, $lte: end }
        });

        if (alreadyChecked) {
            return res.status(400).json({ 
                success: false, 
                message: "ប្អូនបានកត់វត្តមានក្នុងកម្មវិធីនេះរួចហើយ! 😂" 
            });
        }

        // ៣. រក្សាទុកវត្តមានថ្មី
        const newRecord = new Attendance({ participantId: studentId, programId });
        await newRecord.save();

        res.json({ success: true, message: `ជោគជ័យ! សួស្តី ${student.name_kh}!` });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server គាំងហើយបង!" });
    }
};
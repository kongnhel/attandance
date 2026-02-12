// controllers/schoolController.js
const School = require('../models/School');

// ១. បង្ហាញទំព័រគ្រប់គ្រងសាលា
exports.getManageSchools = async (req, res) => {
    try {
        const schools = await School.find().sort({ province: 1, name: 1 });
        res.render('admin/manageSchools', { 
            schools,
            title: "Manage Schools",
            isAdmin: true 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
};

// ២. បន្ថែមសាលាថ្មី
exports.addSchool = async (req, res) => {
    try {
        const { name, telegramLink, province } = req.body;
        await School.create({ name, telegramLink, province });
        res.redirect('/admin/schools'); // Refresh មកទំព័រដើមវិញ
    } catch (err) {
        console.error("Error adding school:", err);
        res.redirect('/admin/schools');
    }
};
// ៣. កែប្រែសាលា (Update) - 🔥 NEW
exports.updateSchool = async (req, res) => {
    try {
        const { id } = req.params; // យក ID ពី URL
        const { name, telegramLink, province } = req.body; // យកទិន្នន័យថ្មីពី Form

        await School.findByIdAndUpdate(id, { 
            name, 
            telegramLink, 
            province 
        });

        res.redirect('/admin/schools'); // ត្រឡប់ទៅទំព័រដើមវិញ
    } catch (err) {
        console.error("Error updating school:", err);
        res.redirect('/admin/schools');
    }
};
// ៣. លុបសាលា
exports.deleteSchool = async (req, res) => {
    try {
        await School.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
};
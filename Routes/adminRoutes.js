const express = require('express');
const router = express.Router();

// 🔥 កែត្រង់នេះ៖ ដាក់ 'controllers' (c តូច) ឱ្យត្រូវនឹងឈ្មោះ Folder របស់បង
const schoolController = require('../Controllers/schoolController');

// =========================================
// 🏫 ROUTES សម្រាប់គ្រប់គ្រងសាលា
// =========================================
router.get('/schools', schoolController.getManageSchools);
router.post('/schools/add', schoolController.addSchool);
router.post('/schools/update/:id', schoolController.updateSchool);
router.delete('/schools/delete/:id', schoolController.deleteSchool);

// =========================================
// 🛡️ ROUTES ផ្សេងៗ (ដាក់នៅទីនេះ...)
// =========================================
// router.get('/dashboard', ...);


module.exports = router; // ត្រូវតែមានបន្ទាត់នេះនៅចុងក្រោយ!
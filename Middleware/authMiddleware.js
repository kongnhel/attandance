/**
 * អ្នកយាមទ្វារកម្រិត Evolution V3 (Session Guard)
 * ឆែកមើលថាតើអ្នកប្រើប្រាស់មាន "សំបុត្រអនុញ្ញាត" ក្នុង Session ឬអត់
 */
const adminAuth = (req, res, next) => {
  // ១. ឆែកមើលថា តើក្នុង Session មានការបញ្ជាក់ថាជា Admin ហើយឬនៅ?
  if (req.session && req.session.isAdmin) {
    next(); // បើមាន "សំបុត្រអនុញ្ញាត" ឱ្យចូលបាន! 🎉
  } else {
    // ២. បើអត់មានទេ បាញ់ត្រឡប់ទៅទំព័រ Login ឬបង្ហាញសារព្រមាន
    res.status(401).render("result", {
      title: "Access Denied",
      message:
        "បងអើយ! បងអត់ទាន់បាន Login ទេ! សូមទៅវាយ Password ក្នុងទំព័រ Login សិនទៅណា! 😂",
      color: "red",
    });
  }
};

module.exports = adminAuth;

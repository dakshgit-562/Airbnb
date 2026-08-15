const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Isme verify karo ki sirf aap hi admin ho
router.get('/manage-hosts', adminController.getManageHosts);
router.post('/approve-host', adminController.postApproveHost);
router.post('/reject-host', adminController.postRejectHost);
router.post('/clear-all-hosts', adminController.postClearAllHosts);

module.exports = router;
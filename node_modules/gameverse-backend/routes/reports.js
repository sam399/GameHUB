const express = require('express');
const {
  createReport,
  getUserReports,
  getReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createReport);
router.get('/user', getUserReports);
router.get('/:reportId', getReport);

module.exports = router;
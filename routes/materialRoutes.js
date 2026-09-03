const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', materialController.listMaterials);
router.get('/add', materialController.getAddMaterial);
router.post('/add', materialController.postAddMaterial);
router.get('/edit/:id', materialController.getEditMaterial);
router.post('/edit/:id', materialController.postEditMaterial);
router.get('/view/:id', materialController.getViewMaterial);
router.post('/delete/:id', materialController.deleteMaterial);

module.exports = router;

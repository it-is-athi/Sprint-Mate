const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// In future add authMiddleware to protect these routes

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id/toggle', taskController.toggleTaskCompletion);

module.exports = router;

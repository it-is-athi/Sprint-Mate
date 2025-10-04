// routes/ragRoutes.js

const express = require('express');
const multer = require('multer');
const { uploadPdfController, askQuestionController } = require('../controllers/ragController');

const router = express.Router();

// Configure multer to handle file uploads in memory.
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
});

// --- CRITICAL PART 1 ---
// Define the route for uploading and processing a PDF.
// The endpoint is '/upload' (so the full URL is '/api/rag/upload').
// The multer key is 'pdfFile'. This MUST match the FormData key in your frontend.
router.post('/upload', upload.single('pdfFile'), uploadPdfController);

// Define the route for asking a question.
router.post('/ask', askQuestionController);

module.exports = router;
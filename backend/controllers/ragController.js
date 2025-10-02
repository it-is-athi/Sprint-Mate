// controllers/ragController.js

const ragService = require('../services/ragService');

/**
 * Controller to handle PDF file uploads.
 * This function's logic remains the same.
 */
const uploadPdfController = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded, or the field name is incorrect. The backend expects the key "pdfFile".' });
    }

    try {
        const fileBuffer = req.file.buffer;
        await ragService.processPdf(fileBuffer);
        res.status(200).json({ 
            message: 'PDF processed successfully. You can now ask questions about it.' 
        });

    } catch (error) {
        console.error('Error in uploadPdfController:', error);
        res.status(500).json({ error: 'An internal error occurred while processing the PDF.' });
    }
};

/**
 * Controller to handle user questions.
 * This function is updated to handle the 'isGeneral' flag.
 */
const askQuestionController = async (req, res) => {
    // --- THIS IS THE KEY CHANGE ---
    // We now destructure both 'question' and the optional 'isGeneral' flag
    // from the request body sent by the frontend.
    const { question, isGeneral } = req.body;
    
    // Basic validation
    if (!question || typeof question !== 'string' || question.trim() === '') {
        return res.status(400).json({ error: 'A non-empty question is required.' });
    }

    try {
        // We pass the 'isGeneral' flag to the service function.
        // The service will use this flag to decide which logic path to take.
        const answer = await ragService.askQuestion(question, isGeneral);
        
        // Send the answer back to the frontend
        res.status(200).json({ answer });

    } catch (error) {
        console.error('Error in askQuestionController:', error);
        res.status(500).json({ error: 'An internal error occurred while getting the answer.' });
    }
};

module.exports = {
    uploadPdfController,
    askQuestionController,
};
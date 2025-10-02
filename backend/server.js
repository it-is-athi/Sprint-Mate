const dotenv = require('dotenv');
dotenv.config(); // <-- MUST be first!

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Set port from env or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

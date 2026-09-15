const express = require('express');
const cors = require('cors');
const path = require('path');
const scanRoutes = require('./routes/scans');
const supervisoryRoutes = require('./routes/supervisory');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/scans', authMiddleware, scanRoutes);
app.use('/api/supervisory', authMiddleware, supervisoryRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

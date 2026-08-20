import express from 'express';
import { Settings } from '../models/index.js';

const router = express.Router();

router.get('/:username', async (req, res) => {
  try {
    const settings = await Settings.findOne({ username: req.params.username });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { username, targetBand, testDate } = req.body;
  try {
    const settings = await Settings.findOneAndUpdate(
      { username },
      { targetBand, testDate, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

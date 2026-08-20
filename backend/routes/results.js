import express from 'express';
import { MockResult, SectionResult } from '../models/index.js';

const router = express.Router();

// Mock Results Routes
router.get('/mock/:username', async (req, res) => {
  try {
    const results = await MockResult.find({ username: req.params.username }).sort({ date: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/mock', async (req, res) => {
  try {
    const result = new MockResult(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Section Results Routes
router.get('/section/:username/:section', async (req, res) => {
  try {
    const results = await SectionResult.find({ 
      username: req.params.username,
      section: req.params.section
    }).sort({ date: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all recent activity for a user
router.get('/activity/:username', async (req, res) => {
  try {
    const results = await SectionResult.find({ username: req.params.username }).sort({ date: -1 });
    // Flatten data field to match existing frontend expectations
    const flattened = results.map(r => ({
      ...r.data,
      section: r.section,
      date: r.date
    }));
    res.json(flattened);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/section', async (req, res) => {
  try {
    const { username, section, data } = req.body;
    const result = new SectionResult({ username, section, data });
    await result.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

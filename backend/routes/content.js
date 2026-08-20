import express from 'express';
import { CustomPassage, CustomListening, CustomWriting, CustomSpeaking } from '../models/index.js';

const router = express.Router();

// Get content by type
router.get('/:type', async (req, res) => {
  const { type } = req.params;
  try {
    let data;
    switch (type) {
      case 'reading':
        data = await CustomPassage.find();
        break;
      case 'listening':
        data = await CustomListening.find();
        break;
      case 'writing':
        data = await CustomWriting.find();
        break;
      case 'speaking':
        data = await CustomSpeaking.find();
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save content by type
router.post('/:type', async (req, res) => {
  const { type } = req.params;
  try {
    let doc;
    switch (type) {
      case 'reading':
        doc = new CustomPassage(req.body);
        break;
      case 'listening':
        doc = new CustomListening(req.body);
        break;
      case 'writing':
        doc = new CustomWriting(req.body);
        break;
      case 'speaking':
        doc = new CustomSpeaking(req.body);
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }
    await doc.save();
    res.status(201).json({ message: 'Content saved successfully', doc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete content by type and ID
router.delete('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    let doc;
    switch (type) {
      case 'reading':
        doc = await CustomPassage.findByIdAndDelete(id);
        break;
      case 'listening':
        doc = await CustomListening.findByIdAndDelete(id);
        break;
      case 'writing':
        doc = await CustomWriting.findByIdAndDelete(id);
        break;
      case 'speaking':
        doc = await CustomSpeaking.findByIdAndDelete(id);
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }
    
    if (!doc) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json({ message: 'Content deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

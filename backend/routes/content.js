import express from 'express';
import { CustomReadingTest, CustomListening, CustomWriting, CustomSpeaking } from '../models/index.js';

const router = express.Router();

// Get content by type
router.get('/:type', async (req, res) => {
  const { type } = req.params;
  try {
    let data;
    switch (type) {
      case 'reading':
        data = await CustomReadingTest.find();
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
        doc = new CustomReadingTest(req.body);
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

// Update content by type and ID
router.put('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    let doc;
    switch (type) {
      case 'reading':
        doc = await CustomReadingTest.findByIdAndUpdate(id, req.body, { new: true });
        break;
      case 'listening':
        doc = await CustomListening.findByIdAndUpdate(id, req.body, { new: true });
        break;
      case 'writing':
        doc = await CustomWriting.findByIdAndUpdate(id, req.body, { new: true });
        break;
      case 'speaking':
        doc = await CustomSpeaking.findByIdAndUpdate(id, req.body, { new: true });
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }
    if (!doc) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({ message: 'Content updated successfully', doc });
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
        doc = await CustomReadingTest.findByIdAndDelete(id);
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
    
    // Find and delete any associated Vercel Blob files
    try {
      const { del } = await import('@vercel/blob');
      const plainDoc = doc.toObject();
      
      const extractUrls = (obj) => {
        let urls = [];
        if (typeof obj === 'string') {
          if (obj.includes('.public.blob.vercel-storage.com')) {
            urls.push(obj);
          }
        } else if (Array.isArray(obj)) {
          for (const item of obj) urls.push(...extractUrls(item));
        } else if (obj !== null && typeof obj === 'object') {
          for (const key in obj) urls.push(...extractUrls(obj[key]));
        }
        return urls;
      };

      const urlsToDelete = extractUrls(plainDoc);
      if (urlsToDelete.length > 0) {
        console.log('Deleting associated blobs:', urlsToDelete);
        await del(urlsToDelete);
      }
    } catch (blobErr) {
      console.error('Failed to delete associated blobs:', blobErr);
      // We don't fail the request if blob deletion fails, but we log it
    }

    res.json({ message: 'Content deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

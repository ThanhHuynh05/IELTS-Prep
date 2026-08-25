import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);

const settingsSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  targetBand: { type: Number, required: true },
  testDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Settings = mongoose.model('Settings', settingsSchema);

const customReadingTestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  pdfUrl: { type: String }, // Optional PDF for the entire test
  passages: [
    {
      title: { type: String }, // Optional
      text: { type: String }, // Made optional in case a PDF is provided
      imageUrl: { type: String },
      sections: { type: Array, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export const CustomReadingTest = mongoose.model('CustomReadingTest', customReadingTestSchema);

const customListeningSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  audioUrl: { type: String, required: true },
  pdfUrl: { type: String }, // Optional PDF for the test questions
  transcript: { type: String },
  sections: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CustomListening = mongoose.model('CustomListening', customListeningSchema);

const customWritingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  task1: { type: String, required: true },
  task2: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CustomWriting = mongoose.model('CustomWriting', customWritingSchema);

const customSpeakingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  part1: { type: Array, required: true },
  part2: { type: String, required: true },
  part3: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CustomSpeaking = mongoose.model('CustomSpeaking', customSpeakingSchema);

const mockResultSchema = new mongoose.Schema({
  username: { type: String, required: true },
  id: { type: String, required: true },
  overallBand: { type: Number, required: true },
  readingBand: { type: Number },
  listeningBand: { type: Number },
  writingBand: { type: Number },
  speakingBand: { type: Number },
  date: { type: Date, default: Date.now }
});

export const MockResult = mongoose.model('MockResult', mockResultSchema);

const sectionResultSchema = new mongoose.Schema({
  username: { type: String, required: true },
  section: { type: String, enum: ['reading', 'listening', 'writing', 'speaking'], required: true },
  date: { type: Date, default: Date.now },
  // Flexible schema to accommodate different result structures (e.g., scores, feedback, raw answers)
  data: { type: mongoose.Schema.Types.Mixed, required: true }
});

export const SectionResult = mongoose.model('SectionResult', sectionResultSchema);

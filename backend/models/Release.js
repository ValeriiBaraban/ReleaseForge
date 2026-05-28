import mongoose from 'mongoose';

const changelogItemSchema = new mongoose.Schema({
  commitHash: { type: String, required: true },
  message: { type: String, required: true },
  author: { type: String },
  category: {
    type: String,
    enum: ['Feature', 'Fix', 'Chore', 'Uncategorized'],
    default: 'Uncategorized'
  }
});

const releaseSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true 
  },
  version: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  changelog: [changelogItemSchema]
}, { timestamps: true });

export default mongoose.model('Release', releaseSchema);
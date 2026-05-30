import mongoose from 'mongoose';

const releaseSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  version: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  changelogMarkdown: {
    type: String,
    required: true
  },
  includedCommits: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, { timestamps: true });

releaseSchema.index({ projectId: 1, version: 1 }, { unique: true });

export const Release = mongoose.model('Release', releaseSchema);
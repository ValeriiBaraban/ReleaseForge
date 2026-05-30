import mongoose from 'mongoose';

const rawCommitSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sha: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  author: {
    name: String,
    email: String,
    date: Date
  },
  githubRawData: {
    type: Object
  },
  isProcessed: {
    type: Boolean,
    default: false 
  }
}, { timestamps: true });

rawCommitSchema.index({ projectId: 1, sha: 1 }, { unique: true });
rawCommitSchema.index({ message: 'text' });

export const RawCommit = mongoose.model('RawCommit', rawCommitSchema);
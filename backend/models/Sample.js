import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Sample', sampleSchema);

const changelogItemSchema = new Schema({
  release: { 
    type: Schema.Types.ObjectId, 
    ref: 'Release', 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Feature', 'Fix', 'Chore', 'Improvement'],
    required: true 
  },
  originalCommitHash: { 
    type: String,
    trim: true
  },
  originalCommitMessage: { 
    type: String 
  }
}, { 
  timestamps: true 
});

export default mongoose.model('ChangeLog', changelogItemSchema);

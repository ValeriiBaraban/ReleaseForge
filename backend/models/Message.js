// import mongoose from 'mongoose';

// const messageSchema = new mongoose.Schema({
//   sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
//   recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
//   content: { type: String, required: false },
//   timestamp: { type: Date, default: Date.now },
// });

// const Message = mongoose.model('Message', messageSchema);

// export default Message;

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } 
);

export default mongoose.model('Message', messageSchema);
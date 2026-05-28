import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { use } from 'react';

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, trim: true },
  avatar: { type: String },
  accessToken: { type: String, select: false },
  email: { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true } 
}, { timestamps: true });

// userSchema.pre('save', async function (next) {
//   try {
//   if (!this.isModified('accessToken') || !this.accessToken) {
//       return next();
//     }
//   } catch (error) {
//     return next(error);
//   }

  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.accessToken = await bcrypt.hash(this.accessToken, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });


const User = mongoose.model('User', userSchema);

export default User;

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { use } from 'react';

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  displayName: { type: String },
  avatar: { type: String },
  accessToken: { type: String },
  email: { type: String, required: false, unique: true } 
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

userSchema.methods.compareAccessToken = async function (accessToken) {
  return await bcrypt.compare(accessToken, this.accessToken);
};

const User = mongoose.model('User', userSchema);

export default User;

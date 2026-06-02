import mongoose from 'mongoose';
import crypto from 'crypto';
import { use } from 'react';

const algorithm = 'aes-256-cbc';

const encrypt = (text) => {
  if (!text) return text;
    const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

const decrypt = (text) => {
  if (!text || !text.includes(':')) return text;
  
    const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
};

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, trim: true },
  avatar: { type: String },
  accessToken: { 
    type: String,
    set: encrypt, 
    get: decrypt  
  },
   email: { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true } 
},
  { timestamps: true },
  { toJSON: { getters: true } },
  { toObject: { getters: true } }
);

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

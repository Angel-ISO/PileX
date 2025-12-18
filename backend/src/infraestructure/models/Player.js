import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bornDate: {
    type: Date,
    required: true
  },
  highScore: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
}, { timestamps: true });


PlayerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    return next(error);
  }

  next();
});


PlayerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const Player = mongoose.model('Player', PlayerSchema);

export default Player;
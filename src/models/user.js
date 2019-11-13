const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"');
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a postive number');
      }
    },
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
});

userSchema.methods.toJSON = function hideProperties() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.tokens;
  delete userObject.password;
  return userObject;
};

userSchema.methods.generateToken = async function generateToken() {
  const user = this;
  // eslint-disable-next-line no-underscore-dangle
  const token = jwt.sign({ _id: user._id.toString() }, 'taskapp');
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredantials = async (email, password) => {
  // eslint-disable-next-line no-use-before-define
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login');
  }
  return user;
};

// eslint-disable-next-line prefer-arrow-callback
userSchema.pre('save', async function hashPassword(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

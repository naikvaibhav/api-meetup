'use strict';
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: '',
    trim: true
  },
  lastName: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    default: '',
    required: true,
    trim: true
  },
  mobileNumber: {
    type: Number,
    default: 0
  },
  userRole: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: '',
    lowercase: true,
    unique: true,
    required: true,
    trim: true
  },
  countryCode: {
    type: String,
    default: ''
  },
  countryName: {
    type: String,
    default: ''
  },
  internationalCode: {
    type: String,
    default: ''
  },
  createdOn: {
    type: Date,
    default: ''
  },
  avatar: {
    type: String,
    default:''
  }
});

mongoose.model('User', userSchema);

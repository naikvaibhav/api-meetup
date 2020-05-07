'use strict';
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let meetingSchema = new Schema({
  meetingId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  purpose: {
    type: String,
    default: '',
    trim: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  userId: {
    type: String,
    required: true
  },
  userDetails: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  color: {
    type: Object
  },
  updateCount: {
    type: Number,
    default: 0
  },
  createdOn: {
    type: Date,
    default: ''
  },
  editedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  editedOn: {
    type: Date
  }
});

mongoose.model('Meeting', meetingSchema);

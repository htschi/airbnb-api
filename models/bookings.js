const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = mongoose.model('bookings', {
  author: {
    type: ObjectId,
    ref: 'users',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  house: {
    type: ObjectId,
    ref: 'houses',
    required: true,
  },
})

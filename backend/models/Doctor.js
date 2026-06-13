import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String, // e.g. "Monday", "Tuesday"
    required: true,
  },
  slots: [
    {
      type: String, // e.g. "09:00 AM - 09:30 AM", "10:00 AM - 10:30 AM"
      required: true,
    },
  ],
});

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    availability: [availabilitySchema],
    profileImage: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups by department and name
doctorSchema.index({ department: 1 });
doctorSchema.index({ name: 'text' });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;

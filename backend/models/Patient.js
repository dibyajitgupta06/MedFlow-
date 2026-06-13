import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const patientSchema = new mongoose.Schema(
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
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: 'O+',
    },
    address: {
      type: String,
      default: '',
    },
    medicalHistory: [
      {
        type: String, // e.g. "Penicillin Allergy", "Diabetes Type 2"
      },
    ],
    profileImage: {
      type: String,
      default: '',
    },
    reports: [reportSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
patientSchema.index({ name: 'text' });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;

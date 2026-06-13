import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';
import { generatePrescriptionPDF } from '../services/pdfService.js';
import { sendEmail, getPrescriptionEmailTemplate } from '../services/emailService.js';

/**
 * @desc    Create a new prescription (Doctor only)
 * @route   POST /api/prescriptions
 * @access  Private/Doctor
 */
export const createPrescription = async (req, res) => {
  const { appointmentId, patientId, diagnosis, medicines, notes } = req.body;

  try {
    // 1. Get Doctor profile
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // 2. Validate Patient exists
    const patient = await Patient.findById(patientId).populate('user', 'email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // 3. Create prescription
    const prescription = await Prescription.create({
      appointment: appointmentId || null,
      patient: patientId,
      doctor: doctor._id,
      diagnosis,
      medicines,
      notes: notes || '',
    });

    // 4. Auto-complete appointment if provided
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: 'completed',
        notes: notes || 'Prescription created.',
      });
    }

    // 5. In-App Notifications
    await Notification.create({
      recipient: patient.user._id,
      title: 'New Prescription Released',
      message: `Dr. ${doctor.name} has written a new prescription for: ${diagnosis}.`,
      type: 'prescription',
    });

    // 6. Nodemailer Notification to Patient
    const emailData = getPrescriptionEmailTemplate(patient.name, doctor.name, diagnosis);
    await sendEmail({
      to: patient.user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: `Hello ${patient.name}, Dr. ${doctor.name} has published a new prescription for: ${diagnosis}. You can download it from your portal.`,
    });

    return res.status(201).json(prescription);
  } catch (error) {
    console.error('Create Prescription Error:', error);
    return res.status(500).json({ message: 'Failed to create prescription' });
  }
};

/**
 * @desc    Get prescriptions (Filtered by role: Patient, Doctor, Admin)
 * @route   GET /api/prescriptions
 * @access  Private
 */
export const getPrescriptions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
      query.doctor = doctor._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name phone gender dob')
      .populate('doctor', 'name specialization phone')
      .sort({ date: -1 });

    return res.json(prescriptions);
  } catch (error) {
    console.error('Get Prescriptions Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve prescriptions' });
  }
};

/**
 * @desc    Get prescription details
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
export const getPrescriptionDetails = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name phone gender dob bloodGroup address')
      .populate('doctor', 'name specialization phone');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Auth validation
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!prescription.patient._id.equals(patient._id)) {
        return res.status(403).json({ message: 'Not authorized to view this prescription' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!prescription.doctor._id.equals(doctor._id)) {
        return res.status(403).json({ message: 'Not authorized to view this prescription' });
      }
    }

    return res.json(prescription);
  } catch (error) {
    console.error('Get Prescription Details Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve prescription details' });
  }
};

/**
 * @desc    Download Prescription PDF
 * @route   GET /api/prescriptions/:id/pdf
 * @access  Private
 */
export const downloadPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name phone gender dob')
      .populate('doctor', 'name specialization phone fees');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Role-based auth verification
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!prescription.patient._id.equals(patient._id)) {
        return res.status(403).json({ message: 'Not authorized to download this prescription' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!prescription.doctor._id.equals(doctor._id)) {
        return res.status(403).json({ message: 'Not authorized to download this prescription' });
      }
    }

    // Set headers for file transfer
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=prescription-${prescription._id.toString().substring(0, 8)}.pdf`
    );

    // Call PDF generation and stream directly to response
    generatePrescriptionPDF(prescription, res);
  } catch (error) {
    console.error('Download PDF Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF prescription' });
  }
};

import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';
import { sendEmail, getAppointmentEmailTemplate } from '../services/emailService.js';

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private/Patient
 */
export const bookAppointment = async (req, res) => {
  const { doctorId, departmentId, date, timeSlot, symptoms, reason } = req.body;

  try {
    // 1. Get patient profile
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // 2. Validate Doctor exists
    const doctor = await Doctor.findById(doctorId).populate('user', 'email');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // 3. Conflict Prevention Check
    const appointmentDate = new Date(date);
    // Reset hours, minutes, seconds to avoid timezone variance mismatches
    appointmentDate.setHours(0, 0, 0, 0);

    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: appointmentDate,
      timeSlot: timeSlot,
      status: { $in: ['pending', 'approved'] },
    });

    if (conflict) {
      return res.status(400).json({
        message: 'This time slot is already booked for this doctor. Please choose another slot or date.',
      });
    }

    // 4. Create appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      department: departmentId,
      date: appointmentDate,
      timeSlot,
      symptoms: symptoms || '',
      reason: reason || '',
      status: 'pending',
    });

    // 5. In-App Notifications
    await Notification.create({
      recipient: patient.user._id,
      title: 'Appointment Booked',
      message: `Your appointment with ${doctor.name} has been booked and is pending approval.`,
      type: 'appointment',
    });

    await Notification.create({
      recipient: doctor.user._id,
      title: 'New Appointment Request',
      message: `Patient ${patient.name} has requested an appointment on ${appointmentDate.toLocaleDateString()} at ${timeSlot}.`,
      type: 'appointment',
    });

    // 6. Nodemailer Notification to Patient
    const emailData = getAppointmentEmailTemplate(
      patient.name,
      doctor.name,
      appointmentDate,
      timeSlot,
      'pending'
    );
    await sendEmail({
      to: patient.user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: `Hello ${patient.name}, your appointment request with ${doctor.name} on ${appointmentDate.toLocaleDateString()} at ${timeSlot} is pending approval.`,
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('Book Appointment Error:', error);
    return res.status(500).json({ message: 'Failed to book appointment' });
  }
};

/**
 * @desc    Get all appointments (Filtered by role: Patient, Doctor, Admin)
 * @route   GET /api/appointments
 * @access  Private
 */
export const getAppointments = async (req, res) => {
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

    const appointments = await Appointment.find(query)
      .populate('patient', 'name phone gender dob')
      .populate('doctor', 'name specialization phone fees')
      .populate('department', 'name')
      .sort({ date: -1, timeSlot: 1 });

    return res.json(appointments);
  } catch (error) {
    console.error('Get Appointments Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve appointments' });
  }
};

/**
 * @desc    Update appointment status (Approve, Complete, Cancel)
 * @route   PUT /api/appointments/:id/status
 * @access  Private (Patient/Doctor/Admin)
 */
export const updateAppointmentStatus = async (req, res) => {
  const { status, notes } = req.body; // 'approved', 'completed', 'cancelled'
  
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Role-based status authorization check
    if (req.user.role === 'patient') {
      // Patients can only cancel their own appointments
      const patient = await Patient.findOne({ user: req.user._id });
      if (!appointment.patient._id.equals(patient._id)) {
        return res.status(403).json({ message: 'Not authorized to modify this appointment' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ message: 'Patients can only cancel appointments' });
      }
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }

    const updatedAppt = await appointment.save();

    // In-App Notification and Emails on change
    const patientUser = appointment.patient.user;
    const doctorUser = appointment.doctor.user;

    await Notification.create({
      recipient: patientUser._id,
      title: `Appointment ${status.toUpperCase()}`,
      message: `Your appointment with ${appointment.doctor.name} has been ${status}.`,
      type: 'appointment',
    });

    await Notification.create({
      recipient: doctorUser._id,
      title: `Appointment ${status.toUpperCase()}`,
      message: `Appointment with patient ${appointment.patient.name} has been ${status}.`,
      type: 'appointment',
    });

    // Send status update email to patient
    const emailData = getAppointmentEmailTemplate(
      appointment.patient.name,
      appointment.doctor.name,
      appointment.date,
      appointment.timeSlot,
      status
    );
    await sendEmail({
      to: patientUser.email,
      subject: emailData.subject,
      html: emailData.html,
      text: `Hello ${appointment.patient.name}, your appointment with ${appointment.doctor.name} has been ${status}.`,
    });

    return res.json(updatedAppt);
  } catch (error) {
    console.error('Update Appointment Status Error:', error);
    return res.status(500).json({ message: 'Failed to update appointment status' });
  }
};

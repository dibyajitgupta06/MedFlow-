import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';

/**
 * @desc    Get all doctors (optionally filter by department)
 * @route   GET /api/doctors
 * @access  Public
 */
export const getDoctors = async (req, res) => {
  const { department } = req.query;

  try {
    const query = { isApproved: true };
    if (department) {
      query.department = department;
    }

    const doctors = await Doctor.find(query)
      .populate('department', 'name icon')
      .select('-availability.slots'); // hide detailed availability times in general listing
    return res.json(doctors);
  } catch (error) {
    console.error('Get Doctors Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve doctors' });
  }
};

/**
 * @desc    Get doctor profile by ID (availability included)
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('department', 'name description');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    return res.json(doctor);
  } catch (error) {
    console.error('Get Doctor Profile Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve doctor profile' });
  }
};

/**
 * @desc    Get dashboard metrics for logged-in doctor
 * @route   GET /api/doctors/dashboard/stats
 * @access  Private/Doctor
 */
export const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const docId = doctor._id;

    // 1. Total Appointments
    const totalAppointments = await Appointment.countDocuments({ doctor: docId });

    // 2. Pending Appointments
    const pendingAppointments = await Appointment.countDocuments({ doctor: docId, status: 'pending' });

    // 3. Approved Appointments (Upcoming)
    const upcomingAppointments = await Appointment.countDocuments({ doctor: docId, status: 'approved' });

    // 4. Unique Patients count
    const uniquePatients = await Appointment.distinct('patient', { doctor: docId });
    const patientCount = uniquePatients.length;

    // 5. Recent Appointments (limit 5)
    const recentAppointments = await Appointment.find({ doctor: docId })
      .populate('patient', 'name phone gender dob')
      .sort({ date: -1 })
      .limit(5);

    return res.json({
      metrics: {
        totalAppointments,
        pendingAppointments,
        upcomingAppointments,
        totalPatients: patientCount,
      },
      recentAppointments,
    });
  } catch (error) {
    console.error('Doctor Dashboard Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve dashboard stats' });
  }
};

/**
 * @desc    Get all patients assigned to this doctor (who booked appointments)
 * @route   GET /api/doctors/dashboard/patients
 * @access  Private/Doctor
 */
export const getAssignedPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const uniquePatientIds = await Appointment.distinct('patient', { doctor: doctor._id });
    const patients = await Patient.find({ _id: { $in: uniquePatientIds } });
    
    return res.json(patients);
  } catch (error) {
    console.error('Get Assigned Patients Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve patients' });
  }
};

/**
 * @desc    Get a specific patient's medical history (clinical records view)
 * @route   GET /api/doctors/patients/:id/history
 * @access  Private/Doctor
 */
export const getPatientMedicalHistory = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId).populate('user', 'email');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Fetch all prescriptions and appointments for this patient
    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });

    return res.json({
      patient,
      appointments,
      prescriptions,
    });
  } catch (error) {
    console.error('Get Patient History Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve patient medical history' });
  }
};

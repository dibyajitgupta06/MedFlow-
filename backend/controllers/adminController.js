import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Department from '../models/Department.js';

/**
 * @desc    Get Admin Dashboard metrics & charts
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({});
    const totalDoctors = await Doctor.countDocuments({});
    const totalDepartments = await Department.countDocuments({});
    
    // Revenue calculations (completed appointment fees sum)
    const completedAppointments = await Appointment.find({ status: 'completed' }).populate('doctor', 'fees');
    const totalRevenue = completedAppointments.reduce((sum, appt) => sum + (appt.doctor?.fees || 0), 0);

    // Appointment counts by status
    const pendingCount = await Appointment.countDocuments({ status: 'pending' });
    const approvedCount = await Appointment.countDocuments({ status: 'approved' });
    const completedCount = completedAppointments.length;
    const cancelledCount = await Appointment.countDocuments({ status: 'cancelled' });

    // 1. Department Statistics (Doctor count & Appointment count per department)
    const departments = await Department.find({});
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({ department: dept._id });
        const appointmentCount = await Appointment.countDocuments({ department: dept._id });
        return {
          name: dept.name,
          doctors: doctorCount,
          appointments: appointmentCount,
        };
      })
    );

    // 2. Appointments Per Month (Last 6 months)
    // We group by month and return array for Recharts
    const appointments = await Appointment.find({});
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyStatsMap = {};
    // Seed last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyStatsMap[key] = { month: key, appointments: 0, revenue: 0 };
    }

    // Populate actuals
    for (const appt of appointments) {
      const date = new Date(appt.date);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
      if (monthlyStatsMap[key]) {
        monthlyStatsMap[key].appointments += 1;
        if (appt.status === 'completed') {
          // fetch doctor fees
          const doctor = await Doctor.findById(appt.doctor).select('fees');
          monthlyStatsMap[key].revenue += doctor ? doctor.fees : 0;
        }
      }
    }

    const monthlyStats = Object.values(monthlyStatsMap);

    // 3. Doctor Workload (Name & Appointments count)
    const doctors = await Doctor.find({});
    const doctorWorkload = await Promise.all(
      doctors.map(async (doc) => {
        const appointmentCount = await Appointment.countDocuments({ doctor: doc._id });
        return {
          name: doc.name,
          specialization: doc.specialization,
          appointments: appointmentCount,
        };
      })
    );

    return res.json({
      summary: {
        totalPatients,
        totalDoctors,
        totalDepartments,
        totalRevenue,
        statusCounts: {
          pending: pendingCount,
          approved: approvedCount,
          completed: completedCount,
          cancelled: cancelledCount,
        },
      },
      departmentStats,
      monthlyStats,
      doctorWorkload,
    });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve admin dashboard stats' });
  }
};

/**
 * @desc    Create a new Doctor Account (User + Profile)
 * @route   POST /api/admin/doctors
 * @access  Private/Admin
 */
export const createDoctor = async (req, res) => {
  const { email, password, name, phone, specialization, department, experience, fees, bio, availability } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // 1. Create auth user
    const user = await User.create({
      email,
      password,
      role: 'doctor',
    });

    // 2. Create Doctor profile linked to user
    const doctor = await Doctor.create({
      user: user._id,
      name,
      phone,
      specialization,
      department,
      experience: parseInt(experience),
      fees: parseFloat(fees),
      bio: bio || '',
      availability: availability || [],
    });

    return res.status(201).json(doctor);
  } catch (error) {
    console.error('Create Doctor Error:', error);
    return res.status(500).json({ message: 'Failed to create doctor account' });
  }
};

/**
 * @desc    Update a Doctor Profile
 * @route   PUT /api/admin/doctors/:id
 * @access  Private/Admin
 */
export const updateDoctor = async (req, res) => {
  const { name, phone, specialization, department, experience, fees, bio, availability, isApproved } = req.body;

  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.name = name || doctor.name;
    doctor.phone = phone || doctor.phone;
    doctor.specialization = specialization || doctor.specialization;
    doctor.department = department || doctor.department;
    doctor.experience = experience !== undefined ? parseInt(experience) : doctor.experience;
    doctor.fees = fees !== undefined ? parseFloat(fees) : doctor.fees;
    doctor.bio = bio !== undefined ? bio : doctor.bio;
    doctor.availability = availability || doctor.availability;
    doctor.isApproved = isApproved !== undefined ? isApproved : doctor.isApproved;

    const updatedDoctor = await doctor.save();
    return res.json(updatedDoctor);
  } catch (error) {
    console.error('Update Doctor Error:', error);
    return res.status(500).json({ message: 'Failed to update doctor profile' });
  }
};

/**
 * @desc    Delete a Doctor (Removes Doctor + User)
 * @route   DELETE /api/admin/doctors/:id
 * @access  Private/Admin
 */
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if there are active appointments
    const activeAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      status: { $in: ['pending', 'approved'] },
    });
    if (activeAppointments > 0) {
      return res.status(400).json({
        message: 'Cannot delete doctor. There are pending/approved appointments scheduled.',
      });
    }

    // Delete associated User
    await User.findByIdAndDelete(doctor.user);
    // Delete Doctor profile
    await Doctor.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Doctor account and profile deleted successfully' });
  } catch (error) {
    console.error('Delete Doctor Error:', error);
    return res.status(500).json({ message: 'Failed to delete doctor' });
  }
};

/**
 * @desc    Get all patients list
 * @route   GET /api/admin/patients
 * @access  Private/Admin
 */
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).populate('user', 'email');
    return res.json(patients);
  } catch (error) {
    console.error('Admin Get Patients Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve patients list' });
  }
};

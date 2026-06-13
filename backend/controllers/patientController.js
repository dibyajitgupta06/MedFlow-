import Patient from '../models/Patient.js';

/**
 * @desc    Get patient profile (self)
 * @route   GET /api/patients/profile
 * @access  Private/Patient
 */
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    return res.json(patient);
  } catch (error) {
    console.error('Get Patient Profile Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve profile' });
  }
};

/**
 * @desc    Update patient profile (self)
 * @route   PUT /api/patients/profile
 * @access  Private/Patient
 */
export const updatePatientProfile = async (req, res) => {
  const { name, phone, gender, dob, bloodGroup, address, medicalHistory } = req.body;

  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    patient.name = name || patient.name;
    patient.phone = phone || patient.phone;
    patient.gender = gender || patient.gender;
    patient.dob = dob ? new Date(dob) : patient.dob;
    patient.bloodGroup = bloodGroup || patient.bloodGroup;
    patient.address = address !== undefined ? address : patient.address;
    
    if (medicalHistory && Array.isArray(medicalHistory)) {
      patient.medicalHistory = medicalHistory;
    }

    const updatedPatient = await patient.save();
    return res.json(updatedPatient);
  } catch (error) {
    console.error('Update Patient Profile Error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

/**
 * @desc    Upload a medical report for patient (self)
 * @route   POST /api/patients/reports
 * @access  Private/Patient
 */
export const uploadReport = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file to upload' });
    }

    const reportName = req.body.name || req.file.originalname;
    
    // Store relative path so it's deployable/serving staticly
    const fileUrl = `/uploads/${req.file.filename}`;

    const report = {
      name: reportName,
      fileUrl: fileUrl,
      uploadedAt: new Date(),
    };

    patient.reports.push(report);
    await patient.save();

    return res.status(201).json({
      message: 'Report uploaded successfully',
      reports: patient.reports,
    });
  } catch (error) {
    console.error('Report Upload Error:', error);
    return res.status(500).json({ message: 'Failed to upload report' });
  }
};

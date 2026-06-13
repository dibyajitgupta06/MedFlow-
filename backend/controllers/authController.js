import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medflow_secret_key', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new patient
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  const { email, password, name, phone, gender, dob, bloodGroup, address } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 1. Create authentication user
    const user = await User.create({
      email,
      password,
      role: 'patient',
    });

    // 2. Create patient profile linked to user
    const patient = await Patient.create({
      user: user._id,
      name,
      phone,
      gender,
      dob: new Date(dob),
      bloodGroup: bloodGroup || 'O+',
      address: address || '',
    });

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token,
      profile: patient,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Registration failed, server error' });
  }
};

/**
 * @desc    Login user (Admin, Doctor, Patient)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Retrieve role-based profile
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ user: user._id }).populate('department', 'name');
    }

    // Generate token
    const token = generateToken(user._id);

    return res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token,
      profile,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Login failed, server error' });
  }
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ user: user._id }).populate('department', 'name');
    }

    return res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

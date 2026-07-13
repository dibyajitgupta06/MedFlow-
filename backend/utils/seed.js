import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    // 1. Connect to DB
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Department.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();
    await Notification.deleteMany();

    console.log('Seeding departments...');
    const depts = await Department.create([
      { name: 'Cardiology', description: 'Heart health and cardiovascular system care', icon: 'Heart' },
      { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents', icon: 'Baby' },
      { name: 'Dermatology', description: 'Skin, hair, nail health and treatments', icon: 'Sparkles' },
      { name: 'Neurology', description: 'Brain, spinal cord, and nervous system disorders', icon: 'Brain' },
      { name: 'General Medicine', description: 'Comprehensive primary healthcare and diagnostics', icon: 'Activity' },
      { name: 'Orthopedics', description: 'Musculoskeletal system, bones, and joints care', icon: 'Accessibility' },
    ]);

    const cardiology = depts[0]._id;
    const pediatrics = depts[1]._id;
    const neurology = depts[3]._id;
    const generalMedicine = depts[4]._id;

    console.log('Seeding users...');
    // Create Admin
    const adminUser = await User.create({
      email: 'admin@medflow.com',
      password: '1234',
      role: 'admin',
    });

    // Create Doctors
    const docUser1 = await User.create({ email: 'iqbal.karim@medflow.com', password: '1234', role: 'doctor' });
    const docUser2 = await User.create({ email: 'samiur.rahman@medflow.com', password: '1234', role: 'doctor' });
    const docUser3 = await User.create({ email: 'rahim.uddin@medflow.com', password: '1234', role: 'doctor' });
    const docUser4 = await User.create({ email: 'dilruba.karim@medflow.com', password: '1234', role: 'doctor' });

    // Create Patients
    const patientUser1 = await User.create({ email: 'jamil.karim@gmail.com', password: '1234', role: 'patient' });
    const patientUser2 = await User.create({ email: 'jahanara.rahim@gmail.com', password: '1234', role: 'patient' });

    console.log('Seeding profiles...');
    // Doctor Profiles
    const doc1 = await Doctor.create({
      user: docUser1._id,
      name: 'Dr. Iqbal Karim',
      phone: '+880 1711-000101',
      specialization: 'Cardiologist',
      department: cardiology,
      experience: 12,
      fees: 1200,
      bio: 'Expert in interventional cardiology and preventative heart care with extensive experience in Dhaka.',
      availability: [
        { day: 'Monday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM'] },
        { day: 'Wednesday', slots: ['02:00 PM - 02:30 PM', '03:00 PM - 03:30 PM', '04:00 PM - 04:30 PM'] },
      ],
    });

    const doc2 = await Doctor.create({
      user: docUser2._id,
      name: 'Dr. Samiur Rahman',
      phone: '+880 1819-000102',
      specialization: 'Pediatrician',
      department: pediatrics,
      experience: 8,
      fees: 800,
      bio: 'Dedicated to providing comprehensive developmental and clinical pediatric services to children.',
      availability: [
        { day: 'Tuesday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
        { day: 'Thursday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '02:00 PM - 02:30 PM'] },
      ],
    });

    const doc3 = await Doctor.create({
      user: docUser3._id,
      name: 'Dr. Rahim Uddin',
      phone: '+880 1911-000103',
      specialization: 'Neurologist',
      department: neurology,
      experience: 15,
      fees: 1500,
      bio: 'Specialist in cognitive disorders, neuromuscular issues, and sleep medicine in Bangladesh.',
      availability: [
        { day: 'Monday', slots: ['01:00 PM - 01:30 PM', '02:00 PM - 02:30 PM'] },
        { day: 'Friday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
      ],
    });

    const doc4 = await Doctor.create({
      user: docUser4._id,
      name: 'Dr. Dilruba Karim',
      phone: '+880 1552-000104',
      specialization: 'General Practitioner',
      department: generalMedicine,
      experience: 6,
      fees: 600,
      bio: 'Family physician passionate about holistic primary care and family medicine.',
      availability: [
        { day: 'Monday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
        { day: 'Tuesday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
        { day: 'Wednesday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
        { day: 'Thursday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
        { day: 'Friday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
      ],
    });

    // Patient Profiles
    const patient1 = await Patient.create({
      user: patientUser1._id,
      name: 'Jamil Karim',
      phone: '+880 1819-123456',
      gender: 'male',
      dob: new Date('1990-05-15'),
      bloodGroup: 'O+',
      address: 'House 45, Road 12, Dhanmondi, Dhaka',
      medicalHistory: ['Hypertension', 'Dust Allergy'],
    });

    const patient2 = await Patient.create({
      user: patientUser2._id,
      name: 'Jahanara Rahim',
      phone: '+880 1911-987654',
      gender: 'female',
      dob: new Date('1995-10-22'),
      bloodGroup: 'A-',
      address: 'Flat 3B, Sector 4, Uttara, Dhaka',
      medicalHistory: ['Asthma'],
    });

    console.log('Seeding appointments...');
    // Create a Completed Appointment (Past)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const apptCompleted = await Appointment.create({
      patient: patient1._id,
      doctor: doc4._id,
      department: generalMedicine,
      date: pastDate,
      timeSlot: '09:00 AM - 09:30 AM',
      status: 'completed',
      symptoms: 'Mild fever, sore throat, cough',
      reason: 'General checkup',
      notes: 'Patient was advised rest and fluids. Prescription written.',
    });

    // Create a Prescription for the completed appointment
    await Prescription.create({
      appointment: apptCompleted._id,
      patient: patient1._id,
      doctor: doc4._id,
      date: pastDate,
      diagnosis: 'Acute Pharyngitis',
      medicines: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'Three times daily', duration: '3 days' },
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' },
        { name: 'Cough Syrup', dosage: '10ml', frequency: 'Before bedtime', duration: '5 days' },
      ],
      notes: 'Drink plenty of warm water. Avoid cold drinks. Review if fever persists beyond 3 days.',
    });

    // Create an Approved Future Appointment
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 2);
    await Appointment.create({
      patient: patient1._id,
      doctor: doc1._id,
      department: cardiology,
      date: futureDate1,
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'approved',
      symptoms: 'Occasional chest tightness during heavy exercise',
      reason: 'Cardiology consultation',
    });

    // Create a Pending Appointment
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 3);
    await Appointment.create({
      patient: patient2._id,
      doctor: doc2._id,
      department: pediatrics,
      date: futureDate2,
      timeSlot: '09:00 AM - 09:30 AM',
      status: 'pending',
      symptoms: 'Routine growth monitoring and immunization check',
      reason: 'Pediatric checkup',
    });

    console.log('Data successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

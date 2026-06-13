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
      password: 'admin123',
      role: 'admin',
    });

    // Create Doctors
    const docUser1 = await User.create({ email: 'alice.smith@medflow.com', password: 'doctor123', role: 'doctor' });
    const docUser2 = await User.create({ email: 'bob.johnson@medflow.com', password: 'doctor123', role: 'doctor' });
    const docUser3 = await User.create({ email: 'charlie.brown@medflow.com', password: 'doctor123', role: 'doctor' });
    const docUser4 = await User.create({ email: 'diana.prince@medflow.com', password: 'doctor123', role: 'doctor' });

    // Create Patients
    const patientUser1 = await User.create({ email: 'john.doe@gmail.com', password: 'patient123', role: 'patient' });
    const patientUser2 = await User.create({ email: 'jane.smith@gmail.com', password: 'patient123', role: 'patient' });

    console.log('Seeding profiles...');
    // Doctor Profiles
    const doc1 = await Doctor.create({
      user: docUser1._id,
      name: 'Dr. Alice Smith',
      phone: '+1 555-0101',
      specialization: 'Cardiologist',
      department: cardiology,
      experience: 12,
      fees: 150,
      bio: 'Expert in interventional cardiology and preventative heart care.',
      availability: [
        { day: 'Monday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM'] },
        { day: 'Wednesday', slots: ['02:00 PM - 02:30 PM', '03:00 PM - 03:30 PM', '04:00 PM - 04:30 PM'] },
      ],
    });

    const doc2 = await Doctor.create({
      user: docUser2._id,
      name: 'Dr. Bob Johnson',
      phone: '+1 555-0102',
      specialization: 'Pediatrician',
      department: pediatrics,
      experience: 8,
      fees: 100,
      bio: 'Dedicated to providing comprehensive developmental and clinical pediatric services.',
      availability: [
        { day: 'Tuesday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
        { day: 'Thursday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '02:00 PM - 02:30 PM'] },
      ],
    });

    const doc3 = await Doctor.create({
      user: docUser3._id,
      name: 'Dr. Charlie Brown',
      phone: '+1 555-0103',
      specialization: 'Neurologist',
      department: neurology,
      experience: 15,
      fees: 200,
      bio: 'Specialist in cognitive disorders, neuromuscular issues, and sleep medicine.',
      availability: [
        { day: 'Monday', slots: ['01:00 PM - 01:30 PM', '02:00 PM - 02:30 PM'] },
        { day: 'Friday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
      ],
    });

    const doc4 = await Doctor.create({
      user: docUser4._id,
      name: 'Dr. Diana Prince',
      phone: '+1 555-0104',
      specialization: 'General Practitioner',
      department: generalMedicine,
      experience: 6,
      fees: 80,
      bio: 'Family physician passionate about holistic primary care and lifestyle medicine.',
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
      name: 'John Doe',
      phone: '+1 555-0201',
      gender: 'male',
      dob: new Date('1990-05-15'),
      bloodGroup: 'O+',
      address: '123 Main Street, New York, NY',
      medicalHistory: ['Hypertension', 'Dust Allergy'],
    });

    const patient2 = await Patient.create({
      user: patientUser2._id,
      name: 'Jane Smith',
      phone: '+1 555-0202',
      gender: 'female',
      dob: new Date('1995-10-22'),
      bloodGroup: 'A-',
      address: '456 Elm Street, Chicago, IL',
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

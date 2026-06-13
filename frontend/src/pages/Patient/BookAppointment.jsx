import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartments, getDoctors, getAppointments, bookAppointment } from '../../services/api.js';
import { Calendar, User, Layers, Clock, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // Form State
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [reason, setReason] = useState('');

  // UI States
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [deptRes, docRes, apptRes] = await Promise.all([
          getDepartments(),
          getDoctors(),
          getAppointments(),
        ]);
        setDepartments(deptRes.data);
        setDoctors(docRes.data);
        setAppointments(apptRes.data);
      } catch (err) {
        toast.error('Failed to load scheduling directory.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Filter doctors based on selected department
  const filteredDoctors = selectedDept
    ? doctors.filter((doc) => doc.department?._id === selectedDept)
    : doctors;

  // Selected doctor object details
  const doctorDetails = doctors.find((doc) => doc._id === selectedDoc);

  // Dynamic slot availability calculation
  // Returns list of slots from the doctor's availability for the day of the week,
  // excluding any slots that have already been booked on that specific date!
  const getAvailableSlots = () => {
    if (!doctorDetails || !bookingDate) return [];

    const dateObj = new Date(bookingDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[dateObj.getDay()];

    // Find availability for the selected day
    const dayAvailability = doctorDetails.availability?.find(
      (avail) => avail.day.toLowerCase() === selectedDayName.toLowerCase()
    );

    if (!dayAvailability) return [];

    // Find slots that are already booked for this doctor on this date
    // We compare strings by clearing hour parameters
    const checkDateString = dateObj.toDateString();
    
    // Filter matching appointments in DB (only pending or approved status represent blocks)
    const blockedSlots = appointments
      .filter((appt) => {
        return (
          appt.doctor?._id === selectedDoc &&
          new Date(appt.date).toDateString() === checkDateString &&
          (appt.status === 'pending' || appt.status === 'approved')
        );
      })
      .map((appt) => appt.timeSlot);

    // Filter out blocked slots from available ones
    return dayAvailability.slots.filter((slot) => !blockedSlots.includes(slot));
  };

  const availableSlots = getAvailableSlots();

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !selectedDept || !bookingDate || !selectedSlot) {
      toast.error('Please complete all scheduling fields.');
      return;
    }

    setBookingLoading(true);
    try {
      await bookAppointment({
        doctorId: selectedDoc,
        departmentId: selectedDept,
        date: bookingDate,
        timeSlot: selectedSlot,
        symptoms,
        reason,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient'); // Redirect to dashboard
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Get minimum date (today) for date picker
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Book Clinic Consultation</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete the form below to book a conflict-free appointment with our specialized medical team.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleBooking} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Department */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Layers className="h-4 w-4 text-teal-500" />
                Select Department
              </label>
              <select
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedDoc(''); // Reset doctor
                  setSelectedSlot('');
                }}
              >
                <option value="">-- Choose Department --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <User className="h-4 w-4 text-teal-500" />
                Select Doctor
              </label>
              <select
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={selectedDoc}
                disabled={!selectedDept}
                onChange={(e) => {
                  setSelectedDoc(e.target.value);
                  setSelectedSlot(''); // Reset slot
                }}
              >
                <option value="">-- Choose Doctor --</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization} - ${doc.fees})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-teal-500" />
                Appointment Date
              </label>
              <input
                type="date"
                required
                min={todayStr}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={bookingDate}
                disabled={!selectedDoc}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  setSelectedSlot(''); // Reset slot
                }}
              />
            </div>

            {/* Slot Picker */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Clock className="h-4 w-4 text-teal-500" />
                Available Slots
              </label>
              <select
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={selectedSlot}
                disabled={!bookingDate || availableSlots.length === 0}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                {!bookingDate ? (
                  <option value="">-- Select Date First --</option>
                ) : availableSlots.length === 0 ? (
                  <option value="">No Slots Available (Doctor Offline/Fully Booked)</option>
                ) : (
                  <>
                    <option value="">-- Choose Slot --</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Symptoms */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Describe Symptoms</label>
              <textarea
                rows="2"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                placeholder="e.g. Mild headache, sore throat for 3 days"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            </div>

            {/* Reason */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason for Visit</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                placeholder="e.g. Routine follow-up, physical exam"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

          </div>

          {doctorDetails && (
            <div className="rounded-lg bg-teal-500/[0.03] border border-teal-500/10 p-4 flex gap-3 dark:bg-teal-950/10">
              <AlertCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <p><strong>Consultation Fees:</strong> ${doctorDetails.fees}</p>
                <p><strong>Location:</strong> MedFlow Clinic Central Wing, 2nd Floor</p>
                <p>Payments are handled during clinical check-in.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/patient')}
              className="rounded-xl border border-slate-200 hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold dark:border-slate-800 dark:hover:bg-slate-900 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading || !selectedSlot}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {bookingLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Book Consultation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;

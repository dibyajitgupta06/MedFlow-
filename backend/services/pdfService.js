import PDFDocument from 'pdfkit';

/**
 * Generate a PDF prescription and pipe it to the output stream.
 */
export const generatePrescriptionPDF = (prescription, stream) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe to the given stream (e.g. res)
  doc.pipe(stream);

  // Colors
  const darkBlue = '#0f172a';
  const teal = '#0d9488';
  const slateText = '#475569';
  const borderLight = '#cbd5e1';

  // 1. Header Banner
  doc
    .rect(0, 0, 595.28, 110)
    .fill(darkBlue);

  doc
    .fillColor('#ffffff')
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('MEDFLOW HEALTHCARE', 50, 30);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Modern Healthcare Management Systems', 50, 65)
    .text('Emergency: +1 (555) 0199 | support@medflow.com', 50, 80);

  // 2. Clinic Stamp / Right Align Header
  doc
    .fillColor('#ffffff')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('OFFICIAL RX PRESCRIPTION', 400, 30, { align: 'right', width: 145 })
    .fontSize(9)
    .font('Helvetica')
    .text(`Date: ${new Date(prescription.date).toLocaleDateString()}`, 400, 50, { align: 'right', width: 145 })
    .text(`RX ID: ${prescription._id.toString().substring(0, 8).toUpperCase()}`, 400, 65, { align: 'right', width: 145 });

  // Move down to content
  doc.y = 130;

  // 3. Grid for Patient and Doctor Info
  doc
    .fillColor(darkBlue)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('DOCTOR DETAILS', 50, 130)
    .text('PATIENT DETAILS', 320, 130);

  // Horizontal separator line
  doc
    .moveTo(50, 148)
    .lineTo(545, 148)
    .strokeColor(teal)
    .lineWidth(2)
    .stroke();

  // Info details
  doc
    .fillColor(slateText)
    .fontSize(10)
    .font('Helvetica')
    // Doctor Details
    .text(`Name: ${prescription.doctor.name}`, 50, 160)
    .text(`Specialty: ${prescription.doctor.specialization}`, 50, 175)
    .text(`Phone: ${prescription.doctor.phone}`, 50, 190)
    // Patient Details
    .text(`Name: ${prescription.patient.name}`, 320, 160)
    .text(`Gender / Age: ${prescription.patient.gender} / ${calculateAge(prescription.patient.dob)} yrs`, 320, 175)
    .text(`Phone: ${prescription.patient.phone}`, 320, 190);

  // Move down to Diagnosis
  doc.y = 220;

  doc
    .fillColor(darkBlue)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('DIAGNOSIS:', 50, 220)
    .fillColor('#000000')
    .fontSize(11)
    .font('Helvetica-Oblique')
    .text(prescription.diagnosis, 135, 221);

  // Horizontal divider
  doc
    .moveTo(50, 240)
    .lineTo(545, 240)
    .strokeColor(borderLight)
    .lineWidth(1)
    .stroke();

  // 4. Medicines Table Header
  const tableTop = 260;
  doc
    .fillColor(darkBlue)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('MEDICATIONS PRESCRIBED (Rx)', 50, tableTop);

  // Table Headers
  const itemTop = tableTop + 25;
  doc
    .fontSize(10)
    .fillColor(teal)
    .text('Medicine Name', 50, itemTop)
    .text('Dosage', 220, itemTop)
    .text('Frequency', 320, itemTop)
    .text('Duration', 450, itemTop);

  // Header bottom border
  doc
    .moveTo(50, itemTop + 15)
    .lineTo(545, itemTop + 15)
    .strokeColor(teal)
    .lineWidth(1)
    .stroke();

  // Print Medications
  let currentY = itemTop + 25;
  prescription.medicines.forEach((med, idx) => {
    // Check page height limit, add new page if needed
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }

    doc
      .fillColor(slateText)
      .font('Helvetica-Bold')
      .text(`${idx + 1}. ${med.name}`, 50, currentY)
      .font('Helvetica')
      .text(med.dosage, 220, currentY)
      .text(med.frequency, 320, currentY)
      .text(med.duration, 450, currentY);

    // Row separator
    doc
      .moveTo(50, currentY + 18)
      .lineTo(545, currentY + 18)
      .strokeColor(borderLight)
      .lineWidth(0.5)
      .stroke();

    currentY += 28;
  });

  // 5. Notes Section
  currentY += 15;
  if (prescription.notes) {
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }

    doc
      .fillColor(darkBlue)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('INSTRUCTIONS / CLINICAL NOTES:', 50, currentY);

    doc
      .fillColor(slateText)
      .fontSize(10)
      .font('Helvetica')
      .text(prescription.notes, 50, currentY + 20, { width: 495, align: 'justify', lineGap: 4 });
  }

  // 6. Footer Signature Line
  const footerY = 700;
  doc
    .moveTo(350, footerY)
    .lineTo(520, footerY)
    .strokeColor(darkBlue)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(darkBlue)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Dr. ' + prescription.doctor.name.split(' ').slice(1).join(' '), 350, footerY + 5, { align: 'center', width: 170 })
    .fillColor(slateText)
    .fontSize(8)
    .font('Helvetica')
    .text('Authorized Digital Signature', 350, footerY + 18, { align: 'center', width: 170 });

  // Finalize document
  doc.end();
};

function calculateAge(dobString) {
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

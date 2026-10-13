// Client-Side Clinical Health Summary Generator (jsPDF)
// Branded Credit: "Created by Aryan More"
// Fresh design: Forest Teal & Mint theme with clean typography
// Lead Architect: Aryan More

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserProfile, WeightLog, BloodPressureLog, BloodGlucoseLog, Medication } from '../types/health';
import { calculateBMI } from './clinicalCalculators';

interface HealthReportData {
  profile: UserProfile | null;
  latestWeight: WeightLog | null;
  latestBP: BloodPressureLog | null;
  latestGlucose: BloodGlucoseLog | null;
  todaySteps: number;
  todayWaterGlasses: number;
  medications: Medication[];
  adherenceRate: number;
}

export function generateHealthSummaryPDF(data: HealthReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Header Banner: Elegant Deep Forest Teal (#0B343B)
  doc.setFillColor(11, 52, 59); // #0B343B
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CareNova', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Personal Health Companion — Patient Health Summary', 14, 25);

  doc.setFontSize(9);
  doc.text(`Report Date: ${today}`, pageWidth - 14, 18, { align: 'right' });
  doc.text('Lead Architect & Creator: Aryan More', pageWidth - 14, 25, { align: 'right' });

  // Demographics Section
  let currentY = 46;
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Patient Information & Baseline Health', 14, currentY);

  const name = data.profile?.full_name || 'Patient';
  const age = data.profile?.age ? `${data.profile.age} years` : 'Not recorded';
  const gender = data.profile?.gender || 'Not specified';
  const bloodGroup = data.profile?.blood_group || 'Not recorded';
  const height = data.profile?.height ? `${data.profile.height} cm` : 'Not recorded';
  const weight = data.latestWeight ? `${data.latestWeight.weight} kg` : data.profile?.weight ? `${data.profile.weight} kg` : 'Not recorded';
  const bmiCalc = data.profile?.height && data.latestWeight ? calculateBMI(data.latestWeight.weight, data.profile.height) : null;
  const bmiStr = bmiCalc ? `${bmiCalc.bmi} (${bmiCalc.category})` : 'N/A';

  const demoRows = [
    ['Full Name', name, 'Age / Sex', `${age} / ${gender}`],
    ['Blood Group', bloodGroup, 'Height', height],
    ['Current Weight', weight, 'Body Mass Index (BMI)', bmiStr],
    ['Known Allergies', data.profile?.allergies || 'None reported', 'Emergency Contact', data.profile?.emergency_contact_phone || 'None recorded'],
  ];

  autoTable(doc, {
    startY: currentY + 3,
    head: [],
    body: demoRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5, textColor: [36, 39, 44] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 247, 244], cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', fillColor: [248, 247, 244], cellWidth: 40 },
      3: { cellWidth: 50 },
    },
    margin: { left: 14, right: 14 },
  });

  // Recent Health Readings Table
  currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Recent Vital Health Readings', 14, currentY);

  const bpVal = data.latestBP ? `${data.latestBP.systolic}/${data.latestBP.diastolic} mmHg (${data.latestBP.category || 'Normal'})` : 'No reading';
  const glucoseVal = data.latestGlucose ? `${data.latestGlucose.glucose_mg_dl} mg/dL (${data.latestGlucose.timing || 'Fasting'})` : 'No reading';
  const waterVal = `${data.todayWaterGlasses} Glasses (~${data.todayWaterGlasses * 250} ml)`;
  const stepsVal = `${data.todaySteps.toLocaleString()} steps`;

  const vitalsRows = [
    ['Blood Pressure (Resting)', bpVal, 'Blood Sugar Level', glucoseVal],
    ['Water Intake Today', waterVal, 'Steps Walked Today', stepsVal],
  ];

  autoTable(doc, {
    startY: currentY + 3,
    head: [],
    body: vitalsRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5, textColor: [36, 39, 44] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 247, 244], cellWidth: 45 },
      1: { cellWidth: 45 },
      2: { fontStyle: 'bold', fillColor: [248, 247, 244], cellWidth: 45 },
      3: { cellWidth: 45 },
    },
    margin: { left: 14, right: 14 },
  });

  // Active Prescriptions Table
  currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`3. Current Medicines & Schedule (Compliance Score: ${data.adherenceRate}%)`, 14, currentY);

  const medHeaders = [['Medicine Name', 'Strength / Dose', 'Frequency', 'Scheduled Time', 'Special Instructions']];
  const medRows = data.medications.length > 0
    ? data.medications.map((m) => [
        m.name,
        m.dosage,
        m.frequency,
        m.reminder_time || 'As directed',
        m.instructions || 'Standard usage',
      ])
    : [['No active medications recorded', '—', '—', '—', '—']];

  autoTable(doc, {
    startY: currentY + 3,
    head: medHeaders,
    body: medRows,
    theme: 'striped',
    headStyles: { fillColor: [22, 139, 131], textColor: [255, 255, 255], fontStyle: 'bold' }, // Primary Teal (#168B83)
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  // Footer Disclaimer
  currentY = (doc as any).lastAutoTable.finalY + 12;
  doc.setDrawColor(220, 216, 207);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(110, 115, 125);
  doc.text(
    'Medical Note: This summary is generated by CareNova for personal health records and review during clinical appointments. It is not an automated medical diagnosis. In case of an emergency, immediately call 112 or 108.',
    14,
    currentY,
    { maxWidth: pageWidth - 28 }
  );

  currentY += 12;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 139, 131); // Primary Teal (#168B83)
  doc.text('CareNova — Your Personal Health Companion • Created by Aryan More', pageWidth / 2, currentY, { align: 'center' });

  // Download File
  const fileName = `CareNova_Health_Summary_${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

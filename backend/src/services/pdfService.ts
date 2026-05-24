import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IQuestionPaper } from '../models/Assignment';

export const generatePDF = async (
  assignmentId: string,
  paper: IQuestionPaper
): Promise<string> => {
  const publicDir = path.join(__dirname, '..', '..', 'public', 'pdfs');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const pdfPath = path.join(publicDir, `${assignmentId}.pdf`);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Helper to draw horizontal divider line
  const drawLine = () => {
    doc.moveDown(0.5);
    doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.x = 40;
  };

  // Helper to draw clean double divider lines below headers
  const drawDoubleLine = () => {
    doc.moveDown(0.5);
    const currentY = doc.y;
    doc.strokeColor('#333333').lineWidth(1.5).moveTo(40, currentY).lineTo(555, currentY).stroke();
    doc.strokeColor('#333333').lineWidth(0.5).moveTo(40, currentY + 3).lineTo(555, currentY + 3).stroke();
    doc.y = currentY + 10;
    doc.x = 40;
  };

  // Calculate total marks dynamically from questions
  let totalMarks = 0;
  for (const sec of paper.sections) {
    for (const q of sec.questions) {
      totalMarks += q.marks;
    }
  }

  // Header Title details
  doc.font('Helvetica-Bold').fontSize(16).text(paper.schoolName, 40, doc.y, { align: 'center', width: 515 });
  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').fontSize(12).text(`Subject: ${paper.subject}`, 40, doc.y, { align: 'center', width: 515 });
  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').fontSize(12).text(paper.gradeClass, 40, doc.y, { align: 'center', width: 515 });
  doc.moveDown(1);

  // Time Allowed & Marks Allowed row
  const startY = doc.y;
  doc.font('Helvetica').fontSize(10).text(`Time Allowed: ${paper.timeAllowedMinutes} minutes`, 40, startY, { width: 250 });
  doc.font('Helvetica-Bold').fontSize(10).text(`Maximum Marks: ${totalMarks}`, 40, startY, {
    align: 'right',
    width: 515
  });
  doc.moveDown(1.5);

  // Student details section (side-by-side columns matching professional exams)
  const studentInfoY = doc.y;
  doc.font('Helvetica').fontSize(10).text('Student Name: ___________________________', 40, studentInfoY, { width: 250 });
  doc.text('Roll Number: _____________________', 300, studentInfoY, { width: 250 });
  doc.moveDown(1.2);
  
  const studentInfoY2 = doc.y;
  doc.text(`Class/Grade: ${paper.gradeClass}`, 40, studentInfoY2, { width: 250 });
  doc.text('Section: _________________________', 300, studentInfoY2, { width: 250 });
  doc.moveDown(1.5);

  drawDoubleLine();

  // Instructions Note
  doc.font('Helvetica-Oblique').fontSize(10).text('All questions are compulsory unless stated otherwise.', 40, doc.y, { width: 515 });
  doc.moveDown(1);
  doc.x = 40;

  // Questions render
  let questionNumber = 1;
  for (const section of paper.sections) {
    // Add page if section header is printed at the bottom of the page
    if (doc.y > 700) {
      doc.addPage();
    }

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(13).text(section.title, 40, doc.y, { align: 'center', width: 515 });
    doc.moveDown(0.2);
    const subheaderText = section.title === 'Section A' ? 'Short Answer Questions' : 'Questions';
    doc.font('Helvetica-Bold').fontSize(11).text(subheaderText, 40, doc.y, { align: 'left', width: 515 });
    doc.moveDown(0.2);
    doc.font('Helvetica-Oblique').fontSize(9).text(section.instruction, 40, doc.y, { align: 'left', width: 515 });
    doc.moveDown(0.8);
    doc.x = 40;

    for (const q of section.questions) {
      if (doc.y > 720) {
        doc.addPage();
      }

      // Inline question format matching user layout: "1. [Easy] Define electroplating. Explain its purpose. [2 Marks]"
      const qText = `${questionNumber}. [${q.difficulty}] ${q.text} [${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;

      doc.font('Helvetica').fontSize(10).fillColor('#000000').text(qText, 40, doc.y, {
        width: 515,
        align: 'left'
      });

      doc.moveDown(0.5);
      doc.x = 40;
      questionNumber++;
    }
    doc.moveDown(1);
    doc.x = 40;
  }

  if (doc.y > 720) {
    doc.addPage();
  }
  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(10).text('End of Question Paper', 40, doc.y, { align: 'left', width: 515 });

  // Add a fresh page for the Answer Key
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(14).text('Answer Key', 40, doc.y, { align: 'left', width: 515 });
  doc.moveDown(1);
  doc.x = 40;

  for (const ans of paper.answers) {
    if (doc.y > 720) {
      doc.addPage();
    }
    const ansText = `${ans.questionNumber}. ${ans.text}`;
    const currentY = doc.y;
    doc.font('Helvetica').fontSize(10).text(ansText, 40, currentY, {
      width: 515,
      align: 'left'
    });
    const ansHeight = doc.heightOfString(ansText, { width: 515 });
    doc.y = currentY + ansHeight;
    doc.moveDown(0.5);
    doc.x = 40;
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(`/pdfs/${assignmentId}.pdf`));
    writeStream.on('error', (err) => reject(err));
  });
};

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificate = async (user, course, completionDate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Background border
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8fafc');
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#6366f1');

      // Title
      doc.fontSize(32).fillColor('#1e293b').text('CERTIFICATE OF COMPLETION', { align: 'center', underline: true });
      doc.moveDown();

      // Body
      doc.fontSize(18).fillColor('#334155').text('This certificate is proudly presented to', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(28).fillColor('#6366f1').text(user.name, { align: 'center', bold: true });
      doc.moveDown(0.5);
      doc.fontSize(18).fillColor('#334155').text(`for successfully completing the course`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(24).fillColor('#1e293b').text(course.title, { align: 'center', bold: true });
      doc.moveDown();

      // Date
      const formattedDate = new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.fontSize(12).fillColor('#64748b').text(`Date: ${formattedDate}`, { align: 'center' });

      // Signature placeholder
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#94a3b8').text('Authorized Signature', 72, doc.y, { align: 'center' });
      doc.moveDown(0.5);
      doc.lineWidth(1).moveTo(72, doc.y).lineTo(doc.page.width - 72, doc.y).stroke('#cbd5e1');

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
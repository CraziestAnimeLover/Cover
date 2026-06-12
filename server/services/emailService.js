import transporter from '../config/email.js';

// Send email helper
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@lmsplatform.com',
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
  }
};

// Payment confirmation (student)
export const sendPaymentConfirmation = async (user, course, amount) => {
  const subject = `Payment Confirmed: ${course.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Payment Successful!</h2>
      <p>Dear ${user.name},</p>
      <p>Your payment of <strong>₹${amount}</strong> for the course <strong>${course.title}</strong> has been successfully processed.</p>
      <p>You can now access the course from your <a href="${process.env.FRONTEND_URL}/my-learning" style="color: #6366f1;">My Learning</a> page.</p>
      <br/>
      <p>Happy Learning!</p>
      <p>LMS Platform Team</p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

// Payout status update (affiliate)
export const sendPayoutStatusUpdate = async (user, payout, status) => {
  const subject = `Withdrawal Request ${status.toUpperCase()}`;
  const statusText = status === 'completed' ? 'processed successfully' : `updated to ${status}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Withdrawal Request ${status.toUpperCase()}</h2>
      <p>Dear ${user.name},</p>
      <p>Your withdrawal request of <strong>₹${payout.amount}</strong> has been ${statusText}.</p>
      ${status === 'completed' ? `<p>Transaction ID: ${payout.transactionId}</p>` : ''}
      <p>If you have any questions, please contact support.</p>
      <br/>
      <p>LMS Platform Team</p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

// KYC status update
export const sendKYCStatusUpdate = async (user, status, comments = '') => {
  const subject = `KYC Verification ${status.toUpperCase()}`;
  const statusMessage = status === 'approved' 
    ? 'Your KYC has been approved. You can now request withdrawals.' 
    : `Your KYC has been rejected. Reason: ${comments}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">KYC Verification ${status.toUpperCase()}</h2>
      <p>Dear ${user.name},</p>
      <p>${statusMessage}</p>
      <p>If you have any questions, please contact support.</p>
      <br/>
      <p>LMS Platform Team</p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};
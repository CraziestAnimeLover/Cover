export const welcomeEmail = (name, email) => {
  return `
    <h1>Welcome to LMS Platform, ${name}!</h1>
    <p>Thank you for joining our learning community.</p>
    <p>Your email: ${email}</p>
  `;
};

export const enrollmentEmail = (courseName, userName) => {
  return `
    <h1>Course Enrollment Confirmation</h1>
    <p>Dear ${userName},</p>
    <p>You have successfully enrolled in "${courseName}".</p>
    <p>Start learning now!</p>
  `;
};

export const commissionEmail = (agentName, amount, courseName) => {
  return `
    <h1>Commission Earned!</h1>
    <p>Dear ${agentName},</p>
    <p>You've earned $${amount} commission from "${courseName}" enrollment.</p>
  `;
};
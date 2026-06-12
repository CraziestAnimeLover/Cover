const generateReferralCode = (name, email) => {
  const prefix = name.substring(0, 3).toUpperCase();
  const suffix = email.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}${random}`;
};

export default generateReferralCode;
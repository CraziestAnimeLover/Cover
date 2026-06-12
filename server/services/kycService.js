import KYC from '../models/KYC.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

class KYCService {
  
  // Submit KYC documents
  async submitKYC(userId, kycData, files) {
    try {
      // Upload images to Cloudinary
      let frontImageUrl = null;
      let backImageUrl = null;
      
      if (files.frontImage) {
        const result = await this.uploadToCloudinary(files.frontImage[0]);
        frontImageUrl = result.secure_url;
      }
      if (files.backImage) {
        const result = await this.uploadToCloudinary(files.backImage[0]);
        backImageUrl = result.secure_url;
      }
      
      // Check if KYC already exists
      let kyc = await KYC.findOne({ userId });
      
      if (kyc) {
        // Update existing KYC
        kyc.fullName = kycData.fullName;
        kyc.aadhaarNumber = kycData.aadhaarNumber;
        kyc.dateOfBirth = kycData.dateOfBirth;
        kyc.gender = kycData.gender;
        kyc.address = kycData.address;
        if (frontImageUrl) kyc.frontImageUrl = frontImageUrl;
        if (backImageUrl) kyc.backImageUrl = backImageUrl;
        kyc.panCard = kycData.panCard;
        kyc.bankAccountNumber = kycData.bankAccountNumber;
        kyc.ifscCode = kycData.ifscCode;
        kyc.bankName = kycData.bankName;
        kyc.accountHolderName = kycData.accountHolderName;
        kyc.status = 'pending';
      } else {
        // Create new KYC
        kyc = await KYC.create({
          userId,
          fullName: kycData.fullName,
          aadhaarNumber: kycData.aadhaarNumber,
          dateOfBirth: kycData.dateOfBirth,
          gender: kycData.gender,
          address: kycData.address,
          frontImageUrl,
          backImageUrl,
          panCard: kycData.panCard,
          bankAccountNumber: kycData.bankAccountNumber,
          ifscCode: kycData.ifscCode,
          bankName: kycData.bankName,
          accountHolderName: kycData.accountHolderName,
          status: 'pending'
        });
      }
      
      await kyc.save();
      return kyc;
    } catch (error) {
      console.error('KYC submission error:', error);
      throw error;
    }
  }
  
  // Helper to upload file to Cloudinary
  async uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kyc_documents',
          width: 800,
          height: 600,
          crop: 'limit'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });
  }
  
  // Get KYC status for a user
  async getKYCStatus(userId) {
    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      return { status: 'not_submitted' };
    }
    return {
      status: kyc.status,
      submittedAt: kyc.createdAt,
      verifiedAt: kyc.verifiedAt,
      adminComments: kyc.adminComments
    };
  }
  
  // Get KYC details (for admin)
  async getKYCDetails(userId) {
    const kyc = await KYC.findOne({ userId }).populate('userId', 'name email phone');
    return kyc;
  }
  
  // Get pending KYC requests (for admin)
  async getPendingKYC(limit = 50, skip = 0) {
    const kycs = await KYC.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);
    const total = await KYC.countDocuments({ status: 'pending' });
    return { kycs, total };
  }
  
  // Approve KYC
  async approveKYC(kycId, adminId, comments = '') {
    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new Error('KYC not found');
    kyc.status = 'approved';
    kyc.adminComments = comments;
    kyc.verifiedAt = new Date();
    kyc.verifiedBy = adminId;
    await kyc.save();
    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'approved' });
    return kyc;
  }
  
  // Reject KYC
  async rejectKYC(kycId, adminId, reason) {
    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new Error('KYC not found');
    kyc.status = 'rejected';
    kyc.adminComments = reason;
    kyc.verifiedAt = new Date();
    kyc.verifiedBy = adminId;
    await kyc.save();
    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'rejected' });
    return kyc;
  }
}

export default new KYCService();
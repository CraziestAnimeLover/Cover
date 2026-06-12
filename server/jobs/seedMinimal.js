import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/udemy_clone';

// Simple user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  referralCode: String,
  isVerified: Boolean,
  avatar: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const generateReferralCode = (name, email) => {
  const prefix = name.substring(0, 3).toUpperCase();
  const suffix = email.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}${random}`;
};

const seedDemoUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database\n');

    const demoUsers = [
      { name: 'Student User', email: 'student@test.com', password: 'test123', role: 'student' },
      { name: 'Instructor User', email: 'instructor@test.com', password: 'test123', role: 'instructor' },
      { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { name: 'Agent User', email: 'agent@test.com', password: 'test123', role: 'agent' }
    ];

    let created = 0;
    let exists = 0;

    for (const user of demoUsers) {
      const existing = await User.findOne({ email: user.email });
      
      if (!existing) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          referralCode: generateReferralCode(user.name, user.email),
          isVerified: true,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
        });
        console.log(`✅ Created: ${user.email} (${user.role})`);
        created++;
      } else {
        console.log(`⚠️  Already exists: ${user.email}`);
        exists++;
      }
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✅ SEEDING COMPLETED!');
    console.log('═'.repeat(50));
    console.log(`📊 Summary: ${created} created, ${exists} existing\n`);
    
    console.log('🔐 DEMO CREDENTIALS:');
    console.log('────────────────────────────────────────');
    console.log('Student:    student@test.com / test123');
    console.log('Instructor: instructor@test.com / test123');
    console.log('Agent:      agent@test.com / test123');
    console.log('Admin:      admin@example.com / admin123');
    console.log('────────────────────────────────────────\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from database\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDemoUsers();
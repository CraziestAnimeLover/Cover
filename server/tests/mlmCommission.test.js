// server/tests/mlmCommission.test.js
// Run with: npm run test:mlm  (script added later)

import mongoose from 'mongoose';
import { expect } from 'chai'; // or use 'assert' if you prefer
// If you don't have chai installed: npm install --save-dev chai

// ----- Inline commission distribution logic (replaces your service) -----
// This replicates the PRD: 5 levels with 25%,15%,10%,5%,3%
// If you already have a service, you can import and use that instead.
async function distributeCommissionInline(buyerId, courseId, amount) {
  // Import models dynamically (or use require)
  const MLMTree = require('../models/MLMTree.js').default; // adjust if using ES modules
  const Commission = require('../models/Commission.js').default;
  // If your models are exported with default, use .default; else adjust.

  // 1. Fetch buyer's MLM tree to get ancestors
  const buyerTree = await MLMTree.findOne({ userId: buyerId });
  if (!buyerTree) throw new Error('Buyer has no MLM tree');

  // path is stored as comma-separated IDs (e.g., "root,child,parent")
  const ancestorIds = buyerTree.path.split(',').filter(id => id !== buyerId.toString());
  // Reverse to get parent first -> up to 5 levels
  const uplineIds = ancestorIds.slice().reverse();
  const levelPercentages = [25, 15, 10, 5, 3];

  // For each level up to 5, create commission record
  for (let i = 0; i < Math.min(uplineIds.length, 5); i++) {
    const affiliateId = uplineIds[i];
    const percentage = levelPercentages[i] / 100;
    const commissionAmount = Math.round(amount * percentage * 100) / 100; // round to 2 decimals

    await Commission.create({
      affiliateId,
      buyerId,
      courseId,
      level: i + 1,
      amount: commissionAmount,
      status: 'pending',
      // ... other fields as needed
    });
  }
}
// ----------------------------------------------------------------------

// You can import your real models; I'll use require for simplicity.
// If using ES modules, adjust accordingly.
const User = require('../models/User.js').default || require('../models/User.js');
const Course = require('../models/Course.js').default || require('../models/Course.js');
const MLMTree = require('../models/MLMTree.js').default || require('../models/MLMTree.js');
const Commission = require('../models/Commission.js').default || require('../models/Commission.js');

// Helper to generate a simple referral code
function generateTestCode(seed) {
  return 'REF' + Date.now() + seed;
}

describe('MLM Commission Distribution – 5 Levels', function() {
  this.timeout(15000);

  let topAffiliate, userB, userC, userD, userE, buyer;
  let course;

  before(async function() {
    // Use test DB (create a separate DB for tests)
    const TEST_DB = 'mongodb://localhost:27017/edtech_test';
    await mongoose.connect(TEST_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clean collections
    await User.deleteMany({});
    await MLMTree.deleteMany({});
    await Commission.deleteMany({});
    await Course.deleteMany({});

    // 1. Create a test course
    course = await Course.create({
      title: 'Test Course for MLM',
      price: 5000,
      instructor: new mongoose.Types.ObjectId(), // dummy
      isApproved: true,
      isPublished: true,
    });

    // 2. Create 5 affiliates: A (top) -> B -> C -> D -> E
    const affiliates = [];
    for (let i = 0; i < 5; i++) {
      const letter = String.fromCharCode(65 + i);
      const user = await User.create({
        name: `Affiliate ${letter}`,
        email: `aff${letter.toLowerCase()}@test.com`,
        password: 'hashed',
        role: 'affiliate',
        referralCode: generateTestCode(i),
        isVerified: true,
      });
      affiliates.push(user);
    }
    [topAffiliate, userB, userC, userD, userE] = affiliates;

    // 3. Build MLM tree (materialized path)
    const treeData = [
      { user: topAffiliate, path: topAffiliate._id.toString() },
      { user: userB, path: `${topAffiliate._id},${userB._id}` },
      { user: userC, path: `${topAffiliate._id},${userB._id},${userC._id}` },
      { user: userD, path: `${topAffiliate._id},${userB._id},${userC._id},${userD._id}` },
      { user: userE, path: `${topAffiliate._id},${userB._id},${userC._id},${userD._id},${userE._id}` },
    ];
    for (const entry of treeData) {
      await MLMTree.create({
        userId: entry.user._id,
        path: entry.path,
        // referrer is parent (last in path) – we can compute or store; for test, not needed.
        referrer: entry.path.split(',').slice(-2, -1)[0] || null,
      });
    }

    // 4. Create buyer (student) referred by userE
    const buyerUser = await User.create({
      name: 'Buyer',
      email: 'buyer@test.com',
      password: 'hashed',
      role: 'student',
      referralCode: generateTestCode('buyer'),
      referredBy: userE.referralCode,
      isVerified: true,
    });
    buyer = buyerUser;

    // Also add buyer to MLM tree (child of E)
    await MLMTree.create({
      userId: buyer._id,
      path: `${topAffiliate._id},${userB._id},${userC._id},${userD._id},${userE._id},${buyer._id}`,
      referrer: userE._id,
    });
  });

  after(async function() {
    await mongoose.connection.close();
  });

  it('should create commissions for all 5 upline affiliates with correct percentages', async function() {
    // Simulate purchase: buyer buys the course
    const coursePrice = course.price; // 5000

    // Call the distribution function (inline)
    await distributeCommissionInline(buyer._id, course._id, coursePrice);

    // Fetch commissions for each affiliate
    const commE = await Commission.findOne({ affiliateId: userE._id, level: 1 });
    const commD = await Commission.findOne({ affiliateId: userD._id, level: 2 });
    const commC = await Commission.findOne({ affiliateId: userC._id, level: 3 });
    const commB = await Commission.findOne({ affiliateId: userB._id, level: 4 });
    const commA = await Commission.findOne({ affiliateId: topAffiliate._id, level: 5 });

    // Expected amounts: 25%, 15%, 10%, 5%, 3% of 5000
    const expected = [0.25, 0.15, 0.10, 0.05, 0.03].map(p => Math.round(p * coursePrice * 100) / 100);

    // Assert each commission exists and amount matches
    expect(commE).to.exist;
    expect(commE.amount).to.equal(expected[0]);

    expect(commD).to.exist;
    expect(commD.amount).to.equal(expected[1]);

    expect(commC).to.exist;
    expect(commC.amount).to.equal(expected[2]);

    expect(commB).to.exist;
    expect(commB.amount).to.equal(expected[3]);

    expect(commA).to.exist;
    expect(commA.amount).to.equal(expected[4]);

    // Optional: verify total commissions sum to 58% of price
    const total = expected.reduce((a, b) => a + b, 0);
    const allCommissions = await Commission.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalStored = allCommissions[0]?.total || 0;
    expect(totalStored).to.equal(Math.round(total * 100) / 100);
  });
});
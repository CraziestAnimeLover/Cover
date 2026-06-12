import MLMTree from '../models/MLMTree.js';
import Commission from '../models/Commission.js';
import User from '../models/User.js';
import CommissionConfig from '../models/CommissionConfig.js';
import Enrollment from '../models/Enrollment.js';   // Add this import

class MLMService {
  
  // Get commission configuration
  async getCommissionConfig() {
    let config = await CommissionConfig.findOne();
    if (!config) {
      await CommissionConfig.initDefault();
      config = await CommissionConfig.findOne();
    }
    return config;
  }

  // Create MLM tree node for new user
  async createTreeNode(userId, sponsorId) {
    try {
      let path = userId.toString();
      let level = 1;
      
      if (sponsorId) {
        const sponsorNode = await MLMTree.findOne({ userId: sponsorId });
        if (sponsorNode) {
          path = `${sponsorNode.path}.${userId}`;
          level = sponsorNode.level + 1;
          
          // Prevent exceeding level 5
          if (level > 5) {
            throw new Error('Cannot place user beyond level 5');
          }
        }
      }
      
      // Find placement position (left or right)
      let leftChild = null;
      let rightChild = null;
      
      const mlmNode = await MLMTree.create({
        userId,
        sponsorId,
        path,
        level,
        leftChild,
        rightChild,
        totalDownline: 0,
        activeDownline: 0
      });
      
      // Update sponsor's downline count
      if (sponsorId) {
        await this.updateDownlineCount(sponsorId);
      }
      
      return mlmNode;
    } catch (error) {
      console.error('Error creating MLM tree node:', error);
      throw error;
    }
  }
  
  // Update downline count for a user
  async updateDownlineCount(userId) {
    const downline = await MLMTree.find({ sponsorId: userId });
    const totalDownline = downline.length;
    // Note: activeDownline will be computed separately, but we can leave placeholder
    await MLMTree.updateOne(
      { userId },
      { totalDownline }
    );
  }
  
  // Get complete downline tree for a user
  async getDownlineTree(userId, maxLevel = 5) {
    const userNode = await MLMTree.findOne({ userId }).populate('userId', 'name email');
    if (!userNode) return null;
    
    const getChildren = async (node, currentLevel) => {
      if (currentLevel >= maxLevel) return [];
      
      const children = await MLMTree.find({ sponsorId: node.userId._id })
        .populate('userId', 'name email');
      
      for (const child of children) {
        child.children = await getChildren(child, currentLevel + 1);
      }
      
       return { children: [] };
    };
    
    const tree = userNode.toObject();
    tree.children = await getChildren(userNode, 1);
    
    return tree;
  }
  
  // Distribute commission after course purchase
  async distributeCommission(purchaserId, coursePrice, courseId) {
    try {
      const config = await this.getCommissionConfig();
      const commissions = [];
      
      // Get the purchaser's MLM node
      let currentNode = await MLMTree.findOne({ userId: purchaserId });
      let currentLevel = 1;
      
      while (currentNode && currentLevel <= 5) {
        const sponsorId = currentNode.sponsorId;
        if (!sponsorId) break;
        
        // Get commission percentage for this level
        let percentage = 0;
        switch (currentLevel) {
          case 1: percentage = config.level1.percentage; break;
          case 2: percentage = config.level2.percentage; break;
          case 3: percentage = config.level3.percentage; break;
          case 4: percentage = config.level4.percentage; break;
          case 5: percentage = config.level5.percentage; break;
        }
        
        if (percentage > 0) {
          const commissionAmount = (coursePrice * percentage) / 100;
          
          // Create commission record
          const commission = await Commission.create({
            userId: sponsorId,
            sourceUserId: purchaserId,
            level: currentLevel,
            amount: commissionAmount,
            percentage: percentage,
            courseId: courseId,
            status: 'pending',
            description: `${currentLevel}${this.getOrdinal(currentLevel)} level commission from ${purchaserId}`
          });
          
          commissions.push(commission);
          
          // Update user's total earnings
          await User.findByIdAndUpdate(sponsorId, {
            $inc: { totalEarnings: commissionAmount, withdrawableBalance: commissionAmount }
          });
          
          // Update MLM tree total commission
          await MLMTree.findOneAndUpdate(
            { userId: sponsorId },
            { $inc: { totalCommission: commissionAmount } }
          );
        }
        
        // Move up to next level
        currentNode = await MLMTree.findOne({ userId: sponsorId });
        currentLevel++;
      }
      
      return commissions;
    } catch (error) {
      console.error('Error distributing commission:', error);
      throw error;
    }
  }
  
  // Helper to get ordinal suffix
  getOrdinal(n) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  }
  
  // Get user's downline summary (counts per level)
  async getDownlineSummary(userId) {
    const downline = await MLMTree.find({ sponsorId: userId });
    
    const summary = {
      total: downline.length,
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0
    };
    
    for (const node of downline) {
      const level = node.level;
      if (level >= 1 && level <= 5) {
        summary[`level${level}`]++;
      }
    }
    
    return summary;
  }
  
  // Get total earnings breakdown
  async getEarningsBreakdown(userId) {
    const commissions = await Commission.find({ userId, status: 'paid' });
    
    const breakdown = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0,
      total: 0
    };
    
    for (const commission of commissions) {
      if (commission.level >= 1 && commission.level <= 5) {
        breakdown[`level${commission.level}`] += commission.amount;
        breakdown.total += commission.amount;
      }
    }
    
    return breakdown;
  }


  // Format tree for D3 (react-d3-tree) – returns a nested object with `name` and `children`
// Format tree for D3 (react-d3-tree)
async getFormattedDownlineTree(userId, maxLevel = 5) {
  try {
    const tree = await this.getDownlineTree(userId, maxLevel);
    if (!tree) {
      const user = await User.findById(userId).select('name email');
      return {
        name: user?.name || 'You',
        attributes: { email: user?.email || '', level: 1, totalCommission: 0 },
        children: []
      };
    }
    const formatNode = (node) => ({
      name: node.userId?.name || 'Unknown',
      attributes: {
        email: node.userId?.email || '',
        level: node.level,
        totalCommission: node.totalCommission || 0
      },
      children: (node.children || []).map(child => formatNode(child))
    });
    return formatNode(tree);
  } catch (error) {
    console.error('❌ getFormattedDownlineTree error:', error);
    return null;
  }
}

  // ============ NEW: Active/Inactive Downline Count ============
  async getDownlineActivity(userId) {
  const userNode = await MLMTree.findOne({ userId });
  if (!userNode) {
    return {
      level1: { active: 0, inactive: 0 },
      level2: { active: 0, inactive: 0 },
      level3: { active: 0, inactive: 0 },
      level4: { active: 0, inactive: 0 },
      level5: { active: 0, inactive: 0 }
    };
  }
  
  // Get all downline nodes (users under this user in the tree)
  const allDownline = await MLMTree.find({ path: { $regex: `^${userNode.path}\\.` } });
  
  // Get users who made a purchase in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activeUserIds = await Enrollment.distinct('user', {
    createdAt: { $gte: thirtyDaysAgo }
  });
  const activeSet = new Set(activeUserIds.map(id => id.toString()));
  
  const activity = {
    level1: { active: 0, inactive: 0 },
    level2: { active: 0, inactive: 0 },
    level3: { active: 0, inactive: 0 },
    level4: { active: 0, inactive: 0 },
    level5: { active: 0, inactive: 0 }
  };
  
  for (const node of allDownline) {
    const level = node.level - userNode.level; // relative level from the user
    if (level >= 1 && level <= 5) {
      const isActive = activeSet.has(node.userId.toString());
      const key = `level${level}`;
      if (isActive) activity[key].active++;
      else activity[key].inactive++;
    }
  }
  
  return activity;
}
}

export default new MLMService();
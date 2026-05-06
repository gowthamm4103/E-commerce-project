const User = require('../models/User');

// ─── Get Tree Visualization ─────────────────────────────────────────
exports.getTreeVisualization = async (req, res) => {
  try {
    const root = await User.findOne({ userId: 'FOUND001' });
    if (!root) {
      return res.json({ success: true, tree: [] });
    }

    const result = [];
    const queue = [{ user: root, level: 0 }];

    while (queue.length > 0) {
      const { user, level } = queue.shift();

      if (!result[level]) result[level] = [];

      const directParent = user.directParentId ? await User.findOne({ userId: user.directParentId }) : null;
      const logicalParent = user.logicalParentId ? await User.findOne({ userId: user.logicalParentId }) : null;

      // Clean up dangling child pointers before building node data
      let leftChildValid = false;
      let rightChildValid = false;
      if (user.leftChildId) {
        const leftChild = await User.findOne({ userId: user.leftChildId });
        if (leftChild) {
          leftChildValid = true;
          queue.push({ user: leftChild, level: level + 1 });
        } else {
          user.leftChildId = null;
          await user.save();
        }
      }
      if (user.rightChildId) {
        const rightChild = await User.findOne({ userId: user.rightChildId });
        if (rightChild) {
          rightChildValid = true;
          queue.push({ user: rightChild, level: level + 1 });
        } else {
          user.rightChildId = null;
          await user.save();
        }
      }

      result[level].push({
        id: user.userId,
        name: user.name,
        email: user.email,
        userType: user.userType,
        brandName: user.brandName || '',
        hasLeft: leftChildValid,
        hasRight: rightChildValid,
        leftChildId: user.leftChildId,
        rightChildId: user.rightChildId,
        directReferralsCount: user.directReferrals.length,
        directReferralIds: user.directReferrals,
        directParentId: user.directParentId,
        directParentName: directParent ? directParent.name : '',
        logicalParentId: user.logicalParentId,
        logicalParentName: logicalParent ? logicalParent.name : '',
        directIncome: user.directIncome,
        indirectIncome: user.indirectIncome,
        totalSales: user.totalSales,
        level: user.level,
        creditWallet: user.creditWallet,
        franchiseATurnover: user.franchiseATurnover,
        franchiseBTurnover: user.franchiseBTurnover,
        eWallet: user.eWallet,
        hasMovedPosition: !!user.logicalParentId,
      });
    }

    return res.json({ success: true, tree: result });
  } catch (error) {
    console.error('Get tree visualization error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch tree.' });
  }
};

// ─── Get User's Hierarchy ───────────────────────────────────────────
exports.getHierarchy = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    let parent = null;
    if (user.directParentId) {
      const parentNode = await User.findOne({ userId: user.directParentId });
      if (parentNode) {
        parent = {
          id: parentNode.userId,
          name: parentNode.name,
          level: parentNode.level,
          kycVerified: parentNode.kycVerified,
        };
      }
    }

    const children = [];
    if (user.leftChildId) {
      const left = await User.findOne({ userId: user.leftChildId });
      if (left) {
        children.push({
          id: left.userId,
          name: left.name,
          level: left.level,
          kycVerified: left.kycVerified,
          position: 'left',
        });
      }
    }
    if (user.rightChildId) {
      const right = await User.findOne({ userId: user.rightChildId });
      if (right) {
        children.push({
          id: right.userId,
          name: right.name,
          level: right.level,
          kycVerified: right.kycVerified,
          position: 'right',
        });
      }
    }

    return res.json({
      success: true,
      hierarchy: {
        parent,
        user: {
          id: user.userId,
          name: user.name,
          level: user.level,
          kycVerified: user.kycVerified,
        },
        children,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch hierarchy.' });
  }
};

// ─── Get Franchise A/B Data ─────────────────────────────────────────
exports.getFranchise = async (req, res) => {
  try {
    const { side } = req.params; // 'A' or 'B'
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const childId = side === 'A' ? user.leftChildId : user.rightChildId;
    if (!childId) {
      return res.json({ success: true, franchise: { direct: null, members: [] } });
    }

    const direct = await User.findOne({ userId: childId });
    if (!direct) {
      return res.json({ success: true, franchise: { direct: null, members: [] } });
    }

    // Get all descendants of this child
    const members = [];
    const getDescendants = async (userId) => {
      const node = await User.findOne({ userId });
      if (!node) return;

      members.push({
        id: node.userId,
        name: node.name,
        joinDate: node.createdAt,
        kycVerified: node.kycVerified,
        purchaseValue: node.totalSales,
      });

      if (node.leftChildId) await getDescendants(node.leftChildId);
      if (node.rightChildId) await getDescendants(node.rightChildId);
    };

    await getDescendants(childId);

    return res.json({
      success: true,
      franchise: {
        direct: {
          id: direct.userId,
          name: direct.name,
          joinDate: direct.createdAt,
          kycVerified: direct.kycVerified,
          purchaseValue: direct.totalSales,
        },
        members,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch franchise data.' });
  }
};

// ─── Monthly Consolidation ──────────────────────────────────────────
exports.monthlyConsolidation = async (req, res) => {
  try {
    const allUsers = await User.find({});
    const creditAllocations = [];

    // Calculate subtree sales recursively
    const calculateSubtreeSales = async (userId) => {
      if (!userId) return 0;
      const node = await User.findOne({ userId });
      if (!node) return 0;
      const leftSales = await calculateSubtreeSales(node.leftChildId);
      const rightSales = await calculateSubtreeSales(node.rightChildId);
      return node.totalSales + leftSales + rightSales;
    };

    // Calculate reward credits (same logic as frontend)
    const calculateRewardCredits = (turnover) => {
      let credits = 0;
      let remaining = turnover;
      if (remaining >= 200000) { credits += 10; remaining -= 200000; } else return 0;
      if (remaining >= 500000) { credits += 15; remaining -= 500000; } else return credits;
      if (remaining >= 1000000) { credits += 20; remaining -= 1000000; } else return credits;
      credits += Math.floor(remaining / 2000000) * 25;
      return credits;
    };

    for (const user of allUsers) {
      // Step 1: Calculate subtree sales
      const leftSales = await calculateSubtreeSales(user.leftChildId);
      const rightSales = await calculateSubtreeSales(user.rightChildId);

      user.leftSubtreeSales = leftSales + user.carryForwardLeft;
      user.rightSubtreeSales = rightSales + user.carryForwardRight;

      const balancedVolume = Math.min(user.leftSubtreeSales, user.rightSubtreeSales);

      if (balancedVolume > 0 && user.userType !== 'brand_owner') {
        user.indirectIncome += balancedVolume * 0.05;
      }

      user.carryForwardLeft = user.leftSubtreeSales - balancedVolume;
      user.carryForwardRight = user.rightSubtreeSales - balancedVolume;

      // Step 2: Credit allocation for customers
      if (user.userType === 'customer') {
        const creditsFromA = calculateRewardCredits(user.franchiseATurnover);
        if (creditsFromA > 0) {
          user.creditWallet += creditsFromA;
          creditAllocations.push({
            userId: user.userId,
            userName: user.name,
            franchise: 'A',
            turnover: user.franchiseATurnover,
            creditsAllocated: creditsFromA,
          });
        }

        const creditsFromB = calculateRewardCredits(user.franchiseBTurnover);
        if (creditsFromB > 0) {
          user.creditWallet += creditsFromB;
          creditAllocations.push({
            userId: user.userId,
            userName: user.name,
            franchise: 'B',
            turnover: user.franchiseBTurnover,
            creditsAllocated: creditsFromB,
          });
        }
      }

      await user.save();
    }

    return res.json({
      success: true,
      message: 'Monthly consolidation completed.',
      totalUsers: allUsers.length,
      creditAllocations,
    });
  } catch (error) {
    console.error('Monthly consolidation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to run consolidation.' });
  }
};

// ─── Get Next Parent Info (for registration forms) ──────────────────
// Matches TreeManager.js logic: customers = BFS entire tree, brand_owners = under founders/brand_owners
exports.getNextParentInfo = async (req, res) => {
  try {
    const { userType } = req.query;

    if (userType === 'brand_owner') {
      // Brand owners go under founders or other brand owners (matching getNextBrandOwnerParentInfo)
      const root = await User.findOne({ userId: 'FOUND001' });
      if (!root) return res.json({ success: true, parentInfo: null });

      const queue = [root];
      while (queue.length > 0) {
        const current = queue.shift();

        if (current.userType === 'founder' || current.userType === 'brand_owner') {
          if (!current.leftChildId) {
            return res.json({
              success: true,
              parentInfo: { parentId: current.userId, parentName: current.name, position: 'left' },
            });
          }
          const leftChild = await User.findOne({ userId: current.leftChildId });
          if (leftChild && leftChild.userType === 'customer') {
            return res.json({
              success: true,
              parentInfo: { parentId: current.userId, parentName: current.name, position: 'left', replacingCustomer: leftChild.userId },
            });
          }

          if (!current.rightChildId) {
            return res.json({
              success: true,
              parentInfo: { parentId: current.userId, parentName: current.name, position: 'right' },
            });
          }
          const rightChild = await User.findOne({ userId: current.rightChildId });
          if (rightChild && rightChild.userType === 'customer') {
            return res.json({
              success: true,
              parentInfo: { parentId: current.userId, parentName: current.name, position: 'right', replacingCustomer: rightChild.userId },
            });
          }
        }

        if (current.leftChildId) {
          const l = await User.findOne({ userId: current.leftChildId });
          if (l) queue.push(l);
        }
        if (current.rightChildId) {
          const r = await User.findOne({ userId: current.rightChildId });
          if (r) queue.push(r);
        }
      }

      return res.json({ success: true, parentInfo: null });
    }

    // For customers: BFS across the entire tree (matching getNextCustomerParentInfo)
    const root = await User.findOne({ userId: 'FOUND001' });
    if (!root) return res.json({ success: true, parentInfo: null });

    const queue = [root];
    while (queue.length > 0) {
      const current = queue.shift();

      if (!current.leftChildId) {
        return res.json({
          success: true,
          parentInfo: { parentId: current.userId, parentName: current.name, position: 'left' },
        });
      }
      if (!current.rightChildId) {
        return res.json({
          success: true,
          parentInfo: { parentId: current.userId, parentName: current.name, position: 'right' },
        });
      }

      const left = await User.findOne({ userId: current.leftChildId });
      const right = await User.findOne({ userId: current.rightChildId });
      if (left) queue.push(left);
      if (right) queue.push(right);
    }

    return res.json({ success: true, parentInfo: null });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to get parent info.' });
  }
};

// ─── Look up user by ID (for parent name auto-fill) ─────────────────
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('userId name email userType');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to find user.' });
  }
};

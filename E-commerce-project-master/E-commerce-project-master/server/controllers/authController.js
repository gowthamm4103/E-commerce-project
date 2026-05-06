const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, email: user.email, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Helper: BFS to find next empty slot in the ENTIRE tree ─────────
// Matches TreeManager.js getNextCustomerParentInfo() — unified tree, left-to-right
const findNextPositionBFS = async (startUserId = 'FOUND001') => {
  const root = await User.findOne({ userId: startUserId });
  if (!root) return null;

  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();

    if (!current.leftChildId) {
      return { parentId: current.userId, position: 'left' };
    }
    if (!current.rightChildId) {
      return { parentId: current.userId, position: 'right' };
    }

    const leftChild = await User.findOne({ userId: current.leftChildId });
    const rightChild = await User.findOne({ userId: current.rightChildId });
    if (leftChild) queue.push(leftChild);
    if (rightChild) queue.push(rightChild);
  }
  return null;
};

// ─── Helper: BFS to find next empty slot in a specific subtree ──────
// Matches TreeManager.js findNextPositionInSubtree()
const findNextPositionInSubtree = async (subtreeRootUserId) => {
  const root = await User.findOne({ userId: subtreeRootUserId });
  if (!root) return null;

  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();

    if (!current.leftChildId) {
      return { parentId: current.userId, position: 'left' };
    }
    if (!current.rightChildId) {
      return { parentId: current.userId, position: 'right' };
    }

    const leftChild = await User.findOne({ userId: current.leftChildId });
    const rightChild = await User.findOne({ userId: current.rightChildId });
    if (leftChild) queue.push(leftChild);
    if (rightChild) queue.push(rightChild);
  }
  return null;
};

// ─── Helper: find next position for BRAND OWNER ─────────────────────
// Matches TreeManager.js getNextBrandOwnerParentInfo()
// Brand owners go ONLY under founders or other brand owners.
// If a customer is in that slot, displace it under the new brand owner.
const findPositionForBrandOwner = async () => {
  const root = await User.findOne({ userId: 'FOUND001' });
  if (!root) return null;

  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();

    if (current.userType === 'founder' || current.userType === 'brand_owner') {
      if (!current.leftChildId) {
        return { parentId: current.userId, position: 'left', replacingCustomerId: null };
      }
      const leftChild = await User.findOne({ userId: current.leftChildId });
      if (leftChild && leftChild.userType === 'customer') {
        return { parentId: current.userId, position: 'left', replacingCustomerId: leftChild.userId };
      }

      if (!current.rightChildId) {
        return { parentId: current.userId, position: 'right', replacingCustomerId: null };
      }
      const rightChild = await User.findOne({ userId: current.rightChildId });
      if (rightChild && rightChild.userType === 'customer') {
        return { parentId: current.userId, position: 'right', replacingCustomerId: rightChild.userId };
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
  return null;
};

// ─── Register Customer ─────────────────────────────────────────────
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password, contact, dateOfBirth, parentId } = req.body;

    if (!name || !email || !password || !contact) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'This email is already registered.' });
    }

    let directParentId;
    let placementParentId;
    let position;

    if (parentId) {
      // Referral case: direct parent is the referrer, placement via BFS in referrer's subtree
      const referrer = await User.findOne({ userId: parentId });
      if (!referrer) {
        return res.status(400).json({ success: false, error: 'Invalid Parent ID.' });
      }
      directParentId = referrer.userId;

      const posInfo = await findNextPositionInSubtree(referrer.userId);
      if (!posInfo) {
        return res.status(400).json({ success: false, error: "No available position in parent's subtree." });
      }
      placementParentId = posInfo.parentId;
      position = posInfo.position;
    } else {
      // No referral: global BFS across entire tree
      const posInfo = await findNextPositionBFS();
      if (!posInfo) {
        return res.status(400).json({ success: false, error: 'No available position in tree.' });
      }
      placementParentId = posInfo.parentId;
      directParentId = posInfo.parentId;
      position = posInfo.position;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate userId based on max existing ID
    const lastCustomer = await User.findOne({ userType: 'customer' }).sort({ userId: -1 });
    let nextNum = 1;
    if (lastCustomer && lastCustomer.userId) {
      const num = parseInt(lastCustomer.userId.replace('CUST', '')) || 0;
      nextNum = num + 1;
    }
    const userId = `CUST${String(nextNum).padStart(3, '0')}`;

    const placementParent = await User.findOne({ userId: placementParentId });

    const newUser = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      contact,
      dateOfBirth: dateOfBirth || '',
      userType: 'customer',
      directParentId,
      level: placementParent ? placementParent.level + 1 : 1,
    });

    await newUser.save();

    // Update placement parent's child pointer
    if (position === 'left') {
      placementParent.leftChildId = userId;
    } else {
      placementParent.rightChildId = userId;
    }
    await placementParent.save();

    // Update direct parent's referrals & income (matches TreeManager.js)
    const directParent = (directParentId === placementParentId)
      ? await User.findOne({ userId: placementParentId })
      : await User.findOne({ userId: directParentId });

    if (directParent) {
      if (!directParent.directReferrals.includes(userId)) {
        directParent.directReferrals.push(userId);
      }
      const purchaseAmount = 1000;
      const directIncome = purchaseAmount * 0.05;
      directParent.directIncome += directIncome;
      directParent.totalSales += purchaseAmount;

      if (position === 'left') {
        directParent.franchiseATurnover += purchaseAmount;
      } else {
        directParent.franchiseBTurnover += purchaseAmount;
      }
      await directParent.save();
    }

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
      },
      token,
      treeInfo: {
        directParentId,
        placementParentId,
        position,
        level: newUser.level,
        isThirdPlusChild: directParentId !== placementParentId,
      },
    });
  } catch (error) {
    console.error('Register customer error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Registration failed.' });
  }
};

// ─── Register Brand Owner ──────────────────────────────────────────
exports.registerBrandOwner = async (req, res) => {
  try {
    const { name, email, password, contact, brandName, legalBusinessName, businessRegNo, gstNo, businessAddress } = req.body;

    if (!name || !email || !password || !contact) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'This email is already registered.' });
    }

    const posInfo = await findPositionForBrandOwner();
    if (!posInfo) {
      return res.status(400).json({ success: false, error: 'No available position for brand owner under founders/brand owners.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate userId
    const lastBrand = await User.findOne({ userType: 'brand_owner' }).sort({ userId: -1 });
    let nextBrandNum = 1;
    if (lastBrand && lastBrand.userId) {
      const num = parseInt(lastBrand.userId.replace('BRAND', '')) || 0;
      nextBrandNum = num + 1;
    }
    const userId = `BRAND${String(nextBrandNum).padStart(3, '0')}`;

    const parent = await User.findOne({ userId: posInfo.parentId });

    const newUser = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      contact,
      userType: 'brand_owner',
      brandName: brandName || '',
      legalBusinessName: legalBusinessName || '',
      businessRegNo: businessRegNo || '',
      gstNo: gstNo || '',
      businessAddress: businessAddress || {},
      directParentId: posInfo.parentId,
      level: parent ? parent.level + 1 : 1,
    });

    await newUser.save();

    let movedCustomerInfo = null;

    // Handle customer displacement (matches TreeManager.js)
    if (posInfo.replacingCustomerId) {
      const replacedCustomer = await User.findOne({ userId: posInfo.replacingCustomerId });
      if (replacedCustomer) {
        // Remove customer from parent's direct referrals
        parent.directReferrals = parent.directReferrals.filter(id => id !== replacedCustomer.userId);

        // Place brand owner in parent's slot
        if (posInfo.position === 'left') {
          parent.leftChildId = userId;
        } else {
          parent.rightChildId = userId;
        }
        await parent.save();

        // Place displaced customer as left child of new brand owner
        newUser.leftChildId = replacedCustomer.userId;
        await newUser.save();

        // Update displaced customer
        replacedCustomer.directParentId = userId;
        replacedCustomer.logicalParentId = parent.userId;
        replacedCustomer.level = newUser.level + 1;
        await replacedCustomer.save();

        // Add customer to brand owner's referrals
        newUser.directReferrals.push(replacedCustomer.userId);
        await newUser.save();

        movedCustomerInfo = {
          customerId: replacedCustomer.userId,
          customerName: replacedCustomer.name,
          newPosition: 'left',
          logicalParentId: parent.userId,
        };
      }
    } else {
      // No displacement — just set child pointer
      if (posInfo.position === 'left') {
        parent.leftChildId = userId;
      } else {
        parent.rightChildId = userId;
      }
    }

    // Update parent's referrals & income (matches TreeManager.js: 5000 * 0.05 = 250)
    parent.directReferrals.push(userId);
    const purchaseAmount = 5000;
    parent.directIncome += purchaseAmount * 0.05;
    parent.totalSales += purchaseAmount;
    if (posInfo.position === 'left') {
      parent.franchiseATurnover += purchaseAmount;
    } else {
      parent.franchiseBTurnover += purchaseAmount;
    }
    await parent.save();

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
      },
      token,
      treeInfo: {
        parentId: parent.userId,
        parentName: parent.name,
        position: posInfo.position,
        level: newUser.level,
        replacedCustomer: movedCustomerInfo,
      },
    });
  } catch (error) {
    console.error('Register brand owner error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Registration failed.' });
  }
};

// ─── Login ──────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { userId, password, email } = req.body;

    let user;
    if (userId) {
      user = await User.findOne({ userId });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid User ID or Password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid User ID or Password.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed.' });
  }
};

// ─── Get Current User Profile ────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
};

// ─── Update Profile ─────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'contact', 'dateOfBirth', 'kycData', 'bankAccount',
      'brandName', 'legalBusinessName', 'businessRegNo', 'gstNo', 'businessAddress',
      'businessEmail', 'businessPhone', 'businessWebsite', 'socialMediaLinks'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true }
    ).select('-password');

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
};

// ─── Update KYC ─────────────────────────────────────────────────────
exports.updateKYC = async (req, res) => {
  try {
    const { pan, aadhaar, address, panPhoto, aadhaarPhoto } = req.body;
    const user = await User.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          kycData: { pan, aadhaar, address, panPhoto, aadhaarPhoto },
          kycVerified: true,
        },
      },
      { new: true }
    ).select('-password');

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update KYC.' });
  }
};

// ─── Update Bank Account ────────────────────────────────────────────
exports.updateBankAccount = async (req, res) => {
  try {
    const { accountNumber, ifsc, bankName, accountHolder, passbookPhoto } = req.body;
    const user = await User.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          bankAccount: { accountNumber, ifsc, bankName, accountHolder, passbookPhoto },
        },
      },
      { new: true }
    ).select('-password');

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update bank account.' });
  }
};

// ─── Forgot Password (placeholder — real impl uses Firebase) ────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email.' });
    }
    // In production, send email with reset link/token
    return res.json({ success: true, message: 'Password reset instructions sent to your email.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to process request.' });
  }
};

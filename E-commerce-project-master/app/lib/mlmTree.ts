// ─── MLM Tree Data Structures & Manager ──────────────────────────────────────
// This module is server/client safe — no React imports.

export class TreeNode {
  id: string;
  name: string;
  email: string;
  userType: string;
  level: number;
  left: TreeNode | null;
  right: TreeNode | null;
  parent: TreeNode | null;
  directReferrals: string[];
  directParentId: string | null;
  directIncome: number;
  indirectIncome: number;
  totalSales: number;
  leftSubtreeSales: number;
  rightSubtreeSales: number;
  carryForwardLeft: number;
  carryForwardRight: number;
  height: number;
  creditWallet: number;
  franchiseATurnover: number;
  franchiseBTurnover: number;
  products: ProductItem[];
  accessories: ProductItem[];
  creditHistory: CreditEntry[];
  brandName: string;
  kycVerified: boolean;
  kycData: unknown;
  bankAccount: unknown;
  mobile: string;
  joinDate: string;
  eWallet: number;
  incomeWallet: number;
  logicalParentId: string | null;
  [key: string]: unknown;

  constructor(
    id: string,
    name: string,
    email: string,
    userType: string,
    level: number = 0,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.userType = userType;
    this.level = level;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.directReferrals = [];
    this.directParentId = null;
    this.directIncome = 0;
    this.indirectIncome = 0;
    this.totalSales = 0;
    this.leftSubtreeSales = 0;
    this.rightSubtreeSales = 0;
    this.carryForwardLeft = 0;
    this.carryForwardRight = 0;
    this.height = 1;
    this.creditWallet = 0;
    this.franchiseATurnover = 0;
    this.franchiseBTurnover = 0;
    this.products = [];
    this.accessories = [];
    this.creditHistory = [];
    this.brandName = "";
    this.kycVerified = false;
    this.kycData = null;
    this.bankAccount = null;
    this.mobile = "";
    this.joinDate = new Date().toISOString().split("T")[0];
    this.eWallet = 0;
    this.incomeWallet = 0;
    this.logicalParentId = null;
  }
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  [key: string]: unknown;
}

export interface CreditEntry {
  date: string;
  amount: number;
  reason: string;
  [key: string]: unknown;
}

export interface TreeVisualizationNode {
  id: string;
  name: string;
  email: string;
  userType: string;
  level: number;
  directIncome: number;
  indirectIncome: number;
  totalSales: number;
  leftSubtreeSales: number;
  rightSubtreeSales: number;
  children: TreeVisualizationNode[];
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class MLMTreeManager {
  constructor() {
    this.allNodes = new Map();
    this.usersByEmail = new Map();
    this.root = null;
    this.initializeFounders();
  }

  initializeFounders() {
    // Level 0 - Root Founder
    const founder0 = new TreeNode(
      "FOUND001",
      "Founder Alpha",
      "founder1@engineers.com",
      "founder",
      0,
    );

    // Level 1 - Two Founders
    const founder1 = new TreeNode(
      "FOUND002",
      "Founder Beta",
      "founder2@engineers.com",
      "founder",
      1,
    );
    const founder2 = new TreeNode(
      "FOUND003",
      "Founder Gamma",
      "founder3@engineers.com",
      "founder",
      1,
    );

    // Set up tree structure
    founder0.left = founder1;
    founder0.right = founder2;
    founder1.parent = founder0;
    founder2.parent = founder0;

    // Set direct parent relationships
    founder1.directParentId = "FOUND001";
    founder2.directParentId = "FOUND001";
    founder0.directReferrals = ["FOUND002", "FOUND003"];

    this.root = founder0;

    // Add to maps
    this.allNodes.set("FOUND001", founder0);
    this.allNodes.set("FOUND002", founder1);
    this.allNodes.set("FOUND003", founder2);

    this.usersByEmail.set("founder1@engineers.com", founder0);
    this.usersByEmail.set("founder2@engineers.com", founder1);
    this.usersByEmail.set("founder3@engineers.com", founder2);
  }

  // Find next available position in a subtree using BFS
  findNextPositionInSubtree(subtreeRoot) {
    const queue = [subtreeRoot];

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current.left) {
        return { node: current, position: "left" };
      }
      if (!current.right) {
        return { node: current, position: "right" };
      }

      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }

    return null;
  }

  // Find next available position for CUSTOMER using BFS (entire tree)
  getNextCustomerParentInfo() {
    const queue = [this.root];

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current.left) {
        return {
          parentId: current.id,
          parentName: current.name,
          position: "left",
        };
      }
      if (!current.right) {
        return {
          parentId: current.id,
          parentName: current.name,
          position: "right",
        };
      }

      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }

    return null;
  }

  // Find next available position for BRAND OWNER (only under founders and brand owners)
  getNextBrandOwnerParentInfo() {
    const queue = [this.root];

    while (queue.length > 0) {
      const current = queue.shift();

      // Only place brand owners under founders or other brand owners
      if (
        current.userType === "founder" ||
        current.userType === "brand_owner"
      ) {
        if (!current.left) {
          return {
            parentId: current.id,
            parentName: current.name,
            position: "left",
            replacingCustomer: null,
          };
        }

        if (current.left && current.left.userType === "customer") {
          return {
            parentId: current.id,
            parentName: current.name,
            position: "left",
            replacingCustomer: current.left,
          };
        }

        if (!current.right) {
          return {
            parentId: current.id,
            parentName: current.name,
            position: "right",
            replacingCustomer: null,
          };
        }

        if (current.right && current.right.userType === "customer") {
          return {
            parentId: current.id,
            parentName: current.name,
            position: "right",
            replacingCustomer: current.right,
          };
        }
      }

      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }

    return null;
  }

  generateNextUserId(userType) {
    let prefix = "CUST";
    if (userType === "brand_owner") prefix = "BRAND";
    if (userType === "founder") prefix = "FOUND";

    const userIds = Array.from(this.allNodes.keys())
      .filter((id) => id.startsWith(prefix))
      .map((id) => {
        const numPart = id.replace(prefix, "");
        return parseInt(numPart) || 0;
      })
      .sort((a, b) => b - a);

    const nextNumber = userIds.length > 0 ? userIds[0] + 1 : 1;
    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
  }

  registerCustomer(
    name,
    email,
    password,
    contact,
    dateOfBirth,
    manualParentId = null,
  ) {
    let directParent = null;
    let placementParent = null;
    let position = null;

    if (manualParentId) {
      directParent = this.allNodes.get(manualParentId);
      if (!directParent) {
        return { success: false, error: "Invalid parent ID" };
      }

      // Always use BFS to find the next available position in the parent's subtree
      const positionInfo = this.findNextPositionInSubtree(directParent);

      if (!positionInfo) {
        return {
          success: false,
          error: "No available position in parent's subtree",
        };
      }

      placementParent = positionInfo.node;
      position = positionInfo.position;
    } else {
      // Global BFS for customers without referrals
      const parentInfo = this.getNextCustomerParentInfo();

      if (!parentInfo) {
        return { success: false, error: "No available position in tree" };
      }

      placementParent = this.allNodes.get(parentInfo.parentId);
      directParent = placementParent;
      position = parentInfo.position;

      if (!placementParent) {
        return { success: false, error: "Parent node not found" };
      }
    }

    const newUserId = this.generateNextUserId("customer");
    const newUser = new TreeNode(
      newUserId,
      name,
      email,
      "customer",
      placementParent.level + 1,
    );
    newUser.directParentId = directParent.id;
    newUser.mobile = contact;

    // Place in tree structure
    if (position === "left") {
      placementParent.left = newUser;
    } else {
      placementParent.right = newUser;
    }
    newUser.parent = placementParent;

    // Give direct income to the DIRECT parent (who referred them)
    const purchaseAmount = 1000;
    const directIncome = purchaseAmount * 0.05;
    directParent.directIncome += directIncome;
    directParent.totalSales += purchaseAmount;
    directParent.directReferrals.push(newUserId);

    // Update franchise turnover for the direct parent
    if (position === "left") {
      directParent.franchiseATurnover += purchaseAmount;
    } else {
      directParent.franchiseBTurnover += purchaseAmount;
    }

    this.allNodes.set(newUserId, newUser);
    this.usersByEmail.set(email, newUser);

    return {
      success: true,
      userId: newUserId,
      directParentId: directParent.id,
      directParentName: directParent.name,
      placementParentId: placementParent.id,
      placementParentName: placementParent.name,
      level: newUser.level,
      position: position,
      isThirdPlusChild: directParent.id !== placementParent.id,
    };
  }

  registerBrandOwner(
    name,
    email,
    password,
    contact,
    brandName,
    businessRegNo,
    gstNo,
  ) {
    const parentInfo = this.getNextBrandOwnerParentInfo();

    if (!parentInfo) {
      return { success: false, error: "No available position for brand owner" };
    }

    const parent = this.allNodes.get(parentInfo.parentId);
    if (!parent) {
      return { success: false, error: "Parent node not found" };
    }

    const newUserId = this.generateNextUserId("brand_owner");
    const newUser = new TreeNode(
      newUserId,
      name,
      email,
      "brand_owner",
      parent.level + 1,
    );
    newUser.brandName = brandName;
    newUser.directParentId = parent.id;
    newUser.mobile = contact;

    const replacedCustomer = parentInfo.replacingCustomer;
    let movedCustomerInfo = null;

    if (parentInfo.position === "left") {
      parent.left = newUser;
    } else {
      parent.right = newUser;
    }
    newUser.parent = parent;

    if (replacedCustomer) {
      // Remove customer from parent's direct referrals
      const index = parent.directReferrals.indexOf(replacedCustomer.id);
      if (index > -1) {
        parent.directReferrals.splice(index, 1);
      }

      // Place customer as left child of the new brand owner
      newUser.left = replacedCustomer;
      replacedCustomer.parent = newUser;
      replacedCustomer.level = newUser.level + 1;

      // Set logical parent to maintain income flow
      replacedCustomer.logicalParentId = parent.id;

      // Add customer to brand owner's direct referrals
      newUser.directReferrals.push(replacedCustomer.id);
      replacedCustomer.directParentId = newUser.id;

      movedCustomerInfo = {
        customerId: replacedCustomer.id,
        customerName: replacedCustomer.name,
        newPosition: "left",
        logicalParentId: parent.id,
        logicalParentName: parent.name,
      };
    }

    const purchaseAmount = 5000;
    const directIncome = purchaseAmount * 0.05;
    parent.directIncome += directIncome;
    parent.totalSales += purchaseAmount;
    parent.directReferrals.push(newUserId);

    // Update franchise turnover for the parent
    if (parentInfo.position === "left") {
      parent.franchiseATurnover += purchaseAmount;
    } else {
      parent.franchiseBTurnover += purchaseAmount;
    }

    this.allNodes.set(newUserId, newUser);
    this.usersByEmail.set(email, newUser);

    return {
      success: true,
      userId: newUserId,
      brandName: brandName,
      parentId: parent.id,
      parentName: parent.name,
      level: newUser.level,
      position: parentInfo.position,
      replacedCustomer: movedCustomerInfo,
    };
  }

  /**
   * A robust method to swap two nodes in the binary tree.
   * This correctly handles all cases, including swapping a parent with its child,
   * and ensures no nodes are lost from the tree structure.
   * @param {TreeNode} nodeA - The first node to swap.
   * @param {TreeNode} nodeB - The second node to swap.
   */
  swapNodes(nodeA, nodeB) {
    if (nodeA === nodeB) return;

    const parentA = nodeA.parent;
    const parentB = nodeB.parent;

    const posA = parentA ? (parentA.left === nodeA ? "left" : "right") : null;
    const posB = parentB ? (parentB.left === nodeB ? "left" : "right") : null;

    // Store original children
    const leftA = nodeA.left;
    const rightA = nodeA.right;
    const leftB = nodeB.left;
    const rightB = nodeB.right;

    // 1. Detach nodes from their old parents
    if (parentA) parentA[posA] = null;
    if (parentB) parentB[posB] = null;

    // 2. Re-attach nodes to their new parents
    if (parentA) parentA[posA] = nodeB;
    if (parentB) parentB[posB] = nodeA;

    // 3. Swap children pointers, ensuring a node doesn't become its own child
    nodeA.left = leftB === nodeA ? nodeB : leftB;
    nodeA.right = rightB === nodeA ? nodeB : rightB;
    nodeB.left = leftA === nodeB ? nodeA : leftA;
    nodeB.right = rightA === nodeB ? nodeA : rightA;

    // 4. Update parent pointers of all children
    if (nodeA.left) nodeA.left.parent = nodeA;
    if (nodeA.right) nodeA.right.parent = nodeA;
    if (nodeB.left) nodeB.left.parent = nodeB;
    if (nodeB.right) nodeB.right.parent = nodeB;

    // 5. Swap parent pointers
    nodeA.parent = parentB;
    nodeB.parent = parentA;

    // 6. Swap levels
    const levelA = nodeA.level;
    nodeA.level = nodeB.level;
    nodeB.level = levelA;

    // 7. Update root if necessary
    if (this.root === nodeA) {
      this.root = nodeB;
    } else if (this.root === nodeB) {
      this.root = nodeA;
    }

    // 8. Update levels for all nodes in the swapped subtrees
    const updateSubtreeLevels = (node) => {
      if (!node) return;
      const queue = [node];
      while (queue.length > 0) {
        const current = queue.shift();
        if (current.left) {
          current.left.level = current.level + 1;
          queue.push(current.left);
        }
        if (current.right) {
          current.right.level = current.level + 1;
          queue.push(current.right);
        }
      }
    };
    updateSubtreeLevels(nodeA);
    updateSubtreeLevels(nodeB);
  }

  /**
   * Restructures the tree based on income, but only for customers.
   * @returns {Array} An array of objects detailing the swaps that occurred.
   */
  restructureTreeBasedOnIncome() {
    const performedSwaps = [];
    const maxIterations = this.allNodes.size * 2; // Safeguard
    let iterations = 0;
    let swapHappened = true;

    while (swapHappened && iterations < maxIterations) {
      iterations++;
      swapHappened = false;
      const nodesByLevel = Array.from(this.allNodes.values()).sort(
        (a, b) => b.level - a.level,
      );

      for (const node of nodesByLevel) {
        // Only consider swaps if both the node and its parent are 'customers'
        if (
          node === this.root ||
          !node.parent ||
          node.userType !== "customer" ||
          node.parent.userType !== "customer"
        ) {
          continue;
        }

        const totalIncome = node.directIncome + node.indirectIncome;
        const parentTotalIncome =
          node.parent.directIncome + node.parent.indirectIncome;

        if (totalIncome > parentTotalIncome) {
          performedSwaps.push({
            childId: node.id,
            childName: node.name,
            childIncome: totalIncome,
            parentId: node.parent.id,
            parentName: node.parent.name,
            parentIncome: parentTotalIncome,
          });

          this.swapNodes(node, node.parent);
          swapHappened = true;
          break; // Restart the check from the bottom
        }
      }
    }

    if (iterations >= maxIterations) {
      console.error(
        "Tree restructuring stopped due to exceeding maximum iterations. A logical error may exist.",
      );
    }

    return performedSwaps;
  }

  // Calculate Reward Credits based on turnover
  calculateRewardCredits(turnover) {
    let credits = 0;
    let remainingTurnover = turnover;

    // First slab: ₹0 to ₹200,000 = 10 credits
    if (remainingTurnover > 0) {
      const firstSlab = Math.min(remainingTurnover, 200000);
      if (firstSlab >= 200000) {
        credits += 10;
        remainingTurnover -= 200000;
      } else {
        return 0; // Not enough for first slab
      }
    }

    // Second slab: ₹200,001 to ₹700,000 = 15 credits
    if (remainingTurnover > 0) {
      const secondSlab = Math.min(remainingTurnover, 500000);
      if (secondSlab >= 500000) {
        credits += 15;
        remainingTurnover -= 500000;
      } else {
        return credits; // Return credits earned so far
      }
    }

    // Third slab: ₹700,001 to ₹1,700,000 = 20 credits
    if (remainingTurnover > 0) {
      const thirdSlab = Math.min(remainingTurnover, 1000000);
      if (thirdSlab >= 1000000) {
        credits += 20;
        remainingTurnover -= 1000000;
      } else {
        return credits; // Return credits earned so far
      }
    }

    // Fourth slab: Every additional ₹2,000,000 = 25 credits
    if (remainingTurnover > 0) {
      const fourthSlabCredits = Math.floor(remainingTurnover / 2000000) * 25;
      credits += fourthSlabCredits;
    }

    return credits;
  }

  // Calculate franchise turnover (only from direct children)
  calculateFranchiseTurnover(userId, franchise) {
    const user = this.allNodes.get(userId);
    if (!user) return 0;

    if (franchise === "A") {
      return user.franchiseATurnover;
    } else if (franchise === "B") {
      return user.franchiseBTurnover;
    }

    return 0;
  }

  // Update credit wallet with new credits
  updateCreditWallet(userId, credits, franchise, turnover) {
    const user = this.allNodes.get(userId);
    if (!user) return { success: false, error: "User not found" };

    const previousCredits = user.creditWallet;
    user.creditWallet += credits;

    // Add to credit history
    const creditEntry = {
      date: new Date().toLocaleDateString(),
      franchise: franchise,
      turnover: turnover,
      creditsEarned: credits,
      totalCredits: user.creditWallet,
    };

    user.creditHistory.push(creditEntry);

    return {
      success: true,
      previousCredits: previousCredits,
      currentCredits: user.creditWallet,
      creditsAdded: credits,
    };
  }

  monthlyConsolidation() {
    const allUsers = Array.from(this.allNodes.values());
    const creditAllocations = [];

    // Step 1: Calculate all indirect incomes based on balanced volume.
    allUsers.forEach((user) => {
      user.leftSubtreeSales = this.calculateSubtreeSales(user.left);
      user.rightSubtreeSales = this.calculateSubtreeSales(user.right);

      user.leftSubtreeSales += user.carryForwardLeft;
      user.rightSubtreeSales += user.carryForwardRight;

      const balancedVolume = Math.min(
        user.leftSubtreeSales,
        user.rightSubtreeSales,
      );

      // IMPORTANT FIX: Brand owners earn ONLY direct income, not indirect income
      if (balancedVolume > 0 && user.userType !== "brand_owner") {
        user.indirectIncome += balancedVolume * 0.05;
      }

      user.carryForwardLeft = user.leftSubtreeSales - balancedVolume;
      user.carryForwardRight = user.rightSubtreeSales - balancedVolume;
    });

    // Step 2: Calculate and allocate reward credits based on franchise turnover
    allUsers.forEach((user) => {
      if (user.userType === "customer") {
        // Calculate credits for Franchise A (left side)
        const creditsFromA = this.calculateRewardCredits(
          user.franchiseATurnover,
        );
        if (creditsFromA > 0) {
          const creditResult = this.updateCreditWallet(
            user.id,
            creditsFromA,
            "A",
            user.franchiseATurnover,
          );
          if (creditResult.success) {
            creditAllocations.push({
              userId: user.id,
              userName: user.name,
              franchise: "A",
              turnover: user.franchiseATurnover,
              creditsAllocated: creditsFromA,
              totalCredits: user.creditWallet,
            });
          }
        }

        // Calculate credits for Franchise B (right side)
        const creditsFromB = this.calculateRewardCredits(
          user.franchiseBTurnover,
        );
        if (creditsFromB > 0) {
          const creditResult = this.updateCreditWallet(
            user.id,
            creditsFromB,
            "B",
            user.franchiseBTurnover,
          );
          if (creditResult.success) {
            creditAllocations.push({
              userId: user.id,
              userName: user.name,
              franchise: "B",
              turnover: user.franchiseBTurnover,
              creditsAllocated: creditsFromB,
              totalCredits: user.creditWallet,
            });
          }
        }
      }
    });

    // Step 3: Perform tree restructuring based on new total incomes.
    const performedSwaps = this.restructureTreeBasedOnIncome();

    return {
      message: "Monthly consolidation completed",
      totalUsers: allUsers.length,
      swapsPerformed: performedSwaps.length,
      swapDetails: performedSwaps,
      creditAllocations: creditAllocations,
    };
  }

  calculateSubtreeSales(node) {
    if (!node) return 0;
    return (
      node.totalSales +
      this.calculateSubtreeSales(node.left) +
      this.calculateSubtreeSales(node.right)
    );
  }

  getTreeVisualization() {
    const result = [];
    const queue = [{ node: this.root, level: 0 }];

    while (queue.length > 0) {
      const { node, level } = queue.shift();

      if (!result[level]) result[level] = [];

      const directParentNode = node.directParentId
        ? this.allNodes.get(node.directParentId)
        : null;
      const logicalParentNode = node.logicalParentId
        ? this.allNodes.get(node.logicalParentId)
        : null;

      result[level].push({
        id: node.id,
        name: node.name,
        email: node.email,
        userType: node.userType,
        brandName: node.brandName || "",
        hasLeft: !!node.left,
        hasRight: !!node.right,
        leftChildId: node.left ? node.left.id : null,
        rightChildId: node.right ? node.right.id : null,
        directReferralsCount: node.directReferrals.length,
        directReferralIds: node.directReferrals,
        directParentId: node.directParentId,
        directParentName: directParentNode ? directParentNode.name : "",
        logicalParentId: node.logicalParentId,
        logicalParentName: logicalParentNode ? logicalParentNode.name : "",
        directIncome: node.directIncome,
        indirectIncome: node.indirectIncome,
        totalSales: node.totalSales,
        level: node.level,
        creditWallet: node.creditWallet,
        franchiseATurnover: node.franchiseATurnover,
        franchiseBTurnover: node.franchiseBTurnover,
        eWallet: node.eWallet || 0,
        hasMovedPosition: !!node.logicalParentId,
      });

      if (node.left) queue.push({ node: node.left, level: level + 1 });
      if (node.right) queue.push({ node: node.right, level: level + 1 });
    }

    return result;
  }

  getUserById(userId) {
    return this.allNodes.get(userId);
  }

  // New methods for dashboard functionality
  updateKYC(userId, kycData) {
    const user = this.allNodes.get(userId);
    if (!user) return { success: false, error: "User not found" };

    user.kycData = kycData;
    user.kycVerified = true;
    return { success: true };
  }

  addBankAccount(userId, bankData) {
    const user = this.allNodes.get(userId);
    if (!user) return { success: false, error: "User not found" };
    user.bankAccount = bankData;
    return { success: true };
  }

  getFranchiseA(userId) {
    const user = this.allNodes.get(userId);
    if (!user) return null;
    const getGrandchildren = (node) => {
      if (!node) return [];
      const grandchildren = [];
      if (node.left) {
        grandchildren.push({
          id: node.left.id,
          name: node.left.name,
          joinDate: node.left.joinDate,
          kycVerified: node.left.kycVerified,
          purchaseValue: node.left.totalSales,
        });
        grandchildren.push(...getGrandchildren(node.left));
      }
      if (node.right) {
        grandchildren.push({
          id: node.right.id,
          name: node.right.name,
          joinDate: node.right.joinDate,
          kycVerified: node.right.kycVerified,
          purchaseValue: node.right.totalSales,
        });
        grandchildren.push(...getGrandchildren(node.right));
      }
      return grandchildren;
    };
    return {
      direct: user.left
        ? {
            id: user.left.id,
            name: user.left.name,
            joinDate: user.left.joinDate,
            kycVerified: user.left.kycVerified,
            purchaseValue: user.left.totalSales,
          }
        : null,
      grandchildren: getGrandchildren(user.left),
    };
  }

  getFranchiseB(userId) {
    const user = this.allNodes.get(userId);
    if (!user) return null;
    const getGrandchildren = (node) => {
      if (!node) return [];
      const grandchildren = [];
      if (node.left) {
        grandchildren.push({
          id: node.left.id,
          name: node.left.name,
          joinDate: node.left.joinDate,
          kycVerified: node.left.kycVerified,
          purchaseValue: node.left.totalSales,
        });
        grandchildren.push(...getGrandchildren(node.left));
      }
      if (node.right) {
        grandchildren.push({
          id: node.right.id,
          name: node.right.name,
          joinDate: node.right.joinDate,
          kycVerified: node.right.kycVerified,
          purchaseValue: node.right.totalSales,
        });
        grandchildren.push(...getGrandchildren(node.right));
      }
      return grandchildren;
    };
    return {
      direct: user.right
        ? {
            id: user.right.id,
            name: user.right.name,
            joinDate: user.right.joinDate,
            kycVerified: user.right.kycVerified,
            purchaseValue: user.right.totalSales,
          }
        : null,
      grandchildren: getGrandchildren(user.right),
    };
  }

  getHierarchy(userId) {
    const user = this.allNodes.get(userId);
    if (!user) return null;
    let parent = null;
    if (user.directParentId) {
      const parentNode = this.allNodes.get(user.directParentId);
      if (parentNode)
        parent = {
          id: parentNode.id,
          name: parentNode.name,
          level: parentNode.level,
          kycVerified: parentNode.kycVerified,
        };
    }
    const children = [];
    if (user.left)
      children.push({
        id: user.left.id,
        name: user.left.name,
        level: user.left.level,
        kycVerified: user.left.kycVerified,
        position: "left",
      });
    if (user.right)
      children.push({
        id: user.right.id,
        name: user.right.name,
        level: user.right.level,
        kycVerified: user.right.kycVerified,
        position: "right",
      });
    return {
      parent,
      user: {
        id: user.id,
        name: user.name,
        level: user.level,
        kycVerified: user.kycVerified,
      },
      children,
    };
  }

  getFinancialData(userId) {
    const user = this.allNodes.get(userId);
    if (!user) return null;
    let franchiseAPurchaseValue = 0;
    let franchiseBPurchaseValue = 0;
    if (user.left)
      franchiseAPurchaseValue = this.calculateSubtreeSales(user.left);
    if (user.right)
      franchiseBPurchaseValue = this.calculateSubtreeSales(user.right);
    return {
      directIncome: user.directIncome,
      indirectIncome: user.indirectIncome,
      incomeWallet: user.directIncome + user.indirectIncome,
      eWallet: user.eWallet || 0,
      creditWallet: user.creditWallet,
      franchiseAPurchaseValue: franchiseAPurchaseValue,
      franchiseBPurchaseValue: franchiseBPurchaseValue,
      franchiseATurnover: user.franchiseATurnover,
      franchiseBTurnover: user.franchiseBTurnover,
      totalPayout: user.directIncome + user.indirectIncome,
    };
  }

  // Method to get credit history
  getCreditHistory(userId) {
    const user = this.allNodes.get(userId);
    if (!user) return [];
    return user.creditHistory || [];
  }

  // Method to update credit wallet balance (for external updates)
  updateCreditWalletBalance(userId, newBalance) {
    const user = this.allNodes.get(userId);
    if (!user) return { success: false, error: "User not found" };

    const previousBalance = user.creditWallet;
    user.creditWallet = newBalance;

    return {
      success: true,
      previousBalance: previousBalance,
      currentBalance: newBalance,
    };
  }

  // Method to update e-wallet balance (for external updates)
  updateEWalletBalance(userId, newBalance) {
    const user = this.allNodes.get(userId);
    if (!user) return { success: false, error: "User not found" };

    const previousBalance = user.eWallet || 0;
    user.eWallet = newBalance;

    return {
      success: true,
      previousBalance: previousBalance,
      currentBalance: newBalance,
    };
  }

  // Method to update income wallet balance (for external updates)
  updateIncomeWalletBalance(userId, newBalance) {
    const user = this.allNodes.get(userId);
    if (!user) return { success: false, error: "User not found" };

    const previousBalance = user.incomeWallet || 0;
    user.incomeWallet = newBalance;

    return {
      success: true,
      previousBalance: previousBalance,
      currentBalance: newBalance,
    };
  }

  // Product management methods for brand owners
  addProduct(userId, product) {
    const user = this.allNodes.get(userId);
    if (!user || user.userType !== "brand_owner")
      return { success: false, error: "User not found or not a brand owner" };
    if (!user.products) user.products = [];
    user.products.push(product);
    return { success: true };
  }

  updateProduct(userId, product) {
    const user = this.allNodes.get(userId);
    if (!user || user.userType !== "brand_owner")
      return { success: false, error: "User not found or not a brand owner" };
    if (!user.products) user.products = [];

    const index = user.products.findIndex((p) => p.id === product.id);
    if (index === -1) return { success: false, error: "Product not found" };

    user.products[index] = product;
    return { success: true };
  }

  deleteProduct(userId, productId) {
    const user = this.allNodes.get(userId);
    if (!user || user.userType !== "brand_owner")
      return { success: false, error: "User not found or not a brand owner" };
    if (!user.products) user.products = [];
    user.products = user.products.filter((p) => p.id !== productId);
    return { success: true };
  }

  getProducts(userId) {
    const user = this.allNodes.get(userId);
    if (!user || user.userType !== "brand_owner") return [];
    return user.products || [];
  }

  // Accessory management methods for brand owners
  addAccessory(userId, accessory) {
    const user = this.allNodes.get(userId);
    if (!user || user.userType !== "brand_owner")
      return { success: false, error: "User not found or not a brand owner" };
    if (!user.accessories) user.accessories = [];
    user.accessories.push(accessory);
    return { success: true };
  }

  updateAccessory(userId, accessory) {
    const user = this.allNodes.get(userId);
    if (!user || user.userType !== "brand_owner")
      return { success: false, error: "User not found or not a brand owner" };
    if (!user.accessories) user.accessories = [];

    const index = user.accessories.findIndex((a) => a.id === accessory.id);
    if (index === -1) return { success: false, error: "Accessory not found" };

    user.accessories[index] = accessory;
    return { success: true };
  }

  deleteAccessory(userId, accessoryId) {
    const user = this.allNodes.get(userId);
    if (!user || user.userType !== "brand_owner")
      return { success: false, error: "User not found or not a brand owner" };
    if (!user.accessories) user.accessories = [];
    user.accessories = user.accessories.filter((a) => a.id !== accessoryId);
    return { success: true };
  }

  getAccessories(userId) {
    const user = this.allNodes.get(userId);
    if (!user || user.userType !== "brand_owner") return [];
    return user.accessories || [];
  }
}

export const treeManager = new MLMTreeManager();

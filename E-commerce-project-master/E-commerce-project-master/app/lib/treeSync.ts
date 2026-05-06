// ─── Tree Sync: Bridges Firestore ↔ MLM Tree ─────────────────────────────────
// Handles saving nodes to Firestore and rebuilding the tree from Firestore
// on page refresh / new session.

import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { treeManager, TreeNode } from './mlmTree';

const COLLECTION = 'mlm_tree';

// ─── Track whether tree has been loaded this session ─────────────────────────
let treeInitialized = false;

// ─── Serialize a TreeNode into a plain Firestore-safe object ─────────────────
export function serializeNode(node: TreeNode): Record<string, unknown> {
  return {
    id:                 node.id,
    name:               node.name,
    email:              node.email,
    userType:           node.userType,
    level:              node.level,
    leftId:             node.left?.id             ?? null,
    rightId:            node.right?.id            ?? null,
    parentId:           node.parent?.id           ?? null,
    directParentId:     node.directParentId       ?? null,
    logicalParentId:    (node as any).logicalParentId ?? null,
    directReferrals:    node.directReferrals      ?? [],
    directIncome:       node.directIncome         ?? 0,
    indirectIncome:     node.indirectIncome        ?? 0,
    totalSales:         node.totalSales            ?? 0,
    leftSubtreeSales:   node.leftSubtreeSales      ?? 0,
    rightSubtreeSales:  node.rightSubtreeSales     ?? 0,
    carryForwardLeft:   node.carryForwardLeft      ?? 0,
    carryForwardRight:  node.carryForwardRight     ?? 0,
    creditWallet:       node.creditWallet          ?? 0,
    franchiseATurnover: node.franchiseATurnover    ?? 0,
    franchiseBTurnover: node.franchiseBTurnover    ?? 0,
    eWallet:            (node as any).eWallet      ?? 0,
    brandName:          (node as any).brandName    ?? null,
    mobile:             (node as any).mobile       ?? null,
    kycVerified:        (node as any).kycVerified  ?? false,
  };
}

// ─── Save a single node to Firestore (merge so we don't overwrite unrelated fields) ─
export async function saveNodeToFirestore(node: TreeNode): Promise<void> {
  await setDoc(doc(db, COLLECTION, node.id), serializeNode(node), { merge: true });
}

// ─── Save the three hardcoded founders if they don't exist yet ───────────────
export async function ensureFoundersInFirestore(): Promise<void> {
  const snap = await getDoc(doc(db, COLLECTION, 'FOUND001'));
  if (!snap.exists()) {
    for (const id of ['FOUND001', 'FOUND002', 'FOUND003']) {
      const node = treeManager.getUserById(id);
      if (node) await saveNodeToFirestore(node);
    }
  }
}

// ─── Load the entire tree from Firestore and rebuild it in memory ─────────────
// Returns true if nodes were loaded, false if collection is empty.
export async function loadTreeFromFirestore(): Promise<boolean> {
  if (treeInitialized) return true;

  const snap = await getDocs(collection(db, COLLECTION));
  if (snap.empty) {
    // First ever run — persist the hardcoded founders
    await ensureFoundersInFirestore();
    treeInitialized = true;
    return false;
  }

  // ── Step 1: Collect raw data ────────────────────────────────────────────────
  const nodesData: Record<string, Record<string, unknown>> = {};
  snap.forEach(d => { nodesData[d.id] = d.data() as Record<string, unknown>; });

  // ── Step 2: Create TreeNode instances for any ID not already in memory ──────
  for (const data of Object.values(nodesData)) {
    const id = data.id as string;
    if (treeManager.getUserById(id)) {
      // Node already in memory (e.g. hardcoded founders) — just update its data
      const existing = treeManager.getUserById(id)!;
      existing.directIncome       = (data.directIncome       as number) ?? 0;
      existing.indirectIncome     = (data.indirectIncome     as number) ?? 0;
      existing.totalSales         = (data.totalSales         as number) ?? 0;
      existing.creditWallet       = (data.creditWallet       as number) ?? 0;
      existing.franchiseATurnover = (data.franchiseATurnover as number) ?? 0;
      existing.franchiseBTurnover = (data.franchiseBTurnover as number) ?? 0;
      existing.directReferrals    = (data.directReferrals    as string[]) ?? [];
      (existing as any).eWallet   = (data.eWallet            as number) ?? 0;
      continue;
    }

    const node = new TreeNode(
      id,
      data.name    as string,
      data.email   as string,
      data.userType as string,
      data.level   as number,
    );

    node.directParentId       = (data.directParentId       as string | null) ?? null;
    (node as any).logicalParentId = (data.logicalParentId  as string | null) ?? null;
    node.directReferrals      = (data.directReferrals      as string[]) ?? [];
    node.directIncome         = (data.directIncome         as number)   ?? 0;
    node.indirectIncome       = (data.indirectIncome        as number)  ?? 0;
    node.totalSales           = (data.totalSales            as number)  ?? 0;
    node.leftSubtreeSales     = (data.leftSubtreeSales      as number)  ?? 0;
    node.rightSubtreeSales    = (data.rightSubtreeSales     as number)  ?? 0;
    node.carryForwardLeft     = (data.carryForwardLeft      as number)  ?? 0;
    node.carryForwardRight    = (data.carryForwardRight     as number)  ?? 0;
    node.creditWallet         = (data.creditWallet          as number)  ?? 0;
    node.franchiseATurnover   = (data.franchiseATurnover    as number)  ?? 0;
    node.franchiseBTurnover   = (data.franchiseBTurnover    as number)  ?? 0;
    (node as any).eWallet     = (data.eWallet               as number)  ?? 0;
    (node as any).brandName   = data.brandName   ?? null;
    (node as any).mobile      = data.mobile      ?? null;
    (node as any).kycVerified = data.kycVerified ?? false;

    // Add to manager's internal maps (they are plain Map properties)
    (treeManager as any).allNodes.set(id, node);
    (treeManager as any).usersByEmail.set(node.email, node);
  }

  // ── Step 3: Wire up left / right / parent pointers ───────────────────────
  for (const data of Object.values(nodesData)) {
    const node = treeManager.getUserById(data.id as string);
    if (!node) continue;

    if (data.leftId) {
      const left = treeManager.getUserById(data.leftId as string);
      if (left) { node.left = left; left.parent = node; }
    }
    if (data.rightId) {
      const right = treeManager.getUserById(data.rightId as string);
      if (right) { node.right = right; right.parent = node; }
    }
  }

  treeInitialized = true;
  return true;
}

// ─── Call this to force a reload (e.g. after registering a new user) ─────────
export function resetTreeInitialized(): void {
  treeInitialized = false;
}
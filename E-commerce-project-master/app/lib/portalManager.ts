export interface PortalData {
  url: string;
  brandName: string;
  logo: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface PortalResult {
  success: boolean;
  error?: string;
}

export interface PortalWithUser {
  userId: string;
  portal: PortalData;
}

class PortalManager {
  private portals: Map<string, PortalData>;

  constructor() {
    this.portals = new Map();
  }

  createPortal(userId: string, portalData: Partial<PortalData>): PortalResult {
    this.portals.set(userId, {
      ...(portalData as PortalData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  updatePortal(userId: string, portalData: Partial<PortalData>): PortalResult {
    if (!this.portals.has(userId)) {
      return { success: false, error: 'Portal not found' };
    }
    this.portals.set(userId, {
      ...this.portals.get(userId)!,
      ...portalData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  getPortal(userId: string): PortalData | null {
    return this.portals.get(userId) || null;
  }

  getPortalByUrl(url: string): PortalWithUser | null {
    for (const [userId, portal] of this.portals.entries()) {
      if (portal.url === url) return { userId, portal };
    }
    return null;
  }

  getPortalUrl(userId: string): string | null {
    const portal = this.portals.get(userId);
    return portal ? portal.url : null;
  }
}

export const portalManager = new PortalManager();

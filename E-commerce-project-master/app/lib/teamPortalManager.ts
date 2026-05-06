export interface TeamPortalData {
  url: string;
  brandName: string;
  logo: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface TeamPortalResult {
  success: boolean;
  error?: string;
}

class TeamPortalManager {
  private teamPortals: Map<string, TeamPortalData>;

  constructor() {
    this.teamPortals = new Map();
  }

  createPortal(userId: string, portalData: Partial<TeamPortalData>): TeamPortalResult {
    this.teamPortals.set(userId, {
      ...(portalData as TeamPortalData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  updatePortal(userId: string, portalData: Partial<TeamPortalData>): TeamPortalResult {
    if (!this.teamPortals.has(userId)) {
      return { success: false, error: 'Portal not found' };
    }
    this.teamPortals.set(userId, {
      ...this.teamPortals.get(userId)!,
      ...portalData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  getPortal(userId: string): TeamPortalData | null {
    return this.teamPortals.get(userId) || null;
  }

  getPortalUrl(userId: string): string | null {
    const portal = this.teamPortals.get(userId);
    return portal ? portal.url : null;
  }
}

export const teamPortalManager = new TeamPortalManager();

const Portal = require('../models/Portal');

// ─── Create Portal ──────────────────────────────────────────────────
exports.createPortal = async (req, res) => {
  try {
    const { portalType, url, brandName, logo, description, settings } = req.body;

    // One portal per user — find by userId only (unique constraint)
    const existing = await Portal.findOne({ userId: req.userId });
    if (existing) {
      // Update existing portal instead of creating a new one
      existing.url = url || existing.url;
      existing.brandName = brandName || existing.brandName;
      existing.portalType = portalType || existing.portalType;
      existing.logo = logo !== undefined ? logo : existing.logo;
      existing.description = description || existing.description;
      existing.settings = settings || existing.settings;
      await existing.save();
      return res.json({ success: true, portal: existing, updated: true });
    }

    const portal = new Portal({
      userId: req.userId,
      portalType: portalType || 'customer',
      url,
      brandName: brandName || '',
      logo: logo || null,
      description: description || '',
      settings: settings || {},
    });

    await portal.save();
    return res.status(201).json({ success: true, portal });
  } catch (error) {
    console.error('Create portal error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create portal.' });
  }
};

// ─── Get My Portals ─────────────────────────────────────────────────
exports.getMyPortals = async (req, res) => {
  try {
    const portals = await Portal.find({ userId: req.userId });
    return res.json({ success: true, portals, userId: req.userId });
  } catch (error) {
    console.error('Get portals error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch portals.' });
  }
};

// ─── Get Portal by URL ─────────────────────────────────────────────
exports.getPortalByUrl = async (req, res) => {
  try {
    const portal = await Portal.findOne({ url: req.params.url });
    if (!portal) {
      return res.status(404).json({ success: false, error: 'Portal not found.' });
    }
    return res.json({ success: true, portal });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch portal.' });
  }
};

// ─── Update Portal ──────────────────────────────────────────────────
exports.updatePortal = async (req, res) => {
  try {
    const portal = await Portal.findById(req.params.id);
    if (!portal) {
      return res.status(404).json({ success: false, error: 'Portal not found.' });
    }
    if (portal.userId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }

    const { url, brandName, logo, description, settings } = req.body;
    if (url) portal.url = url;
    if (brandName) portal.brandName = brandName;
    if (logo !== undefined) portal.logo = logo;
    if (description) portal.description = description;
    if (settings) portal.settings = settings;

    await portal.save();
    return res.json({ success: true, portal });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update portal.' });
  }
};

// ─── Delete Portal ──────────────────────────────────────────────────
exports.deletePortal = async (req, res) => {
  try {
    const portal = await Portal.findById(req.params.id);
    if (!portal) {
      return res.status(404).json({ success: false, error: 'Portal not found.' });
    }
    if (portal.userId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }

    await Portal.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Portal deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete portal.' });
  }
};

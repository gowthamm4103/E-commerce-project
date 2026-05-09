const Portal = require('../models/Portal');

// ─── Create Portal ──────────────────────────────────────────────────
exports.createPortal = async (req, res) => {
  try {
    console.log('=== Create Portal Request ===');
    console.log('userId:', req.userId);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { 
      portalType, 
      url, 
      brandName, 
      logo, 
      description, 
      settings,
      theme,
      brandTagline,
      facebookUrl,
      linkedInUrl,
      instagramUrl,
      twitterUrl
    } = req.body;

    // Log the specific values we're trying to save
    console.log('Values to save:', {
      brandTagline: brandTagline,
      facebookUrl: facebookUrl,
      linkedInUrl: linkedInUrl,
      instagramUrl: instagramUrl,
      twitterUrl: twitterUrl
    });

    // One portal per user — find by userId only (unique constraint)
    const existing = await Portal.findOne({ userId: req.userId });
    if (existing) {
      console.log('Updating existing portal:', existing._id);
      
      // Use findOneAndUpdate for more reliable updates
      const updateData = {
        portalType: portalType !== undefined ? portalType : existing.portalType,
        url: url !== undefined ? url : existing.url,
        brandName: brandName !== undefined ? brandName : existing.brandName,
        logo: logo !== undefined ? logo : existing.logo,
        description: description !== undefined ? description : existing.description,
        settings: settings !== undefined ? settings : existing.settings,
        theme: theme !== undefined ? theme : existing.theme,
        brandTagline: brandTagline !== undefined ? brandTagline : existing.brandTagline,
        facebookUrl: facebookUrl !== undefined ? facebookUrl : existing.facebookUrl,
        linkedInUrl: linkedInUrl !== undefined ? linkedInUrl : existing.linkedInUrl,
        instagramUrl: instagramUrl !== undefined ? instagramUrl : existing.instagramUrl,
        twitterUrl: twitterUrl !== undefined ? twitterUrl : existing.twitterUrl
      };
      
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const updatedPortal = await Portal.findOneAndUpdate(
        { userId: req.userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      console.log('Portal updated successfully:', updatedPortal._id);
      console.log('Updated portal values:', {
        brandTagline: updatedPortal.brandTagline,
        facebookUrl: updatedPortal.facebookUrl,
        linkedInUrl: updatedPortal.linkedInUrl,
        instagramUrl: updatedPortal.instagramUrl,
        twitterUrl: updatedPortal.twitterUrl
      });
      
      return res.json({ success: true, portal: updatedPortal, updated: true });
    }

    // Create new portal with all fields explicitly set
    const portal = new Portal({
      userId: req.userId,
      portalType: portalType || 'customer',
      url: url || '',
      brandName: brandName || '',
      logo: logo || null,
      description: description || '',
      settings: settings || {},
      theme: theme || 'white',
      brandTagline: brandTagline || '',
      facebookUrl: facebookUrl || '',
      linkedInUrl: linkedInUrl || '',
      instagramUrl: instagramUrl || '',
      twitterUrl: twitterUrl || '',
    });

    console.log('Creating new portal with values:', {
      brandTagline: portal.brandTagline,
      facebookUrl: portal.facebookUrl,
      linkedInUrl: portal.linkedInUrl,
      instagramUrl: portal.instagramUrl,
      twitterUrl: portal.twitterUrl
    });

    await portal.save();
    console.log('Portal created successfully:', portal._id);
    console.log('Saved portal values:', {
      brandTagline: portal.brandTagline,
      facebookUrl: portal.facebookUrl,
      linkedInUrl: portal.linkedInUrl,
      instagramUrl: portal.instagramUrl,
      twitterUrl: portal.twitterUrl
    });
    return res.status(201).json({ success: true, portal });
  } catch (error) {
    console.error('Create portal error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create portal.' });
  }
};

// ─── Get My Portals ─────────────────────────────────────────────────
exports.getMyPortals = async (req, res) => {
  try {
    console.log('=== Get My Portals Request ===');
    console.log('userId:', req.userId);
    const portals = await Portal.find({ userId: req.userId });
    console.log('Found portals:', portals.length);
    if (portals.length > 0) {
      console.log('First portal data:', {
        _id: portals[0]._id,
        brandTagline: portals[0].brandTagline,
        facebookUrl: portals[0].facebookUrl,
        linkedInUrl: portals[0].linkedInUrl,
        instagramUrl: portals[0].instagramUrl,
        twitterUrl: portals[0].twitterUrl
      });
    }
    return res.json({ success: true, portals, userId: req.userId });
  } catch (error) {
    console.error('Get portals error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch portals.' });
  }
};

// ─── Get Portal by URL ─────────────────────────────────────────────
exports.getPortalByUrl = async (req, res) => {
  try {
    console.log('=== Get Portal by URL Request ===');
    console.log('URL param:', req.params.url);
    const portal = await Portal.findOne({ url: req.params.url });
    if (!portal) {
      console.log('Portal not found for URL:', req.params.url);
      return res.status(404).json({ success: false, error: 'Portal not found.' });
    }
    console.log('Portal found:', {
      _id: portal._id,
      brandTagline: portal.brandTagline,
      facebookUrl: portal.facebookUrl,
      linkedInUrl: portal.linkedInUrl,
      instagramUrl: portal.instagramUrl,
      twitterUrl: portal.twitterUrl
    });
    return res.json({ success: true, portal });
  } catch (error) {
    console.error('Get portal by URL error:', error);
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

    const { 
      url, 
      brandName, 
      logo, 
      description, 
      settings,
      theme,
      brandTagline,
      facebookUrl,
      linkedInUrl,
      instagramUrl,
      twitterUrl
    } = req.body;
    
    if (url) portal.url = url;
    if (brandName) portal.brandName = brandName;
    if (logo !== undefined) portal.logo = logo;
    if (description) portal.description = description;
    if (settings) portal.settings = settings;
    if (theme !== undefined) portal.theme = theme;
    if (brandTagline !== undefined) portal.brandTagline = brandTagline;
    if (facebookUrl !== undefined) portal.facebookUrl = facebookUrl;
    if (linkedInUrl !== undefined) portal.linkedInUrl = linkedInUrl;
    if (instagramUrl !== undefined) portal.instagramUrl = instagramUrl;
    if (twitterUrl !== undefined) portal.twitterUrl = twitterUrl;

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
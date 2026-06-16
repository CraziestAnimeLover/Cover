import Banner from '../models/Banner.js';
import cloudinary from '../config/cloudinary.js';

// Create banner (admin)
export const createBanner = async (req, res) => {
  try {
    const { title, link, order, isActive } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image required' });

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'banners' });
    const banner = await Banner.create({
      title,
      imageUrl: result.secure_url,
      link: link || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all banners (admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort('order');
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active banners (public)
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort('order');
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update banner (admin)
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, order, isActive } = req.body;
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    if (req.file) {
      // Delete old image from Cloudinary
      if (banner.imageUrl) {
        const publicId = banner.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`banners/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'banners' });
      banner.imageUrl = result.secure_url;
    }
    banner.title = title || banner.title;
    banner.link = link !== undefined ? link : banner.link;
    banner.order = order !== undefined ? order : banner.order;
    banner.isActive = isActive !== undefined ? isActive : banner.isActive;
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete banner (admin)
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    if (banner.imageUrl) {
      const publicId = banner.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`banners/${publicId}`);
    }
    await banner.deleteOne();
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reorder banners (admin)
export const reorderBanners = async (req, res) => {
  try {
    const { ids } = req.body; // array of banner IDs in the new order
    for (let i = 0; i < ids.length; i++) {
      await Banner.findByIdAndUpdate(ids[i], { order: i });
    }
    res.json({ message: 'Banners reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
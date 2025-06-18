const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all press kits for current musician
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pressKits = await req.prisma.pressKit.findMany({
      where: { musicianId: req.user.musicianId },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(pressKits);
  } catch (error) {
    console.error('Get press kits error:', error);
    res.status(500).json({ message: 'Server error fetching press kits' });
  }
});

// Get a specific press kit by ID
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid press kit ID')],
  authenticateToken,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      const pressKit = await req.prisma.pressKit.findUnique({
        where: { id },
        include: {
          mediaItems: true,
          socialLinks: true,
          events: true,
          testimonials: true,
          contacts: true
        }
      });

      if (!pressKit) {
        return res.status(404).json({ message: 'Press kit not found' });
      }

      // Check if user has access to this press kit
      if (pressKit.musicianId !== req.user.musicianId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.status(200).json(pressKit);
    } catch (error) {
      console.error('Get press kit error:', error);
      res.status(500).json({ message: 'Server error fetching press kit' });
    }
  }
);

// Create a new press kit
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional(),
    body('theme').optional(),
    body('isPublic').isBoolean().optional()
  ],
  authenticateToken,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, theme, isPublic } = req.body;

    try {
      const pressKit = await req.prisma.pressKit.create({
        data: {
          title,
          description: description || '',
          theme: theme || 'default',
          isPublic: isPublic || false,
          musician: {
            connect: { id: req.user.musicianId }
          }
        }
      });

      res.status(201).json(pressKit);
    } catch (error) {
      console.error('Create press kit error:', error);
      res.status(500).json({ message: 'Server error creating press kit' });
    }
  }
);

// Update a press kit
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid press kit ID'),
    body('title').optional(),
    body('description').optional(),
    body('theme').optional(),
    body('isPublic').isBoolean().optional()
  ],
  authenticateToken,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = {};

    // Only include fields that are provided
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.theme !== undefined) updateData.theme = req.body.theme;
    if (req.body.isPublic !== undefined) updateData.isPublic = req.body.isPublic;

    try {
      // Check if press kit exists and belongs to this musician
      const existingPressKit = await req.prisma.pressKit.findUnique({
        where: { id }
      });

      if (!existingPressKit) {
        return res.status(404).json({ message: 'Press kit not found' });
      }

      if (existingPressKit.musicianId !== req.user.musicianId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Update press kit
      const updatedPressKit = await req.prisma.pressKit.update({
        where: { id },
        data: updateData
      });

      res.status(200).json(updatedPressKit);
    } catch (error) {
      console.error('Update press kit error:', error);
      res.status(500).json({ message: 'Server error updating press kit' });
    }
  }
);

// Delete a press kit
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid press kit ID')],
  authenticateToken,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      // Check if press kit exists and belongs to this musician
      const existingPressKit = await req.prisma.pressKit.findUnique({
        where: { id }
      });

      if (!existingPressKit) {
        return res.status(404).json({ message: 'Press kit not found' });
      }

      if (existingPressKit.musicianId !== req.user.musicianId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Delete related records first
      await req.prisma.$transaction([
        req.prisma.mediaItem.deleteMany({ where: { pressKitId: id } }),
        req.prisma.socialLink.deleteMany({ where: { pressKitId: id } }),
        req.prisma.event.deleteMany({ where: { pressKitId: id } }),
        req.prisma.testimonial.deleteMany({ where: { pressKitId: id } }),
        req.prisma.contact.deleteMany({ where: { pressKitId: id } }),
        req.prisma.analytic.deleteMany({ where: { pressKitId: id } }),
        req.prisma.pressKit.delete({ where: { id } })
      ]);

      res.status(200).json({ message: 'Press kit deleted successfully' });
    } catch (error) {
      console.error('Delete press kit error:', error);
      res.status(500).json({ message: 'Server error deleting press kit' });
    }
  }
);

// Duplicate a press kit
router.post(
  '/:id/duplicate',
  [param('id').isUUID().withMessage('Invalid press kit ID')],
  authenticateToken,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      // Get the press kit to duplicate with all related data
      const sourcePressKit = await req.prisma.pressKit.findUnique({
        where: { id },
        include: {
          mediaItems: true,
          socialLinks: true,
          events: true,
          testimonials: true,
          contacts: true
        }
      });

      if (!sourcePressKit) {
        return res.status(404).json({ message: 'Press kit not found' });
      }

      if (sourcePressKit.musicianId !== req.user.musicianId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Create a new press kit with copied data
      const newPressKit = await req.prisma.pressKit.create({
        data: {
          title: `${sourcePressKit.title} (Copy)`,
          description: sourcePressKit.description,
          theme: sourcePressKit.theme,
          isPublic: false, // Always set new copy to private initially
          musician: {
            connect: { id: req.user.musicianId }
          }
        }
      });

      // Copy related data
      if (sourcePressKit.mediaItems.length > 0) {
        await req.prisma.mediaItem.createMany({
          data: sourcePressKit.mediaItems.map(item => ({
            pressKitId: newPressKit.id,
            type: item.type,
            title: item.title,
            description: item.description,
            fileUrl: item.fileUrl,
            thumbnailUrl: item.thumbnailUrl,
            externalUrl: item.externalUrl,
            order: item.order
          }))
        });
      }

      if (sourcePressKit.socialLinks.length > 0) {
        await req.prisma.socialLink.createMany({
          data: sourcePressKit.socialLinks.map(link => ({
            pressKitId: newPressKit.id,
            platform: link.platform,
            url: link.url
          }))
        });
      }

      if (sourcePressKit.events.length > 0) {
        await req.prisma.event.createMany({
          data: sourcePressKit.events.map(event => ({
            pressKitId: newPressKit.id,
            name: event.name,
            venue: event.venue,
            city: event.city,
            country: event.country,
            date: event.date,
            description: event.description,
            ticketUrl: event.ticketUrl
          }))
        });
      }

      if (sourcePressKit.testimonials.length > 0) {
        await req.prisma.testimonial.createMany({
          data: sourcePressKit.testimonials.map(testimonial => ({
            pressKitId: newPressKit.id,
            quote: testimonial.quote,
            author: testimonial.author,
            source: testimonial.source,
            date: testimonial.date
          }))
        });
      }

      if (sourcePressKit.contacts.length > 0) {
        await req.prisma.contact.createMany({
          data: sourcePressKit.contacts.map(contact => ({
            pressKitId: newPressKit.id,
            name: contact.name,
            role: contact.role,
            email: contact.email,
            phone: contact.phone
          }))
        });
      }

      res.status(201).json({
        message: 'Press kit duplicated successfully',
        pressKit: newPressKit
      });
    } catch (error) {
      console.error('Duplicate press kit error:', error);
      res.status(500).json({ message: 'Server error duplicating press kit' });
    }
  }
);

// Get a public press kit by ID (no auth required)
router.get('/public/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pressKit = await req.prisma.pressKit.findUnique({
      where: { id },
      include: {
        mediaItems: true,
        socialLinks: true,
        events: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          }
        },
        testimonials: true,
        contacts: true,
        musician: {
          select: {
            stageName: true,
            bio: true,
            location: true,
            website: true
          }
        }
      }
    });

    if (!pressKit) {
      return res.status(404).json({ message: 'Press kit not found' });
    }

    // Check if press kit is public
    if (!pressKit.isPublic) {
      return res.status(403).json({ message: 'This press kit is not publicly available' });
    }

    // Record view analytics
    await req.prisma.analytic.create({
      data: {
        pressKit: {
          connect: { id }
        },
        visitorIp: req.ip,
        referrer: req.get('Referrer') || '',
        userAgent: req.get('User-Agent') || ''
      }
    });

    res.status(200).json(pressKit);
  } catch (error) {
    console.error('Get public press kit error:', error);
    res.status(500).json({ message: 'Server error fetching press kit' });
  }
});

module.exports = router;
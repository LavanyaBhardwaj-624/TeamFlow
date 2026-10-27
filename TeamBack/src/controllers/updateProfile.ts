import { type Request, type Response } from 'express';
import { db } from '../prisma/db.ts';

const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ success: false, error: { message: 'Authentication required' } }); return; }
  const { name, title, description, image } = req.body ?? {};
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) { res.status(400).json({ success: false, error: { message: 'Name is required' } }); return; }
  if (title !== undefined && (typeof title !== 'string' || title.length > 100)) { res.status(400).json({ success: false, error: { message: 'Invalid title' } }); return; }
  if (description !== undefined && (typeof description !== 'string' || description.length > 1000)) { res.status(400).json({ success: false, error: { message: 'Invalid description' } }); return; }
  let imageUrl = image;
  if (typeof image === 'string' && image.startsWith('data:')) {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) { res.status(503).json({ success: false, error: { message: 'Cloudinary is not configured' } }); return; }
    const form = new FormData();
    form.append('file', image);
    form.append('upload_preset', preset);
    const uploaded = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
    if (!uploaded.ok) { res.status(502).json({ success: false, error: { message: 'Profile image upload failed' } }); return; }
    const payload = await uploaded.json() as { secure_url?: string };
    imageUrl = payload.secure_url;
  }
  await db.orm.public.User.where({ id: userId }).update({
    ...(name !== undefined ? { name: name.trim() } : {}),
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(description !== undefined ? { description: description.trim() } : {}),
    ...(imageUrl !== undefined ? { imageUrl } : {}),
  });
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) { res.status(404).json({ success: false, error: { message: 'User not found' } }); return; }
  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, title: user.title, description: user.description, image: user.imageUrl, createdAt: user.createdAt } } });
};

export default updateProfile;

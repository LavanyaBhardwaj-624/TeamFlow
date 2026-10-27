import React, { useEffect, useState } from 'react';
import { Check, Mail, Save, User as UserIcon, Upload } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { authService } from '@/services/auth.service';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { workspace, role } = useCurrentWorkspace();
  const [name, setName] = useState(user?.name ?? '');
  const [title, setTitle] = useState(user?.title ?? '');
  const [description, setDescription] = useState(user?.description ?? '');
  const [image, setImage] = useState(user?.image ?? '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  useEffect(() => { setName(user?.name ?? ''); setTitle(user?.title ?? ''); setDescription(user?.description ?? ''); setImage(user?.image ?? ''); }, [user]);
  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') setImage(reader.result); }; reader.readAsDataURL(file); };
  const handleUpdate = async (event: React.FormEvent) => { event.preventDefault(); const response = await authService.updateProfile({ name, title, description, image }); setUser(response.data); setSavedSuccess(true); setTimeout(() => setSavedSuccess(false), 2500); };
  return <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8"><div className="pb-2 border-b border-line"><h1 className="text-2xl font-bold text-ink font-heading">User Profile</h1><p className="mt-1 text-sm text-ink-muted">Manage your account profile and avatar.</p></div>{savedSuccess && <div className="flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/10 p-3 text-xs text-brand"><Check className="w-4 h-4" />Profile updated successfully.</div>}<div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-6"><div className="flex items-center gap-4 pb-4 border-b border-line"><Avatar name={user?.name ?? 'User'} src={image} size="xl" /><div><h2 className="text-lg font-bold text-ink">{user?.name}</h2><p className="text-xs text-ink-muted">{user?.email}</p><div className="mt-2 flex gap-2"><Badge variant="primary" size="sm">{user?.title}</Badge>{workspace && <Badge variant={role === 'ADMIN' ? 'roleAdmin' : 'roleMember'} size="sm">{role}</Badge>}</div></div></div><form onSubmit={handleUpdate} className="space-y-4"><label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-xs text-ink"><Upload className="h-4 w-4" />Upload profile picture<input type="file" accept="image/*" className="hidden" onChange={handleImage} /></label><Input label="Full Name" value={name} onChange={(event) => setName(event.target.value)} leftIcon={<UserIcon className="w-4 h-4" />} /><Input label="Email Address" value={user?.email ?? ''} disabled leftIcon={<Mail className="w-4 h-4" />} /><Input label="Job Title" value={title} onChange={(event) => setTitle(event.target.value)} /><Textarea label="Skills & abilities" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} /><div className="flex justify-end"><Button type="submit" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>Save Profile</Button></div></form></div></div>;
};

import React, { useEffect, useMemo, useState } from 'react';
import { Hash, Lock, MessageSquare, Plus, Radio, Send, Users, Check, X } from 'lucide-react';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { socket, useSocket } from '@/lib/socket';
import { chatService, type Channel, type ChatMessage, type JoinRequestGroup } from '@/services/chat.service';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const senderName = (message: ChatMessage) => message.sender?.name || message.sender?.email || 'Team member';

export const ChatPage: React.FC = () => {
  const { workspace, isAdmin } = useCurrentWorkspace();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { isConnected } = useSocket();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [requests, setRequests] = useState<JoinRequestGroup[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [showRequests, setShowRequests] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [channelMembers, setChannelMembers] = useState<Array<{ memberId: string; role: string }>>([]);
  const [newChannel, setNewChannel] = useState({ name: '', description: '', type: 'PUBLIC' as Channel['type'] });
  const activeChannel = channels.find((channel) => channel.id === activeChannelId);
  const isMember = Boolean(activeChannel?.joined);
  const isOwner = channelMembers.some((member) => member.memberId === user?.id && member.role.toUpperCase() === 'OWNER');
  const availableMembers = (workspace?.members ?? []).filter((member: any) => !channelMembers.some((channelMember) => channelMember.memberId === member.userId));
  const grouped = useMemo(() => ({ private: channels.filter((c) => c.type === 'PRIVATE'), public: channels.filter((c) => c.type === 'PUBLIC') }), [channels]);
  const resolveMessage = (message: ChatMessage): ChatMessage => {
    if (message.sender?.name || message.sender?.email) return message;
    const workspaceMember = (workspace?.members ?? []).find((member: any) => member.userId === message.senderId);
    const sender = message.senderId === user?.id ? user : workspaceMember?.user;
    if (!sender) return message;
    return { ...message, sender: { id: sender.id || message.senderId || undefined, name: sender.name, email: sender.email, imageUrl: sender.image  } }; // || sender.imageUrl}
  };
  const isOwnMessage = (message: ChatMessage) => message.senderId === user?.id || message.sender?.id === user?.id;

  const refreshChannels = async () => {
    if (!activeWorkspaceId) return;
    const response = await chatService.listChannels(activeWorkspaceId);
    const result = response.map((item) => item.channel);
    setChannels(result);
    setActiveChannelId((current) => current && result.some((c) => c.id === current) ? current : result[0]?.id);
  };
  useEffect(() => { void refreshChannels(); }, [activeWorkspaceId]);
  useEffect(() => { if (activeWorkspaceId && socket.connected) socket.emit('workspace:join', activeWorkspaceId); }, [activeWorkspaceId, isConnected]);
  useEffect(() => {
    const onChannel = (channel: Channel) => setChannels((current) => current.some((c) => c.id === channel.id) ? current.map((c) => c.id === channel.id ? { ...c, ...channel } : c) : [...current, channel]);
    const onDeleted = ({ id }: { id: string }) => { setChannels((current) => current.filter((c) => c.id !== id)); setActiveChannelId((current) => current === id ? undefined : current); };
    const onMessage = (message: ChatMessage) => setMessages((current) => {
      const nextMessage = resolveMessage(message);
      const existing = current.findIndex((item) => item.id === nextMessage.id);
      if (existing < 0) return [...current, nextMessage];
      return current.map((item, index) => index === existing ? { ...item, ...nextMessage, sender: nextMessage.sender || item.sender } : item);
    });
    const onEdited = (message: ChatMessage) => setMessages((current) => current.map((m) => m.id === message.id ? { ...m, ...resolveMessage(message) } : m));
    const onDeletedMessage = ({ id }: { id: string }) => setMessages((current) => current.map((m) => m.id === id ? { ...m, deletedAt: new Date().toISOString(), content: 'Message deleted' } : m));
    socket.on('channel:created', onChannel); socket.on('channel:updated', onChannel); socket.on('channel:deleted', onDeleted);
    socket.on('message:new', onMessage); socket.on('message:edited', onEdited); socket.on('message:deleted', onDeletedMessage);
    socket.on('member:joined', refreshChannels); socket.on('member:left', refreshChannels); socket.on('member:removed', refreshChannels); socket.on('member:added', refreshChannels);
    socket.on('join-request:new', () => setRequestCount((count) => count + 1)); socket.on('join-request:resolved', () => setRequestCount((count) => Math.max(0, count - 1)));
    return () => { socket.off('channel:created', onChannel); socket.off('channel:updated', onChannel); socket.off('channel:deleted', onDeleted); socket.off('message:new', onMessage); socket.off('message:edited', onEdited); socket.off('message:deleted', onDeletedMessage); socket.off('member:joined', refreshChannels); socket.off('member:left', refreshChannels); socket.off('member:removed', refreshChannels); socket.off('member:added', refreshChannels); socket.off('join-request:new'); socket.off('join-request:resolved'); };
  }, [activeWorkspaceId, user?.id, workspace?.members]);
  useEffect(() => {
    if (!activeChannelId || !isMember) { setMessages([]); return; }
    socket.emit('channel:join', activeChannelId);
    void chatService.getMembers(activeChannelId).then(setChannelMembers);
    void chatService.getMessages(activeChannelId).then((items) => setMessages(items.map(resolveMessage)));
    return () => { socket.emit('channel:leave', activeChannelId); };
  }, [activeChannelId, isMember]);

  const join = async () => { if (!activeChannel) return; if (activeChannel.type === 'PUBLIC') await chatService.joinPublic(activeChannel.id); else await chatService.requestPrivate(activeChannel.id); await refreshChannels(); };
  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim() || !activeChannelId) return;
    const message = await chatService.postMessage(activeChannelId, inputValue.trim());
    if (message) setMessages((current) => {
      const nextMessage = resolveMessage({ ...message, senderId: message.senderId || user?.id });
      const existing = current.findIndex((item) => item.id === nextMessage.id);
      if (existing < 0) return [...current, nextMessage];
      return current.map((item, index) => index === existing ? { ...item, ...nextMessage, sender: nextMessage.sender || item.sender } : item);
    });
    setInputValue('');
  };
  const createChannel = async (event: React.FormEvent) => { event.preventDefault(); if (!activeWorkspaceId || !newChannel.name.trim()) return; await chatService.createChannel(activeWorkspaceId, newChannel); setNewChannel({ name: '', description: '', type: 'PUBLIC' }); setShowCreate(false); await refreshChannels(); };
  const loadRequests = async () => { try { const result = await chatService.getJoinRequests(); setRequests(result); setRequestCount(result.reduce((total, group) => total + group.pendingRequests.length, 0)); setShowRequests(true); } catch (err) { window.alert(err instanceof Error ? err.message : 'Failed to load join requests.'); } };
  const addMember = async (memberId: string) => { if (!activeChannelId) return; try { await chatService.addMember(activeChannelId, memberId); setChannelMembers(await chatService.getMembers(activeChannelId)); } catch (err) { window.alert(err instanceof Error ? err.message : 'Failed to add member.'); } };
  const channelButton = (channel: Channel) => <button key={channel.id} type="button" onClick={() => setActiveChannelId(channel.id)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${channel.id === activeChannelId ? 'bg-brand/10 text-brand font-semibold' : 'text-ink-muted hover:bg-surface-secondary hover:text-ink'}`}><Hash className="w-3.5 h-3.5 shrink-0" /><span className="hidden truncate sm:inline">{channel.name}</span>{channel.joined ? <Check className="ml-auto h-3 w-3 text-brand" /> : <Lock className="ml-auto h-3 w-3 text-ink-subtle" />}</button>;

  return <div className="flex h-full overflow-hidden">
    <div className="w-14 shrink-0 border-r border-line bg-surface/70 flex flex-col select-none sm:w-64">
      <div className="p-4 border-b border-line flex items-center justify-between"><div className="min-w-0"><h2 className="hidden text-xs font-bold uppercase tracking-wider text-ink font-heading sm:block">Channels</h2><p className="hidden text-[11px] text-ink-muted truncate sm:block">{workspace?.name || 'Workspace'}</p></div><div className="flex items-center gap-1"><Badge variant="secondary" size="sm" className="hidden sm:inline-flex">Beta</Badge><button type="button" onClick={() => setShowCreate(true)} title="Create channel" className="rounded p-1 text-ink-muted hover:text-brand"><Plus className="h-4 w-4" /></button>{isAdmin && <button type="button" onClick={loadRequests} title="Join requests" className="relative rounded p-1 text-ink-muted hover:text-brand"><MessageSquare className="h-4 w-4" />{requestCount > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand" />}</button>}</div></div>
      <div className="flex-1 overflow-y-auto p-2 space-y-4"><section><div className="mb-1 flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-subtle"><Lock className="h-3 w-3" />Private</div>{grouped.private.map(channelButton)}</section><section><div className="mb-1 flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-subtle"><Hash className="h-3 w-3" />Public</div>{grouped.public.map(channelButton)}</section></div>
      <div className="p-3 border-t border-line text-[11px] text-ink-muted flex items-center gap-1.5"><Radio className={`w-3 h-3 ${isConnected ? 'text-brand' : 'text-amber-500'}`} /><span className="hidden sm:inline">{isConnected ? 'connected' : 'offline'}</span></div>
    </div>
    <div className="flex-1 flex flex-col min-w-0 bg-surface">
      {!activeChannel ? <div className="flex flex-1 items-center justify-center bg-[#0f1115] text-xs text-ink-subtle">Select a channel to start chatting</div> : <><div className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-3 sm:px-6"><div className="flex items-center gap-2 min-w-0"><Hash className="w-4 h-4 text-ink-muted" /><h3 className="text-sm font-semibold text-ink truncate font-heading">{activeChannel.name}</h3><span className="text-xs text-ink-muted truncate hidden sm:inline">{activeChannel.description || activeChannel.desciption}</span></div><div className="flex items-center gap-2 text-xs text-ink-muted"><Users className="w-4 h-4 text-ink-subtle" /><span>{channelMembers.length} members</span>{isOwner && <Button size="sm" variant="secondary" onClick={() => setShowAddMembers(true)}>Add members</Button>}</div></div>
        {!isMember ? <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"><Lock className="h-8 w-8 text-ink-subtle" /><p className="max-w-sm text-xs text-ink-muted">{activeChannel.type === 'PRIVATE' ? 'This is a private channel. You must send a request to the admin to join.' : 'You are not part of this channel. Join to see messages.'}</p><Button size="sm" onClick={join}>{activeChannel.type === 'PRIVATE' ? 'Request to join' : 'Join'}</Button></div> : <><div className="flex-1 overflow-y-auto p-3 space-y-5 sm:p-6"><div className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-muted bg-surface-secondary/30"><p className="font-semibold text-ink">Welcome to #{activeChannel.name}!</p></div>{messages.map((message) => <div key={message.id} className={`flex items-start gap-3 group ${isOwnMessage(message) ? 'flex-row-reverse text-right' : 'text-left'}`}><Avatar name={senderName(message)} src={message.sender?.imageUrl} size="md" /><div className="min-w-0 max-w-[80%]"><div className={`flex flex-wrap items-baseline gap-x-2 ${isOwnMessage(message) ? 'justify-end' : ''}`}><span className="text-xs font-semibold text-ink">{senderName(message)}</span><span className="text-[10px] text-ink-subtle">{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span></div><div className={`mt-1 text-xs leading-relaxed ${message.deletedAt ? 'italic text-ink-subtle' : 'text-ink'}`}>{message.content}</div></div></div>)}</div><div className="p-4 border-t border-line bg-surface"><form onSubmit={sendMessage} className="flex items-center gap-2 rounded-xl border border-line bg-surface-secondary/50 p-1.5 focus-within:border-brand"><input type="text" placeholder={`Message #${activeChannel.name}...`} value={inputValue} onChange={(event) => setInputValue(event.target.value)} className="flex-1 bg-transparent px-2 py-1 text-xs text-ink placeholder:text-ink-subtle focus:outline-none" /><Button size="sm" type="submit" disabled={!inputValue.trim()}><Send className="w-3.5 h-3.5" /></Button></form></div></>}</>}
    </div>
    {showCreate && <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"><form onSubmit={createChannel} className="w-full max-w-sm space-y-3 rounded-xl border border-line bg-surface p-5"><div className="flex items-center justify-between"><h3 className="font-heading text-sm font-semibold text-ink">Create channel</h3><button type="button" onClick={() => setShowCreate(false)}><X className="h-4 w-4 text-ink-muted" /></button></div><input required minLength={5} placeholder="Channel name" value={newChannel.name} onChange={(event) => setNewChannel({ ...newChannel, name: event.target.value })} className="w-full rounded border border-line bg-surface-secondary p-2 text-xs text-ink" /><textarea placeholder="Description" value={newChannel.description} onChange={(event) => setNewChannel({ ...newChannel, description: event.target.value })} className="w-full rounded border border-line bg-surface-secondary p-2 text-xs text-ink" /><select value={newChannel.type} onChange={(event) => setNewChannel({ ...newChannel, type: event.target.value as Channel['type'] })} className="w-full rounded border border-line bg-surface-secondary p-2 text-xs text-ink"><option value="PUBLIC">Public</option>{isAdmin && <option value="PRIVATE">Private</option>}</select><Button type="submit">Create channel</Button></form></div>}
    {showRequests && <div className="fixed right-4 top-16 z-20 w-full max-w-md rounded-xl border border-line bg-surface p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-ink">Join requests</h3><button type="button" onClick={() => setShowRequests(false)}><X className="h-4 w-4 text-ink-muted" /></button></div>{requests.flatMap((group) => group.pendingRequests.map((request) => <div key={request.id} className="border-t border-line py-3 text-xs text-ink"><p>{request.sender?.name || request.sender?.email} ({request.sender?.email}, {request.sender?.role || 'MEMBER'}) wants to join {group.channelName} in {group.workspaceName}.</p><div className="mt-2 flex gap-2"><Button size="sm" onClick={async () => { await chatService.respondToRequest(request.id, 'APPROVED'); await loadRequests(); }}>Approve</Button><Button size="sm" variant="secondary" onClick={async () => { await chatService.respondToRequest(request.id, 'DECLINED'); await loadRequests(); }}>Decline</Button></div></div>))}</div>}
    {showRequests && <div className="fixed right-4 top-16 z-20 w-full max-w-md rounded-xl border border-line bg-surface p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-ink">Join requests</h3><button type="button" onClick={() => setShowRequests(false)}><X className="h-4 w-4 text-ink-muted" /></button></div>{requests.flatMap((group) => group.pendingRequests.map((request) => <div key={request.id} className="border-t border-line py-3 text-xs text-ink"><p>{request.sender?.name || request.sender?.email} ({request.sender?.email}, {request.sender?.role || 'MEMBER'}) wants to join {group.channelName} in {group.workspaceName}.</p><div className="mt-2 flex gap-2"><Button size="sm" onClick={async () => { await chatService.respondToRequest(request.id, 'APPROVED'); await loadRequests(); }}>Approve</Button><Button size="sm" variant="secondary" onClick={async () => { await chatService.respondToRequest(request.id, 'DECLINED'); await loadRequests(); }}>Decline</Button></div></div>))}</div>}
    {showAddMembers && <div className="fixed right-4 top-16 z-20 w-full max-w-sm rounded-xl border border-line bg-surface p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-ink">Add members</h3><button type="button" onClick={() => setShowAddMembers(false)}><X className="h-4 w-4 text-ink-muted" /></button></div>{availableMembers.length === 0 ? <p className="text-xs text-ink-muted">All workspace members are already in this channel.</p> : availableMembers.map((member: any) => <div key={member.userId} className="flex items-center justify-between border-t border-line py-2 text-xs text-ink"><span>{member.user?.name || member.name || member.user?.email || member.userId}</span><Button size="sm" onClick={() => addMember(member.userId)}>Add</Button></div>)}</div>}
  </div>;
};

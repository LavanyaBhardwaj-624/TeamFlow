import React, { useState } from 'react';
import {
  Hash,
  MessageSquare,
  Paperclip,
  Radio,
  Send,
  Smile,
  Users,
} from 'lucide-react';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useSocket } from '@/lib/socket';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderTitle: string;
  timestamp: string;
  content: string;
  channelId: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    channelId: 'general',
    senderName: 'Elena Rostova',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Product Lead',
    timestamp: '10:14 AM',
    content: 'Morning team! Sprint 42 kickoff is underway. Please review the high-priority tasks in the Kanban board.',
  },
  {
    id: 'msg_2',
    channelId: 'general',
    senderName: 'Marcus Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Frontend Architect',
    timestamp: '10:18 AM',
    content: 'Just deployed the TanStack Query normalized cache updates. Board transitions should feel instant now.',
  },
  {
    id: 'msg_3',
    channelId: 'general',
    senderName: 'David Okafor',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Infrastructure',
    timestamp: '10:25 AM',
    content: 'PgBouncer cluster staging benchmarks show a 40% reduction in idle connection pool memory footprint. Will push to prod tonight.',
  },
  {
    id: 'msg_4',
    channelId: 'engineering',
    senderName: 'Marcus Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Frontend Architect',
    timestamp: 'Yesterday',
    content: 'Ensure all new service functions return real ApiResponse shapes so the backend migration is zero-touch for views.',
  },
  {
    id: 'msg_5',
    channelId: 'design-system',
    senderName: 'Sarah Jenkins',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Product Designer',
    timestamp: '9:05 AM',
    content: 'Dark mode tokens are aligned with the #0F1115 / #171A20 palette specs. Check the contrast on status badges.',
  },
];

const CHANNELS = [
  { id: 'general', name: 'general', description: 'Company & sprint announcements' },
  { id: 'engineering', name: 'engineering', description: 'Tech specs, architecture, and code reviews' },
  { id: 'design-system', name: 'design-system', description: 'Figma tokens, components, and UX reviews' },
  { id: 'devops', name: 'devops-infra', description: 'Deployments, uptime, and cluster alerts' },
];

export const ChatPage: React.FC = () => {
  const { workspace } = useCurrentWorkspace();
  const { user } = useAuthStore();
  const { isConnected } = useSocket();

  const [activeChannelId, setActiveChannelId] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');

  const currentChannel = CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];
  const channelMessages = messages.filter((m) => m.channelId === activeChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      channelId: activeChannelId,
      senderName: user?.name || 'You',
      senderAvatar: user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      senderTitle: user?.title || 'Team Member',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Channels Sidebar Column */}
      <div className="w-56 sm:w-64 border-r border-line bg-surface/70 flex flex-col shrink-0 select-none">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-heading">
              Channels
            </h2>
            <p className="text-[11px] text-ink-muted truncate">
              {workspace?.name || 'Workspace'}
            </p>
          </div>
          <Badge variant="secondary" size="sm">
            Beta
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {CHANNELS.map((ch) => {
            const isActive = ch.id === activeChannelId;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannelId(ch.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand/10 text-brand font-semibold'
                    : 'text-ink-muted hover:bg-surface-secondary hover:text-ink'
                }`}
              >
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{ch.name}</span>
              </button>
            );
          })}
        </div>

        {/* Socket.IO client status pill */}
        <div className="p-3 border-t border-line text-[11px] text-ink-muted flex items-center justify-between bg-surface-secondary/40">
          <span className="flex items-center gap-1.5">
            <Radio className={`w-3 h-3 ${isConnected ? 'text-brand' : 'text-amber-500'}`} />
            <span>Socket Stub</span>
          </span>
          <span className="font-mono text-[10px] text-ink-subtle">
            {isConnected ? 'connected' : 'ready (dormant)'}
          </span>
        </div>
      </div>

      {/* Chat Messages Stream Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {/* Channel Header */}
        <div className="h-14 border-b border-line px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Hash className="w-4 h-4 text-ink-muted shrink-0" />
            <h3 className="text-sm font-semibold text-ink truncate font-heading">
              {currentChannel.name}
            </h3>
            <span className="text-ink-subtle hidden sm:inline">•</span>
            <span className="text-xs text-ink-muted truncate hidden sm:inline">
              {currentChannel.description}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
            <Users className="w-4 h-4 text-ink-subtle" />
            <span>{workspace?.members.length || 4} members</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-muted bg-surface-secondary/30">
            <p className="font-semibold text-ink">Welcome to #{currentChannel.name}!</p>
            <p className="mt-0.5 text-[11px] text-ink-subtle">
              This channel was created for team collaboration. Messages update live in this session.
            </p>
          </div>

          {channelMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 group">
              <Avatar name={msg.senderName} src={msg.senderAvatar} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-ink">{msg.senderName}</span>
                  <span className="text-[10px] text-ink-subtle">{msg.senderTitle}</span>
                  <span className="text-[10px] text-ink-subtle">{msg.timestamp}</span>
                </div>
                <div className="mt-1 text-xs text-ink leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Form */}
        <div className="p-4 border-t border-line bg-surface">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface-secondary/50 p-1.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand"
          >
            <button
              type="button"
              className="p-1.5 text-ink-subtle hover:text-ink rounded transition-colors"
              title="Add attachment"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder={`Message #${currentChannel.name}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent px-2 py-1 text-xs text-ink placeholder:text-ink-subtle focus:outline-none"
            />
            <button
              type="button"
              className="p-1.5 text-ink-subtle hover:text-ink rounded transition-colors hidden sm:block"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            <Button size="sm" type="submit" disabled={!inputValue.trim()}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};


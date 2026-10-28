

import { apiClient, getErrorMessage } from '@/lib/api';

export type ChannelType = 'PUBLIC' | 'PRIVATE';
export type Channel = {
  id: string;
  name: string;
  description?: string | null;
  desciption?: string | null;
  type: ChannelType;
  isDefault: boolean;
  joined: boolean;
  workspaceId?: string;
};

export type ChatMessage = {
  id: string;
  channelId: string;
  senderId?: string | null;
  sender?: { id?: string; name?: string; email?: string; title?: string; imageUrl?: string } | null;
  content: string;
  createdAt?: string;
  editedAt?: string | null;
  deletedAt?: string | null;
};

export type JoinRequestGroup = {
  channelName: string;
  workspaceName: string;
  workspaceSlug?: string;
  pendingRequests: Array<{
    id: string;
    senderId: string;
    sender?: { name?: string; email?: string; role?: string };
  }>;
};

class ChatService {
  async listChannels(workspaceId: string): Promise<Array<{ channel: Channel }>> {
    try {
      const response = await apiClient.get(`/api/channel/${workspaceId}/list`);
      return response.data?.data ?? [];
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load chat channels.'));
    }
  }

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get(`/api/message/${channelId}/get`);
      return response.data?.data ?? [];
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load messages.'));
    }
  }

  async postMessage(channelId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await apiClient.post(`/api/message/${channelId}/post`, { message });
      return response.data.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to send message.'));
    }
  }

  async editMessage(channelId: string, messageId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await apiClient.patch(`/api/message/${channelId}/edit/${messageId}`, { message });
      return response.data.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to edit message.'));
    }
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    try { await apiClient.delete(`/api/message/${channelId}/delete/${messageId}`); }
    catch (err) { throw new Error(getErrorMessage(err, 'Failed to delete message.')); }
  }

  async createChannel(workspaceId: string, input: { name: string; description: string; type: ChannelType }): Promise<Channel> {
    try {
      const response = await apiClient.post(`/api/channel/${workspaceId}/create`, input);
      return response.data.data;
    } catch (err) { throw new Error(getErrorMessage(err, 'Failed to create channel.')); }
  }

  async joinPublic(channelId: string): Promise<void> { try { await apiClient.post(`/api/channel/${channelId}/public/join`); } catch (err) { throw new Error(getErrorMessage(err, 'Failed to join channel.')); } }
  async requestPrivate(channelId: string): Promise<void> { try { await apiClient.post(`/api/channel/${channelId}/private/join/request`); } catch (err) { throw new Error(getErrorMessage(err, 'Failed to request channel access.')); } }
  async respondToRequest(requestId: string, status: 'APPROVED' | 'DECLINED'): Promise<void> { try { await apiClient.post(`/api/channel/private/${requestId}/response`, { status }); } catch (err) { throw new Error(getErrorMessage(err, 'Failed to respond to join request.')); } }

  async getJoinRequests(): Promise<JoinRequestGroup[]> {
    try {
      const response = await apiClient.get('/api/channel/request');
      const groups = response.data?.data ?? [];
      return groups.map((group: JoinRequestGroup & { pendingRequests?: unknown }) => ({
        ...group,
        pendingRequests: Array.isArray(group.pendingRequests)
          ? group.pendingRequests
          : Object.values((group.pendingRequests as Record<string, unknown>) ?? {}).filter(Boolean),
      }));
    }
    catch (err) { throw new Error(getErrorMessage(err, 'Failed to load join requests.')); }
  }

  async getMembers(channelId: string): Promise<Array<{ memberId: string; role: string }>> {
    try {
      const response = await apiClient.get(`/api/channel/${channelId}/member`);
      return response.data?.data ?? [];
    } catch (err) { throw new Error(getErrorMessage(err, 'Failed to load channel members.')); }
  }

  async addMember(channelId: string, memberId: string): Promise<void> {
    try { await apiClient.post(`/api/channel/${channelId}/direct/add`, { User2add: memberId }); }
    catch (err) { throw new Error(getErrorMessage(err, 'Failed to add member to channel.')); }
  }

  async leave(channelId: string): Promise<void> { await apiClient.delete(`/api/channel/${channelId}/leave`); }
  async deleteChannel(channelId: string): Promise<void> { await apiClient.delete(`/api/channel/${channelId}/delete`); }
}

export const chatService = new ChatService();

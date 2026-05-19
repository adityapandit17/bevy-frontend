import { apiRequest, getApiUrl } from './api';
import { AUTH_CONFIG } from '@/config/auth.config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface Channel {
  id: number;
  name: string;
  channel_type: 'channel' | 'direct' | 'group';
  is_private: boolean;
  description?: string;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  unread_count: number;
  last_message?: Message;
  members_count: number;
  members: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  channel_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  content: string;
  edited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChannelParams {
  name: string;
  channel_type: 'channel' | 'direct' | 'group';
  is_private?: boolean;
  description?: string;
  user_ids?: number[];
}

export interface CreateDirectChannelParams {
  user_id: number;
}

export const chatApi = {
  // Get all channels for current user
  getChannels: async (type?: string): Promise<Channel[]> => {
    const url = getApiUrl('api/v1/channels');
    const params = type ? `?type=${type}` : '';
    const response = await apiRequest<{ success: boolean; channels: Channel[] }>(`${url}${params}`);
    return response.channels;
  },

  // Get a specific channel
  getChannel: async (id: number): Promise<Channel> => {
    const url = getApiUrl(`api/v1/channels/${id}`);
    const response = await apiRequest<{ success: boolean; channel: Channel }>(url);
    return response.channel;
  },

  // Create a new channel
  createChannel: async (params: CreateChannelParams): Promise<Channel> => {
    const url = getApiUrl('api/v1/channels');
    const response = await apiRequest<{ success: boolean; channel: Channel }>(url, {
      method: 'POST',
      body: JSON.stringify({ channel: params }),
    });
    return response.channel;
  },

  // Create a direct message channel
  createDirectChannel: async (params: CreateDirectChannelParams): Promise<Channel> => {
    const url = getApiUrl('api/v1/channels/create_direct');
    const response = await apiRequest<{ success: boolean; channel: Channel }>(url, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.channel;
  },

  // Get messages for a channel
  getMessages: async (channelId: number, page: number = 1, perPage: number = 50): Promise<{
    messages: Message[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/messages?page=${page}&per_page=${perPage}`);
    const response = await apiRequest<{
      success: boolean;
      messages: Message[];
      pagination: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
      };
    }>(url);
    return {
      messages: response.messages,
      pagination: response.pagination,
    };
  },

  // Send a message
  sendMessage: async (channelId: number, content: string): Promise<Message> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/messages`);
    const response = await apiRequest<{ success: boolean; message: Message }>(url, {
      method: 'POST',
      body: JSON.stringify({ message: { content } }),
    });
    return response.message;
  },

  // Update a message
  updateMessage: async (channelId: number, messageId: number, content: string): Promise<Message> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/messages/${messageId}`);
    const response = await apiRequest<{ success: boolean; message: Message }>(url, {
      method: 'PATCH',
      body: JSON.stringify({ message: { content } }),
    });
    return response.message;
  },

  // Delete a message
  deleteMessage: async (channelId: number, messageId: number): Promise<void> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/messages/${messageId}`);
    await apiRequest<{ success: boolean }>(url, {
      method: 'DELETE',
    });
  },

  // Active users for DMs / group chat (no users.index permission required)
  getDirectoryUsers: async (search?: string): Promise<Array<{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
    employee_id?: number | null;
  }>> => {
    const params = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    const url = getApiUrl(`api/v1/users/directory${params}`);
    const response = await apiRequest<{ success: boolean; users: Array<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      name: string;
      employee_id?: number | null;
    }> }>(url, { suppressToast: true });
    return response.users ?? [];
  },

  // Add members to a channel
  addMembers: async (channelId: number, userIds: number[]): Promise<Channel> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/add_members`);
    const response = await apiRequest<{ success: boolean; channel: Channel }>(url, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
    return response.channel;
  },
};

// ActionCable connection helper
let ActionCable: any = null;
let ActionCableLoading: Promise<any> | null = null;

// Lazy load ActionCable only when needed
const getActionCable = async (): Promise<any> => {
  if (typeof window === 'undefined') return null;
  
  if (ActionCable) {
    return ActionCable;
  }
  
  if (ActionCableLoading) {
    return ActionCableLoading;
  }
  
  ActionCableLoading = (async () => {
    try {
      // Use dynamic import for better Next.js compatibility
      const module = await import('@rails/actioncable');
      ActionCable = module.default || module;
      return ActionCable;
    } catch (error) {
      console.warn('ActionCable not available:', error);
      ActionCableLoading = null;
      return null;
    }
  })();
  
  return ActionCableLoading;
}

type ChannelHandlers = {
  onMessage: (message: Message) => void;
  onChannelUpdated?: (channelId: number) => void;
};

export class ChatCable {
  private consumer: any = null;
  private mainSubscription: any = null;
  private channelHandlers: Map<number, ChannelHandlers> = new Map();
  private connecting: boolean = false;

  async connect() {
    if (typeof window === 'undefined') {
      return;
    }

    // Don't connect if already connected or connecting
    if (this.consumer || this.connecting) {
      return;
    }

    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    if (!token) {
      // Silently fail - real-time updates won't work but app continues
      return;
    }

    try {
      this.connecting = true;
      const Cable = await getActionCable();
      
      if (!Cable) {
        // Silently fail - ActionCable not available, app continues without real-time updates
        return;
      }

      // Use ws:// for development, wss:// for production
      const protocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const baseUrl = API_BASE_URL.replace(/^https?/, protocol);
      const cableUrl = `${baseUrl}/cable?token=${encodeURIComponent(token)}`;
      
      this.consumer = Cable.createConsumer(cableUrl);
      
      // Add connection event handlers
      if (this.consumer.connection) {
        this.consumer.connection.addEventListener('open', () => {
          console.log('✅ ActionCable WebSocket connected successfully');
        });
        
        this.consumer.connection.addEventListener('close', () => {
          console.log('❌ ActionCable WebSocket disconnected');
          this.consumer = null;
        });
        
        this.consumer.connection.addEventListener('error', (error: any) => {
          console.error('❌ ActionCable WebSocket error:', error);
        });
      } else {
        console.warn('⚠️ ActionCable consumer created but connection not available');
      }
    } catch (error) {
      // Silently fail - real-time updates won't work but app continues
      console.warn('Failed to connect to ActionCable:', error);
    } finally {
      this.connecting = false;
    }
  }

  subscribeToChannel(channelId: number, handlers: ChannelHandlers) {
    // Ensure connection exists
    if (!this.consumer) {
      // Try to connect asynchronously
      this.connect().then(() => {
        if (this.consumer) {
          console.log('ActionCable connected, subscribing to channel:', channelId);
          this.doSubscribe(channelId, handlers);
        } else {
          console.warn('ActionCable connection failed, cannot subscribe to channel:', channelId);
        }
      }).catch((error) => {
        console.error('Failed to connect ActionCable:', error);
      });
      return null;
    }

    console.log('ActionCable already connected, subscribing to channel:', channelId);
    return this.doSubscribe(channelId, handlers);
  }

  private doSubscribe(channelId: number, handlers: ChannelHandlers) {
    if (!this.consumer) {
      return null;
    }

    try {
      if (!this.mainSubscription) {
        this.mainSubscription = this.consumer.subscriptions.create(
          { channel: 'ChatChannel' },
          {
            received: (data: any) => {
              if (data.type === 'message' && data.message?.id != null) {
                const message: Message = {
                  ...data.message,
                  user_name: data.message.user_name || '',
                  user_email: data.message.user_email || '',
                };
                const h = this.channelHandlers.get(message.channel_id);
                h?.onMessage(message);
              } else if (data.type === 'channel_updated' && data.channel_id != null) {
                const h = this.channelHandlers.get(data.channel_id);
                h?.onChannelUpdated?.(data.channel_id);
              }
            },
            connected: () => {
              console.log('✅ Subscribed to ChatChannel');
            },
            disconnected: () => {
              console.log('❌ Disconnected from ChatChannel');
            },
            rejected: () => {
              console.error('❌ ChatChannel subscription rejected');
            },
          }
        );
      }

      this.channelHandlers.set(channelId, handlers);
      return this.mainSubscription;
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      return null;
    }
  }

  unsubscribeFromChannel(channelId: number) {
    this.channelHandlers.delete(channelId);

    if (this.channelHandlers.size === 0 && this.mainSubscription) {
      this.mainSubscription.unsubscribe();
      this.mainSubscription = null;
    }
  }

  disconnect() {
    if (this.mainSubscription && typeof this.mainSubscription.unsubscribe === 'function') {
      this.mainSubscription.unsubscribe();
    }
    this.mainSubscription = null;
    this.channelHandlers.clear();
    if (this.consumer) {
      this.consumer.disconnect();
      this.consumer = null;
    }
  }
}

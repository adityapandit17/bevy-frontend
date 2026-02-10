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

export class ChatCable {
  private consumer: any = null;
  private subscriptions: Map<number, any> = new Map();
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

  subscribeToChannel(channelId: number, callback: (message: Message) => void) {
    // Ensure connection exists
    if (!this.consumer) {
      // Try to connect asynchronously
      this.connect().then(() => {
        if (this.consumer) {
          console.log('ActionCable connected, subscribing to channel:', channelId);
          this.doSubscribe(channelId, callback);
        } else {
          console.warn('ActionCable connection failed, cannot subscribe to channel:', channelId);
        }
      }).catch((error) => {
        console.error('Failed to connect ActionCable:', error);
      });
      return null;
    }

    console.log('ActionCable already connected, subscribing to channel:', channelId);
    return this.doSubscribe(channelId, callback);
  }

  private doSubscribe(channelId: number, callback: (message: Message) => void) {
    if (!this.consumer) {
      // Silently fail - real-time updates won't work but app continues
      return null;
    }

    try {
      // Create a single subscription that listens to all channels
      // The backend ChatChannel already subscribes to all user channels
      if (!this.subscriptions.has(0)) {
        const subscription = this.consumer.subscriptions.create(
          {
            channel: 'ChatChannel',
          },
          {
            received: (data: any) => {
              console.log('ActionCable received data:', data);
              if (data.type === 'message' && data.message) {
                // Ensure message has required fields
                const message = {
                  ...data.message,
                  user_name: data.message.user_name || '',
                  user_email: data.message.user_email || '',
                };
                console.log('Processing message for channel:', message.channel_id);
                // Find the callback for this channel
                const channelCallback = this.subscriptions.get(message.channel_id);
                if (channelCallback) {
                  console.log('Calling callback for channel:', message.channel_id);
                  channelCallback(message);
                } else {
                  console.warn('No callback found for channel:', message.channel_id);
                }
              } else if (data.type === 'channel_updated') {
                // Handle channel updates
                const channelCallback = this.subscriptions.get(data.channel_id);
                if (channelCallback) {
                  channelCallback(data);
                }
              } else if (data.type === 'huddle_started' || data.type === 'huddle_updated' || data.type === 'huddle_ended') {
                // Handle huddle events - pass to channel callback
                const channelCallback = this.subscriptions.get(data.huddle?.channel_id || data.channel_id);
                if (channelCallback) {
                  channelCallback(data);
                }
              }
            },
            connected: () => {
              console.log('✅ Subscribed to ChatChannel - ready to receive messages');
            },
            disconnected: () => {
              console.log('❌ Disconnected from ChatChannel');
            },
            rejected: () => {
              console.error('❌ Subscription to ChatChannel was rejected');
            },
          }
        );
        this.subscriptions.set(0, subscription);
      }

      // Store the callback for this specific channel
      this.subscriptions.set(channelId, callback);
      return this.subscriptions.get(0);
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      return null;
    }
  }

  unsubscribeFromChannel(channelId: number) {
    // Remove the callback for this channel
    this.subscriptions.delete(channelId);
    
    // If no more channels are subscribed, disconnect
    if (this.subscriptions.size === 1 && this.subscriptions.has(0)) {
      const mainSubscription = this.subscriptions.get(0);
      if (mainSubscription) {
        mainSubscription.unsubscribe();
      }
      this.subscriptions.clear();
    }
  }

  disconnect() {
    // Only unsubscribe from actual subscription objects (key 0), not callbacks
    const mainSubscription = this.subscriptions.get(0);
    if (mainSubscription && typeof mainSubscription.unsubscribe === 'function') {
      mainSubscription.unsubscribe();
    }
    this.subscriptions.clear();
    if (this.consumer) {
      this.consumer.disconnect();
      this.consumer = null;
    }
  }
}

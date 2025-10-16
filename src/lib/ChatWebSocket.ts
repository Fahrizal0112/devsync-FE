/**
 * ChatWebSocket Class - DevSync Compatible WebSocket Implementation
 * 
 * Implements the correct WebSocket message format and flow for DevSync backend:
 * 1. Connect to ws://localhost:8080/ws
 * 2. Send messages via REST API (not WebSocket directly)
 * 3. Listen for WebSocket broadcasts from server
 * 4. Handle proper message format with type, project_id, user_id, and data fields
 */

export interface DevSyncWebSocketMessage {
  type: 'chat_message';
  project_id: number;
  user_id: number;
  data: {
    message: string;
    user_id: number;
    project_id: number;
  };
}

export interface ChatWebSocketConfig {
  projectId: number;
  userId: number;
  token: string;
  wsUrl?: string;
  apiUrl?: string;
}

export type MessageCallback = (data: DevSyncWebSocketMessage) => void;
export type ConnectionCallback = (connected: boolean) => void;

export class ChatWebSocket {
  private projectId: number;
  private userId: number;
  private token: string;
  private wsUrl: string;
  private apiUrl: string;
  private ws: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  constructor(config: ChatWebSocketConfig) {
    this.projectId = config.projectId;
    this.userId = config.userId;
    this.token = config.token;
    this.wsUrl = config.wsUrl || 'ws://localhost:8080/ws';
    this.apiUrl = config.apiUrl || 'http://localhost:8080/api/v1';
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('🔗 ChatWebSocket already connected');
      return;
    }

    this.isManualDisconnect = false;

    try {
      // Connect to WebSocket with token
      const wsUrlWithToken = `${this.wsUrl}?token=${encodeURIComponent(this.token)}`;
      console.log('🚀 ChatWebSocket connecting to:', wsUrlWithToken);
      
      this.ws = new WebSocket(wsUrlWithToken);

      this.ws.onopen = () => {
        console.log('✅ ChatWebSocket connected successfully');
        this.notifyConnectionChange(true);
        
        // Clear any existing reconnect timeout
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          console.log('📨 ChatWebSocket raw message:', event.data);
          const data = JSON.parse(event.data) as DevSyncWebSocketMessage;
          
          // Validate DevSync message format
          if (this.isValidDevSyncMessage(data)) {
            console.log('✅ Valid DevSync message received:', data);
            console.log('🔍 ChatWebSocket - Current project ID:', this.projectId);
            console.log('🔍 ChatWebSocket - Message project ID:', data.project_id);
            console.log('🔍 ChatWebSocket - Registered callbacks count:', this.messageCallbacks.length);
            
            // Filter messages for current project
            if (data.project_id === this.projectId) {
              console.log('📋 Message belongs to current project, notifying callbacks');
              this.notifyMessageCallbacks(data);
            } else {
              console.log('🔍 Message for different project, ignoring');
            }
          } else {
            console.warn('⚠️ Invalid DevSync message format:', data);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 ChatWebSocket disconnected - Code:', event.code, 'Reason:', event.reason);
        this.notifyConnectionChange(false);
        
        // Auto-reconnect if not manual disconnect
        if (!this.isManualDisconnect && event.code !== 1000) {
          console.log('🔄 Connection lost, attempting to reconnect in 3 seconds...');
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, 3000);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ ChatWebSocket error:', error);
      };

    } catch (error) {
      console.error('❌ Failed to create ChatWebSocket connection:', error);
    }
  }

  /**
   * Send message via REST API (not WebSocket directly)
   * The backend will then broadcast the message via WebSocket
   */
  async sendMessage(message: string): Promise<void> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      console.log('📤 Sending message via REST API:', message);
      
      const response = await fetch(`${this.apiUrl}/projects/${this.projectId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          content: message.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Message sent successfully via API:', result);
      
      // Server should automatically broadcast via WebSocket
      return result;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to incoming messages
   */
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.notifyConnectionChange(false);
  }

  /**
   * Validate DevSync WebSocket message format
   */
  private isValidDevSyncMessage(data: unknown): data is DevSyncWebSocketMessage {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const obj = data as Record<string, unknown>;
    
    if (
      obj.type !== 'chat_message' ||
      typeof obj.project_id !== 'number' ||
      typeof obj.user_id !== 'number' ||
      !obj.data ||
      typeof obj.data !== 'object' ||
      obj.data === null
    ) {
      return false;
    }

    const dataObj = obj.data as Record<string, unknown>;
    
    return (
      typeof dataObj.message === 'string' &&
      typeof dataObj.user_id === 'number' &&
      typeof dataObj.project_id === 'number'
    );
  }

  /**
   * Notify all message callbacks
   */
  private notifyMessageCallbacks(data: DevSyncWebSocketMessage): void {
    console.log('🔔 ChatWebSocket - Notifying', this.messageCallbacks.length, 'callbacks with data:', data);
    this.messageCallbacks.forEach((callback, index) => {
      try {
        console.log('🔔 ChatWebSocket - Calling callback', index);
        callback(data);
        console.log('✅ ChatWebSocket - Callback', index, 'executed successfully');
      } catch (error) {
        console.error('❌ Error in message callback', index, ':', error);
      }
    });
  }

  /**
   * Notify all connection callbacks
   */
  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('❌ Error in connection callback:', error);
      }
    });
  }
}
/**
 * WebSocket Service
 * 
 * Handles WebSocket connection to ESP32/ESP8266 devices.
 */

export class WebSocketService {
  private ws: WebSocket | null = null;
  private port = 8232;
  private readonly protocol = 'arduino';
  
  // Event handlers
  private onConnectHandler: (() => void) | null = null;
  private onDisconnectHandler: (() => void) | null = null;
  private onMessageHandler: ((data: string) => void) | null = null;
  private onErrorHandler: ((error: Error) => void) | null = null;

  /**
   * Connect to device
   */
  connect(address: string, port?: number): void {
    if (port) {
      this.port = port;
    }
    
    if (this.ws) {
      this.disconnect();
    }

    // Build WebSocket URL
    const url = this.buildUrl(address);
    
    try {
      this.ws = new WebSocket(url, [this.protocol]);
      this.ws.binaryType = 'arraybuffer';
      
      this.ws.onopen = () => {
        console.log('WebSocket connected:', url);
        this.onConnectHandler?.();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.ws = null;
        this.onDisconnectHandler?.();
      };

      this.ws.onmessage = (event) => {
        const data = this.decodeMessage(event.data);
        if (data) {
          this.onMessageHandler?.(data);
        }
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        this.onErrorHandler?.(new Error('Connection failed'));
      };
      
    } catch (error) {
      this.onErrorHandler?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Disconnect from device
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send command to device
   */
  send(command: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(command);
    } else {
      console.warn('WebSocket not connected, cannot send:', command);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Set connect handler
   */
  onConnect(handler: () => void): void {
    this.onConnectHandler = handler;
  }

  /**
   * Set disconnect handler
   */
  onDisconnect(handler: () => void): void {
    this.onDisconnectHandler = handler;
  }

  /**
   * Set message handler
   */
  onMessage(handler: (data: string) => void): void {
    this.onMessageHandler = handler;
  }

  /**
   * Set error handler
   */
  onError(handler: (error: Error) => void): void {
    this.onErrorHandler = handler;
  }

  /**
   * Build WebSocket URL from address
   */
  private buildUrl(address: string): string {
    // Remove any existing protocol
    let cleanAddress = address.replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/, '');
    
    // Remove any port if present
    cleanAddress = cleanAddress.replace(/:\d+$/, '');
    
    // Determine protocol (ws or wss)
    // For local development, always use ws since ESP32 typically doesn't support wss
    const protocol = 'ws';
    
    return `${protocol}://${cleanAddress}:${this.port}`;
  }

  /**
   * Decode message from ArrayBuffer or string
   */
  private decodeMessage(data: ArrayBuffer | string): string | null {
    if (typeof data === 'string') {
      return data;
    }
    
    if (data instanceof ArrayBuffer) {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(data);
    }
    
    return null;
  }
}

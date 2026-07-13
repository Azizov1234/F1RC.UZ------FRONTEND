/**
 * websocket.ts — F1RC.UZ WebSocket Adapter
 *
 * Real-time racing telemetriya va holat yangilanishlarini
 * boshqarish uchun xavfsiz WebSocket adapter.
 */

// ─── WebSocket Telemetry Interfaces ──────────────────────────────

export interface BatteryUpdate {
  vehicleId: string;
  batteryLevel: number;
}

export interface PositionUpdate {
  participantId: string;
  position: number;
  currentLap: number;
}

export interface LapUpdate {
  participantId: string;
  lapNumber: number;
  lapTime: string;
  speed: number;
}

export interface RaceStatusUpdate {
  status: 'WAITING' | 'RUNNING' | 'PAUSED' | 'FINISHED' | 'CANCELLED';
  flagStatus?: 'GREEN' | 'YELLOW' | 'RED' | 'CHEQUERED';
}

export interface RaceTelemetry {
  vehicleId: string;
  speed: number;
  rpm?: number;
  batteryLevel: number;
  temperature?: number;
  signalStrength?: number;
}

export interface WsPayloadMap {
  telemetry: RaceTelemetry;
  lap: LapUpdate;
  position: PositionUpdate;
  battery: BatteryUpdate;
  status: RaceStatusUpdate;
  error: Event | ErrorEvent | Error;
}

export type WsEventMap = {
  [K in keyof WsPayloadMap]: (data: WsPayloadMap[K]) => void;
};

type StoredListener = (data: unknown) => void;

// ─── WebSocket Connection Manager ───────────────────────────────

const isBackendConfigured = !!import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;

export class F1WebSocketAdapter {
  private socket: WebSocket | null = null;
  private url: string;
  private status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' = 'DISCONNECTED';
  private listeners = new Map<keyof WsEventMap, Map<unknown, StoredListener>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isIntentionalDisconnect = false;

  constructor(url?: string) {
    // URL fallback parsing
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/^https?:\/\//, '')
      : window.location.host;
    
    this.url = url ?? `${wsProto}//${host}/ws/race`;
  }

  public connect(): void {
    if (!isBackendConfigured && !isDev) {
      console.warn('[F1RC] WS connection bypassed: VITE_API_URL is missing.');
      this.status = 'DISCONNECTED';
      this.trigger('error', new Error('Live data unavailable (Missing API configuration)'));
      return;
    }

    if (this.socket && this.status !== 'DISCONNECTED') return;

    this.isIntentionalDisconnect = false;
    this.status = this.socket ? 'RECONNECTING' : 'CONNECTING';
    
    try {
      this.socket = new WebSocket(this.url);
      this.setupSocketEvents();
    } catch (error: unknown) {
      this.handleConnectionError(error);
    }
  }

  private setupSocketEvents(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.status = 'CONNECTED';
      this.reconnectAttempts = 0;
      console.info('[F1RC] WS Connected successfully to race telemetry stream.');
    };

    this.socket.onmessage = (event) => {
      try {
        const payload: unknown = JSON.parse(String(event.data));
        if (typeof payload !== 'object' || payload === null) return;
        const { type, data } = payload as { type?: unknown; data?: unknown };

        switch (type) {
          case 'telemetry':
            this.trigger('telemetry', data as RaceTelemetry);
            break;
          case 'lap':
            this.trigger('lap', data as LapUpdate);
            break;
          case 'position':
            this.trigger('position', data as PositionUpdate);
            break;
          case 'battery':
            this.trigger('battery', data as BatteryUpdate);
            break;
          case 'status':
            this.trigger('status', data as RaceStatusUpdate);
            break;
        }
      } catch (e) {
        console.error('[F1RC] Failed parsing WS message payload:', e);
      }
    };

    this.socket.onerror = (error) => {
      this.trigger('error', error);
    };

    this.socket.onclose = () => {
      this.status = 'DISCONNECTED';
      this.socket = null;
      if (!this.isIntentionalDisconnect) {
        this.attemptReconnect();
      }
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[F1RC] WS maximum reconnection attempts reached.');
      this.trigger('error', new Error('Live data connection lost.'));
      return;
    }

    this.reconnectAttempts++;
    this.status = 'RECONNECTING';
    setTimeout(() => {
      console.info(`[F1RC] Retrying WS connection (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, this.reconnectInterval);
  }

  public disconnect(): void {
    this.isIntentionalDisconnect = true;
    if (this.socket) {
      this.socket.close();
    }
    this.status = 'DISCONNECTED';
  }

  public subscribe<K extends keyof WsPayloadMap>(
    event: K,
    callback: (data: WsPayloadMap[K]) => void,
  ): void {
    const eventListeners = this.listeners.get(event) ?? new Map<unknown, StoredListener>();
    eventListeners.set(callback, (data: unknown) => {
      callback(data as WsPayloadMap[K]);
    });
    this.listeners.set(event, eventListeners);
  }

  public unsubscribe<K extends keyof WsPayloadMap>(
    event: K,
    callback: (data: WsPayloadMap[K]) => void,
  ): void {
    const eventListeners = this.listeners.get(event);
    eventListeners?.delete(callback);
    if (eventListeners?.size === 0) this.listeners.delete(event);
  }

  private trigger<K extends keyof WsPayloadMap>(
    event: K,
    data: WsPayloadMap[K],
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error: unknown) {
          console.error(`[F1RC] Error in WS listener for "${event}":`, error);
        }
      });
    }
  }

  private handleConnectionError(error: unknown): void {
    this.status = 'DISCONNECTED';
    this.trigger(
      'error',
      error instanceof Error ? error : new Error('WebSocket ulanishida xatolik'),
    );
    this.attemptReconnect();
  }

  public getStatus(): 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' {
    return this.status;
  }
}
export const f1WsService = new F1WebSocketAdapter();

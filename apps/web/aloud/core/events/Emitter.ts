
// export abstract class Emitter<Events extends Record<string, unknown>> {
//   private readonly listeners: {
//     [K in keyof Events]?: Set<(payload: Events[K]) => void>;
//   } = {};

//   public on<K extends keyof Events>(
//     event: K,
//     listener: (payload: Events[K]) => void,
//   ): () => void {
//     const set = this.listeners[event] ?? new Set();
//     set.add(listener);
//     this.listeners[event] = set;
//     return () => this.off(event, listener);
//   }

//   public off<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void {
//     this.listeners[event]?.delete(listener);
//   }

//   protected emit<K extends keyof Events>(event: K, payload: Events[K]): void {
//     this.listeners[event]?.forEach((listener) => listener(payload));
//   }

//   /** Drops every listener. Call when the owning component unmounts. */
//   public dispose(): void {
//     (Object.keys(this.listeners) as Array<keyof Events>).forEach((key) => {
//       this.listeners[key]?.clear();
//     });
//   }
// }


// export class Emitter<Events extends Record<string, unknown>>{
//   private readonly listeners = new Set<(
//     event: keyof Events, 
//     payload: Events[keyof Events]
//   ) => void>();

//   public on(listener: (event: keyof Events, payload: Events[keyof Events]) => void): () => void {
//     this.listeners.add(listener);
//     return () => this.off(listener);
//   }

//   public off(listener: (event: keyof Events, payload: Events[keyof Events]) => void): void {
//     this.listeners.delete(listener);
//   }

//   protected emit<K extends Events>(event: K, payload: Events[K]): void {
//     this.listeners.forEach((listener) => listener(event, payload));
//   }
  
//   /** Drops every listener. Call when the owning component unmounts. */
//   public dispose(): void {
//     this.listeners.clear();
//   }

// }

type EventMap = Record<string, unknown>;

type Listener<T> = (data: T) => void;

export class TypedEventEmitter<Events extends EventMap> {
    private readonly listeners = new Map<
        keyof Events,
        Set<Listener<Events[keyof Events]>>
    >();

    on<K extends keyof Events>(
        eventName: K,
        listener: Listener<Events[K]>
    ): this {
        let eventListeners = this.listeners.get(eventName);

        if (!eventListeners) {
            eventListeners = new Set();
            this.listeners.set(eventName, eventListeners);
        }

        eventListeners.add(
            listener as Listener<Events[keyof Events]>
        );

        return this;
    }

    off<K extends keyof Events>(
        eventName: K,
        listener: Listener<Events[K]>
    ): this {
        const eventListeners = this.listeners.get(eventName);

        if (!eventListeners) {
            return this;
        }

        eventListeners.delete(
            listener as Listener<Events[keyof Events]>
        );

        if (eventListeners.size === 0) {
            this.listeners.delete(eventName);
        }

        return this;
    }

    emit<K extends keyof Events>(
        eventName: K,
        data: Events[K]
    ): boolean {
        const eventListeners = this.listeners.get(eventName);

        if (!eventListeners || eventListeners.size === 0) {
            return false;
        }

        for (const listener of eventListeners) {
            listener(data);
        }

        return true;
    }

    removeAllListeners(): this {
        this.listeners.clear();
        return this;
    }
}
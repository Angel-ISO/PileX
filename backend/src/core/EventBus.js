
class EventBus {
  constructor() {
    this.events = new Map();
    this.middlewares = [];
  }

  
  on(event, callback, priority = 0) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    this.events.get(event).push({ callback, priority });
    this.events.get(event).sort((a, b) => b.priority - a.priority);
  }

 
  off(event, callback) {
    if (!this.events.has(event)) return;

    const listeners = this.events.get(event);
    const index = listeners.findIndex(listener => listener.callback === callback);

    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  
  emit(event, data = null) {
    if (!this.events.has(event)) return;

    const listeners = this.events.get(event);

    let processedData = data;
    for (const middleware of this.middlewares) {
      processedData = middleware(event, processedData);
    }

    for (const listener of listeners) {
      try {
        listener.callback(processedData);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    }
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  
  removeAllListeners(event = null) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }

  
  eventNames() {
    return Array.from(this.events.keys());
  }
}

export const eventBus = new EventBus();
export default EventBus;
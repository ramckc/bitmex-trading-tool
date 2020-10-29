import socketIOClient from "socket.io-client";
const socket = socketIOClient("http://localhost:8000");

let events = [];

export function register(user) {
  socket.emit("REGISTER", JSON.stringify(user));
}

export function subscribe(event, callback) {
  const fitleredEvent = events.filter((e) => e.event === event);
  if (fitleredEvent.length > 0) {
    const foundEvent = fitleredEvent[0];
    foundEvent.callbacks.push(callback);
    events = events.map((e) => {
      if (e.event === event) return foundEvent;

      return e;
    });
  } else {
    events.push({
      event,
      callbacks: [callback],
    });
    socket.on(event, (data) => {
      const aEvent = events.filter((e) => e.event === event)[0];
      aEvent.callbacks.map((aCallback) => {
        aCallback(data);
      });
    });
  }
}

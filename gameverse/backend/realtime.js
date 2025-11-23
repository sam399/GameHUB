let ioInstance = null;

module.exports = {
  setIo(io) {
    ioInstance = io;
  },
  emit(event, payload) {
    try {
      if (ioInstance) {
        ioInstance.emit(event, payload);
      }
    } catch (err) {
      console.error('Realtime emit error:', err);
    }
  },
  emitTo(room, event, payload) {
    try {
      if (ioInstance) {
        ioInstance.to(room).emit(event, payload);
      }
    } catch (err) {
      console.error('Realtime emitTo error:', err);
    }
  }
};

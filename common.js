
var common = {
  // Event frames
  events: {
    EVT_FRAME: 1,
    EVT_DISCONNECT: 2,
    EVT_NEW_ID: 3,
    EVT_FRAME_RECEIVED: 4
  },

  // Framerate
  // (actual framerate when sending frames through websockets)
  FRAMERATE: 1,

  // Receiving framerate
  // (framerate used when encoding to GIF)
  RECV_FRAMERATE: 20,

  // Size of the image
  WIDTH: 240,
  HEIGHT: 180,

  // Redis
  redis: {
    // Channels
    CH_FRAME: 'frame',
    CH_EVENT: 'event',

    // Events
    EVT_DISCONNECT: 'disconnect',
  }
};

if (typeof module !== 'undefined') {
  module.exports = common;
}

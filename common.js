
var common = {
  events: {
    EVT_FRAME: 1,
    EVT_DISCONNECT: 2,
    EVT_NEW_ID: 3,
    EVT_FRAME_RECEIVED: 4
  },

  FRAMERATE: 1,
  RECV_FRAMERATE: 5,

  WIDTH: 240,
  HEIGHT: 180
};

if (typeof module !== 'undefined') {
    module.exports = common;
}

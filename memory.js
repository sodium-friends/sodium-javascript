/* eslint-disable camelcase */
var MessageChannel = global.MessageChannel
if (MessageChannel == null) {
  try {
    ({ MessageChannel } = require('worker' + '_threads'))
  } catch (e) {
    // Must not be supported
  }
}

function sodium_malloc (n) {
  return new Uint8Array(n)
}

const sink = MessageChannel ? new MessageChannel() : null
function sodium_free (n) {
  sodium_memzero(n)
  if (!sink) return
  sink.port1.postMessage(n.buffer, [n.buffer])
}

function sodium_memzero (arr) {
  arr.fill(0)
}

module.exports = {
  sodium_malloc,
  sodium_free,
  sodium_memzero
}

/* eslint-disable camelcase */

function sodium_malloc (n) {
  return new Uint8Array(n)
}

function sodium_memzero (arr) {
  arr.fill(0)
}

module.exports = {
  sodium_malloc,
  sodium_memzero
}

var sodium = require('.')

module.exports = function (self) {
  self.addEventListener('message', function (e) {
    var arr = e.data[0]
    sodium.randombytes_buf(arr)
    self.postMessage(arr)
    self.close()
  })
}

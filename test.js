require('sodium-test')(require('.'))

if (typeof window !== 'undefined') {
  var test = require('tape')
  var arrConst = new Uint8Array(16)
  test('randombytes works in web worker context', function (t) {
    var work = require('webworkify')
    var w = work(require('./tests/webworker.js'))
    w.addEventListener('message', function (e) {
      var arr = e.data[0]
      t.notEqual(arrConst, arr, 'Array should contain random bytes')
      t.end()
      window.close()
    })
    var arr = new Uint8Array(16)
    w.postMessage([arr])
  })
}

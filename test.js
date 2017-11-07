require('sodium-test')(require('.'))

if (typeof window !== 'undefined') {
  var test = require('tape')
  var arrConst = new Uint8Array(16)
  test('randombytes works in web worker context', function (t) {
    var work = require('webworkify')
    var w = work(require('./test-worker.js'))
    w.addEventListener('message', function (e) {
      var arr = e.data[0]
      t.notEqual(arrConst, arr, '')
      t.end()
      window.close()
    })
    var arr = new Uint8Array(16)
    w.postMessage([arr])
  })
}

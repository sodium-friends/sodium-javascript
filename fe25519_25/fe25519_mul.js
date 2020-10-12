
module.exports = loadWebAssembly

loadWebAssembly.supported = typeof WebAssembly !== 'undefined'

function loadWebAssembly (opts) {
  if (!loadWebAssembly.supported) return null

  var imp = opts && opts.imports
console.log(imp)
  var wasm = toUint8Array('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')
  var ready = null

  var mod = {
    buffer: wasm,
    memory: null,
    exports: null,
    realloc: realloc,
    onload: onload
  }

  onload(function () {})

  return mod

  function realloc (size) {
    mod.exports.memory.grow(Math.max(0, Math.ceil(Math.abs(size - mod.memory.length) / 65536)))
    mod.memory = new Uint8Array(mod.exports.memory.buffer)
  }

  function onload (cb) {
    if (mod.exports) return cb()

    if (ready) {
      ready.then(cb.bind(null, null)).catch(cb)
      return
    }

    try {
      if (opts && opts.async) throw new Error('async')
      setup({instance: new WebAssembly.Instance(new WebAssembly.Module(wasm), imp)})
    } catch (err) {
      ready = WebAssembly.instantiate(wasm, imp).then(setup)
    }

    onload(cb)
  }

  function setup (w) {
    mod.exports = w.instance.exports
    mod.memory = mod.exports.memory && mod.exports.memory.buffer && new Uint8Array(mod.exports.memory.buffer)
  }
}

function toUint8Array (s) {
  if (typeof atob === 'function') return new Uint8Array(atob(s).split('').map(charCodeAt))
  return (require('buf' + 'fer').Buffer).from(s, 'base64')
}

function charCodeAt (c) {
  return c.charCodeAt(0)
}


module.exports = loadWebAssembly

loadWebAssembly.supported = typeof WebAssembly !== 'undefined'

function loadWebAssembly (opts) {
  if (!loadWebAssembly.supported) return null

  var imp = opts && opts.imports
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

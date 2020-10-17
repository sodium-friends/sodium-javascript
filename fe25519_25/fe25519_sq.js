
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

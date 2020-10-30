
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

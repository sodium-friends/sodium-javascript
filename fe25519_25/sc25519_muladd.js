
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

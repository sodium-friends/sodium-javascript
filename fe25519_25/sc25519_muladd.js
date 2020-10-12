
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


module.exports = loadWebAssembly

loadWebAssembly.supported = typeof WebAssembly !== 'undefined'

function loadWebAssembly (opts) {
  if (!loadWebAssembly.supported) return null

  var imp = opts && opts.imports
  var wasm = toUint8Array('AGFzbQEAAAABFgJgDH5+fn5+fn5+fn5/fwBgA39/fwADAwIAAQUDAQABBxoCBm1lbW9yeQIADWZlMjU1MTlfbXVsMzIAAQrcBAKeBAEVfiAKrCEMIACnrCEAIAGnrCEBIAKnrCECIAOnrCEDIASnrCEEIAWnrCEFIAanrCEGIAenrCEHIAinrCEIIAmnrCEJIAAgDH4hDSABIAx+IQ4gAiAMfiEPIAMgDH4hECAEIAx+IREgBSAMfiESIAYgDH4hEyAHIAx+IRQgCCAMfiEVIAkgDH4hFiAWQgFCGIZ8QhmHISAgDSAgQhN+fCENIBYgIEIBQhmGfn0hFiAOQgFCGIZ8QhmHIRggDyAYfCEPIA4gGEIBQhmGfn0hDiAQQgFCGIZ8QhmHIRogESAafCERIBAgGkIBQhmGfn0hECASQgFCGIZ8QhmHIRwgEyAcfCETIBIgHEIBQhmGfn0hEiAUQgFCGIZ8QhmHIR4gFSAefCEVIBQgHkIBQhmGfn0hFCANQgFCGYZ8QhqHIRcgDiAXfCEOIA0gF0IBQhqGfn0hDSAPQgFCGYZ8QhqHIRkgECAZfCEQIA8gGUIBQhqGfn0hDyARQgFCGYZ8QhqHIRsgEiAbfCESIBEgG0IBQhqGfn0hESATQgFCGYZ8QhqHIR0gFCAdfCEUIBMgHUIBQhqGfn0hEyAVQgFCGYZ8QhqHIR8gFiAffCEWIBUgH0IBQhqGfn0hFSALIA0+AgAgCyAOPgIEIAsgDz4CCCALIBA+AgwgCyARPgIQIAsgEj4CFCALIBM+AhggCyAUPgIcIAsgFT4CICALIBY+AiQLOgAgATUCACABNQIEIAE1AgggATUCDCABNQIQIAE1AhQgATUCGCABNQIcIAE1AiAgATUCJCACIAAQAAs=')
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

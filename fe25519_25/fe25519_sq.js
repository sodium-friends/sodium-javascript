
module.exports = loadWebAssembly

loadWebAssembly.supported = typeof WebAssembly !== 'undefined'

function loadWebAssembly (opts) {
  if (!loadWebAssembly.supported) return null

  var imp = opts && opts.imports
  var wasm = toUint8Array('AGFzbQEAAAABCAFgBH9/f38AAwIBAAUDAQABBw8CBm1lbW9yeQIAAnNxAAAKzwoBzAoCAX9jfiABNQIAIQYgATUCBCEHIAE1AgghCCABNQIMIQkgATUCECEKIAE1AhQhCyABNQIYIQwgATUCHCENIAE1AiAhDiABNQIkIQ8CQANAIAanrCEGIAenrCEHIAinrCEIIAmnrCEJIAqnrCEKIAunrCELIAynrCEMIA2nrCENIA6nrCEOIA+nrCEPIAZCAn4hJCAHQgJ+ISUgCEICfiEmIAlCAn4hJyAKQgJ+ISggC0ICfiEpIAxCAn4hKiANQgJ+ISsgC0ImfiEsIAxCE34hLSANQiZ+IS4gDkITfiEvIA9CJn4hMCAGIAZ+ITEgJCAHfiEyICQgCH4hMyAkIAl+ITQgJCAKfiE1ICQgC34hNiAkIAx+ITcgJCANfiE4ICQgDn4hOSAkIA9+ITogJSAHfiE7ICUgCH4hPCAlICd+IT0gJSAKfiE+ICUgKX4hPyAlIAx+IUAgJSArfiFBICUgDn4hQiAlIDB+IUMgCCAIfiFEICYgCX4hRSAmIAp+IUYgJiALfiFHICYgDH4hSCAmIA1+IUkgJiAvfiFKIAggMH4hSyAnIAl+IUwgJyAKfiFNICcgKX4hTiAnIAx+IU8gJyAufiFQICcgL34hUSAnIDB+IVIgCiAKfiFTICggC34hVCAoIC1+IVUgCiAufiFWICggL34hVyAKIDB+IVggCyAsfiFZICkgLX4hWiApIC5+IVsgKSAvfiFcICkgMH4hXSAMIC1+IV4gDCAufiFfICogL34hYCAMIDB+IWEgDSAufiFiICsgL34hYyArIDB+IWQgDiAvfiFlIA4gMH4hZiAPIDB+IWcgMSBDIEogUCBVIFl8fHx8fCEQIDIgSyBRIFYgWnx8fHwhESAzIDsgUiBXIFsgXnx8fHx8IRIgNCA8IFggXCBffHx8fCETIDUgPSBEIF0gYCBifHx8fHwhFCA2ID4gRSBhIGN8fHx8IRUgNyA/IEYgTCBkIGV8fHx8fCEWIDggQCBHIE0gZnx8fHwhFyA5IEEgSCBOIFMgZ3x8fHx8IRggOiBCIEkgTyBUfHx8fCEZIAQgA0YNASAEQQFqIQQMAAsLIAJBAUYEQCAQIBB8IRAgESARfCERIBIgEnwhEiATIBN8IRMgFCAUfCEUIBUgFXwhFSAWIBZ8IRYgFyAXfCEXIBggGHwhGCAZIBl8IRkLIBBCAUIZhnxCGochGiARIBp8IREgECAaQgFCGoZ+fSEQIBRCAUIZhnxCGochHiAVIB58IRUgFCAeQgFCGoZ+fSEUIBFCAUIYhnxCGYchGyASIBt8IRIgESAbQgFCGYZ+fSERIBVCAUIYhnxCGYchHyAWIB98IRYgFSAfQgFCGYZ+fSEVIBJCAUIZhnxCGochHCATIBx8IRMgEiAcQgFCGoZ+fSESIBZCAUIZhnxCGochICAXICB8IRcgFiAgQgFCGoZ+fSEWIBNCAUIYhnxCGYchHSAUIB18IRQgEyAdQgFCGYZ+fSETIBdCAUIYhnxCGYchISAYICF8IRggFyAhQgFCGYZ+fSEXIBRCAUIZhnxCGochHiAVIB58IRUgFCAeQgFCGoZ+fSEUIBhCAUIZhnxCGochIiAZICJ8IRkgGCAiQgFCGoZ+fSEYIBlCAUIYhnxCGYchIyAQICNCE358IRAgGSAjQgFCGYZ+fSEZIBBCAUIZhnxCGochGiARIBp8IREgECAaQgFCGoZ+fSEQIAAgED4CACAAIBE+AgQgACASPgIIIAAgEz4CDCAAIBQ+AhAgACAVPgIUIAAgFj4CGCAAIBc+AhwgACAYPgIgIAAgGT4CJAs=')
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

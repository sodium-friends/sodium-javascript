
module.exports = loadWebAssembly

loadWebAssembly.supported = typeof WebAssembly !== 'undefined'

function loadWebAssembly (opts) {
  if (!loadWebAssembly.supported) return null

  var imp = opts && opts.imports
  var wasm = toUint8Array('AGFzbQEAAAABHwJgFX5+fn5+fn5+fn5+fn5+fn5+fn5+fwBgA39/fwACDgECanMFdGFibGUBcAABAwMCAAEFAwEAAQcYAgZtZW1vcnkCAAtmZTI1NTE5X211bAABCQcBAEEBCwEACv4QApAQAYYBfiAAp6whACABp6whASACp6whAiADp6whAyAEp6whBCAFp6whBSAGp6whBiAHp6whByAIp6whCCAJp6whCSAKp6whCiALp6whCyAMp6whDCANp6whDSAOp6whDiAPp6whDyAQp6whECARp6whESASp6whEiATp6whE0ITIAt+IAtCgICAgAiDQgGGQhN+fSEpQhMgDH4gDEKAgICACINCAYZCE359ISpCEyANfiANQoCAgIAIg0IBhkITfn0hK0ITIA5+IA5CgICAgAiDQgGGQhN+fSEsQhMgD34gD0KAgICACINCAYZCE359IS1CEyAQfiAQQoCAgIAIg0IBhkITfn0hLkITIBF+IBFCgICAgAiDQgGGQhN+fSEvQhMgEn4gEkKAgICACINCAYZCE359ITBCEyATfiATQoCAgIAIg0IBhkITfn0hMUICIAF+IAFCgICAgAiDQgGGQgJ+fSEyQgIgA34gA0KAgICACINCAYZCAn59ITNCAiAFfiAFQoCAgIAIg0IBhkICfn0hNEICIAd+IAdCgICAgAiDQgGGQgJ+fSE1QgIgCX4gCUKAgICACINCAYZCAn59ITYgKaesISkgKqesISogK6esISsgLKesISwgLaesIS0gLqesIS4gL6esIS8gMKesITAgMaesITEgMqesITIgM6esITMgNKesITQgNaesITUgNqesITYgACAKfiE3IAAgC34hOCAAIAx+ITkgACANfiE6IAAgDn4hOyAAIA9+ITwgACAQfiE9IAAgEX4hPiAAIBJ+IT8gACATfiFAIAEgCn4hQSAyIAt+IUIgASAMfiFDIDIgDX4hRCABIA5+IUUgMiAPfiFGIAEgEH4hRyAyIBF+IUggASASfiFJIDIgMX4hSiACIAp+IUsgAiALfiFMIAIgDH4hTSACIA1+IU4gAiAOfiFPIAIgD34hUCACIBB+IVEgAiARfiFSIAIgMH4hUyACIDF+IVQgAyAKfiFVIDMgC34hViADIAx+IVcgMyANfiFYIAMgDn4hWSAzIA9+IVogAyAQfiFbIDMgL34hXCADIDB+IV0gMyAxfiFeIAQgCn4hXyAEIAt+IWAgBCAMfiFhIAQgDX4hYiAEIA5+IWMgBCAPfiFkIAQgLn4hZSAEIC9+IWYgBCAwfiFnIAQgMX4haCAFIAp+IWkgNCALfiFqIAUgDH4hayA0IA1+IWwgBSAOfiFtIDQgLX4hbiAFIC5+IW8gNCAvfiFwIAUgMH4hcSA0IDF+IXIgBiAKfiFzIAYgC34hdCAGIAx+IXUgBiANfiF2IAYgLH4hdyAGIC1+IXggBiAufiF5IAYgL34heiAGIDB+IXsgBiAxfiF8IAcgCn4hfSA1IAt+IX4gByAMfiF/IDUgK34hgAEgByAsfiGBASA1IC1+IYIBIAcgLn4hgwEgNSAvfiGEASAHIDB+IYUBIDUgMX4hhgEgCCAKfiGHASAIIAt+IYgBIAggKn4hiQEgCCArfiGKASAIICx+IYsBIAggLX4hjAEgCCAufiGNASAIIC9+IY4BIAggMH4hjwEgCCAxfiGQASAJIAp+IZEBIDYgKX4hkgEgCSAqfiGTASA2ICt+IZQBIAkgLH4hlQEgNiAtfiGWASAJIC5+IZcBIDYgL34hmAEgCSAwfiGZASA2IDF+IZoBIDcgSiBTIFwgZSBuIHcggAEgiQEgkgF8fHx8fHx8fHwhFSA4IEEgVCBdIGYgbyB4IIEBIIoBIJMBfHx8fHx8fHx8IRYgOSBCIEsgXiBnIHAgeSCCASCLASCUAXx8fHx8fHx8fCEXIDogQyBMIFUgaCBxIHoggwEgjAEglQF8fHx8fHx8fHwhGCA7IEQgTSBWIF8gciB7IIQBII0BIJYBfHx8fHx8fHx8IRkgPCBFIE4gVyBgIGkgfCCFASCOASCXAXx8fHx8fHx8fCEaID0gRiBPIFggYSBqIHMghgEgjwEgmAF8fHx8fHx8fHwhGyA+IEcgUCBZIGIgayB0IH0gkAEgmQF8fHx8fHx8fHwhHCA/IEggUSBaIGMgbCB1IH4ghwEgmgF8fHx8fHx8fHwhHSBAIEkgUiBbIGQgbSB2IH8giAEgkQF8fHx8fHx8fHwhHiAVQgFCGYZ8QhqHIR8gFiAffCEWIBUgH0IBQhqGfn0hFSAZQgFCGYZ8QhqHISMgGiAjfCEaIBkgI0IBQhqGfn0hGSAWQgFCGIZ8QhmHISAgFyAgfCEXIBYgIEIBQhmGfn0hFiAaQgFCGIZ8QhmHISQgGyAkfCEbIBogJEIBQhmGfn0hGiAXQgFCGYZ8QhqHISEgGCAhfCEYIBcgIUIBQhqGfn0hFyAbQgFCGYZ8QhqHISUgHCAlfCEcIBsgJUIBQhqGfn0hGyAYQgFCGIZ8QhmHISIgGSAifCEZIBggIkIBQhmGfn0hGCAcQgFCGIZ8QhmHISYgHSAmfCEdIBwgJkIBQhmGfn0hHCAZQgFCGYZ8QhqHISMgGiAjfCEaIBkgI0IBQhqGfn0hGSAdQgFCGYZ8QhqHIScgHiAnfCEeIB0gJ0IBQhqGfn0hHSAeQgFCGIZ8QhmHISggFSAoQhN+fCEVIB4gKEIBQhmGfn0hHiAVQgFCGYZ8QhqHIR8gFiAffCEWIBUgH0IBQhqGfn0hFSAUIBU+AgAgFCAWPgIEIBQgFz4CCCAUIBg+AgwgFCAZPgIQIBQgGj4CFCAUIBs+AhggFCAcPgIcIBQgHT4CICAUIB4+AiQLagAgATUCACABNQIEIAE1AgggATUCDCABNQIQIAE1AhQgATUCGCABNQIcIAE1AiAgATUCJCACNQIAIAI1AgQgAjUCCCACNQIMIAI1AhAgAjUCFCACNQIYIAI1AhwgAjUCICACNQIkIAAQAAs=')
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

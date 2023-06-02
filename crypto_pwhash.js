/* eslint-disable camelcase */
const b4a = require('b4a')
const argon2 = require('../../wasm/argon2-wasm')
const { randombytes_buf } = require('./randombytes')

const crypto_pwhash_argon2i_ALG_ARGON2I13 = 1
const crypto_pwhash_argon2i_BYTES_MIN = 16
const crypto_pwhash_argon2i_BYTES_MAX = 4294967295
const crypto_pwhash_argon2i_PASSWD_MIN = 0
const crypto_pwhash_argon2i_PASSWD_MAX = 4294967295
const crypto_pwhash_argon2i_SALTBYTES = 16
const crypto_pwhash_argon2i_STRBYTES = 128
const crypto_pwhash_argon2i_STRPREFIX = '$argon2i$'
const crypto_pwhash_argon2i_OPSLIMIT_MIN = 3
const crypto_pwhash_argon2i_OPSLIMIT_MAX = 4294967295
const crypto_pwhash_argon2i_MEMLIMIT_MIN = 8192
const crypto_pwhash_argon2i_MEMLIMIT_MAX = 2147483648
const crypto_pwhash_argon2i_OPSLIMIT_INTERACTIVE = 4
const crypto_pwhash_argon2i_MEMLIMIT_INTERACTIVE = 33554432
const crypto_pwhash_argon2i_OPSLIMIT_MODERATE = 6
const crypto_pwhash_argon2i_MEMLIMIT_MODERATE = 134217728
const crypto_pwhash_argon2i_OPSLIMIT_SENSITIVE = 8
const crypto_pwhash_argon2i_MEMLIMIT_SENSITIVE = 536870912

const crypto_pwhash_argon2id_ALG_ARGON2ID13 = 2
const crypto_pwhash_argon2id_BYTES_MIN = 16
const crypto_pwhash_argon2id_BYTES_MAX = 4294967295
const crypto_pwhash_argon2id_PASSWD_MIN = 0
const crypto_pwhash_argon2id_PASSWD_MAX = 4294967295
const crypto_pwhash_argon2id_SALTBYTES = 16
const crypto_pwhash_argon2id_STRBYTES = 128
const crypto_pwhash_argon2id_STRPREFIX = '$argon2id$'
const crypto_pwhash_argon2id_OPSLIMIT_MIN = 1
const crypto_pwhash_argon2id_OPSLIMIT_MAX = 4294967295
const crypto_pwhash_argon2id_MEMLIMIT_MIN = 8192
const crypto_pwhash_argon2id_MEMLIMIT_MAX = 2147483648
const crypto_pwhash_argon2id_OPSLIMIT_INTERACTIVE = 2
const crypto_pwhash_argon2id_MEMLIMIT_INTERACTIVE = 67108864
const crypto_pwhash_argon2id_OPSLIMIT_MODERATE = 3
const crypto_pwhash_argon2id_MEMLIMIT_MODERATE = 268435456
const crypto_pwhash_argon2id_OPSLIMIT_SENSITIVE = 4
const crypto_pwhash_argon2id_MEMLIMIT_SENSITIVE = 1073741824

const crypto_pwhash_ALG_ARGON2I13 = crypto_pwhash_argon2i_ALG_ARGON2I13
const crypto_pwhash_ALG_ARGON2ID13 = crypto_pwhash_argon2id_ALG_ARGON2ID13
const crypto_pwhash_ALG_DEFAULT = crypto_pwhash_ALG_ARGON2ID13
const crypto_pwhash_BYTES_MIN = crypto_pwhash_argon2id_BYTES_MIN
const crypto_pwhash_BYTES_MAX = crypto_pwhash_argon2id_BYTES_MAX
const crypto_pwhash_PASSWD_MIN = crypto_pwhash_argon2id_PASSWD_MIN
const crypto_pwhash_PASSWD_MAX = crypto_pwhash_argon2id_PASSWD_MAX
const crypto_pwhash_SALTBYTES = crypto_pwhash_argon2id_SALTBYTES
const crypto_pwhash_STRBYTES = crypto_pwhash_argon2id_STRBYTES
const crypto_pwhash_STRPREFIX = crypto_pwhash_argon2id_STRPREFIX
const crypto_pwhash_OPSLIMIT_MIN = crypto_pwhash_argon2id_OPSLIMIT_MIN
const crypto_pwhash_OPSLIMIT_MAX = crypto_pwhash_argon2id_OPSLIMIT_MAX
const crypto_pwhash_MEMLIMIT_MIN = crypto_pwhash_argon2id_MEMLIMIT_MIN
const crypto_pwhash_MEMLIMIT_MAX = crypto_pwhash_argon2id_MEMLIMIT_MAX
const crypto_pwhash_OPSLIMIT_INTERACTIVE = crypto_pwhash_argon2id_OPSLIMIT_INTERACTIVE
const crypto_pwhash_MEMLIMIT_INTERACTIVE = crypto_pwhash_argon2id_MEMLIMIT_INTERACTIVE
const crypto_pwhash_OPSLIMIT_MODERATE = crypto_pwhash_argon2id_OPSLIMIT_MODERATE
const crypto_pwhash_MEMLIMIT_MODERATE = crypto_pwhash_argon2id_MEMLIMIT_MODERATE
const crypto_pwhash_OPSLIMIT_SENSITIVE = crypto_pwhash_argon2id_OPSLIMIT_SENSITIVE
const crypto_pwhash_MEMLIMIT_SENSITIVE = crypto_pwhash_argon2id_MEMLIMIT_SENSITIVE

module.exports = {
  crypto_pwhash_ALG_ARGON2I13,
  crypto_pwhash_ALG_ARGON2ID13,
  crypto_pwhash_ALG_DEFAULT,
  crypto_pwhash_BYTES_MIN,
  crypto_pwhash_BYTES_MAX,
  crypto_pwhash_PASSWD_MIN,
  crypto_pwhash_PASSWD_MAX,
  crypto_pwhash_SALTBYTES,
  crypto_pwhash_STRBYTES,
  crypto_pwhash_STRPREFIX,
  crypto_pwhash_OPSLIMIT_MIN,
  crypto_pwhash_OPSLIMIT_MAX,
  crypto_pwhash_MEMLIMIT_MIN,
  crypto_pwhash_MEMLIMIT_MAX,
  crypto_pwhash_OPSLIMIT_INTERACTIVE,
  crypto_pwhash_MEMLIMIT_INTERACTIVE,
  crypto_pwhash_OPSLIMIT_MODERATE,
  crypto_pwhash_MEMLIMIT_MODERATE,
  crypto_pwhash_OPSLIMIT_SENSITIVE,
  crypto_pwhash_MEMLIMIT_SENSITIVE,
  crypto_pwhash_argon2i,
  crypto_pwhash_argon2id,
  crypto_pwhash_argon2i_str,
  crypto_pwhash_argon2id_str,
  crypto_pwhash,
  crypto_pwhash_str,
  crypto_pwhash_str_verify,
  crypto_pwhash_str_needs_rehash
}

function crypto_pwhash_argon2i (out, passwd, salt, passes, memory, alg) {
  const outlen = out.byteLength
  const passwdlen = passwd.byteLength
  out.fill(0)

  if (outlen > crypto_pwhash_argon2i_BYTES_MAX) {
    throw new Error('Too large')
  }

  if (outlen < crypto_pwhash_argon2i_BYTES_MIN) {
    throw new Error('Invalid opts')
  }

  if (passwdlen > crypto_pwhash_argon2i_PASSWD_MAX ||
    passes > crypto_pwhash_argon2i_OPSLIMIT_MAX ||
    memory > crypto_pwhash_argon2i_MEMLIMIT_MAX) {
    throw new Error('Too large')
  }

  if (passwdlen < crypto_pwhash_argon2i_PASSWD_MIN ||
    (passes && passes < crypto_pwhash_argon2i_OPSLIMIT_MIN) ||
    (memory && memory < crypto_pwhash_argon2i_MEMLIMIT_MIN)) {
    throw new Error('Invalid opts')
  }

  switch (alg) {
    case crypto_pwhash_argon2i_ALG_ARGON2I13: {
      const buf = argon2(passwd, salt, null, null, 'binary', { memory: memory >> 10, passes, outlen, type: argon2.ARGON2I })
      out.set(buf)
      return 0
    }

    default:
      throw new Error('Invalid input')
  }
}

function crypto_pwhash_argon2id (out, passwd, salt, passes, memory, alg) {
  const outlen = out.byteLength
  const passwdlen = passwd.byteLength
  out.fill(0)

  if (outlen > crypto_pwhash_argon2id_BYTES_MAX) {
    throw new Error('Too large')
  }

  if (outlen < crypto_pwhash_argon2id_BYTES_MIN) {
    throw new Error('Invalid opts')
  }

  if (passwdlen > crypto_pwhash_argon2id_PASSWD_MAX ||
    passes > crypto_pwhash_argon2id_OPSLIMIT_MAX ||
    memory > crypto_pwhash_argon2id_MEMLIMIT_MAX) {
    throw new Error('Too large')
  }

  if (passwdlen < crypto_pwhash_argon2id_PASSWD_MIN ||
    (passes && passes < crypto_pwhash_argon2id_OPSLIMIT_MIN) ||
    (memory && memory < crypto_pwhash_argon2id_MEMLIMIT_MIN)) {
    throw new Error('Invalid opts')
  }

  switch (alg) {
    case crypto_pwhash_argon2id_ALG_ARGON2ID13: {
      const buf = argon2(passwd, salt, null, null, 'binary', { memory: memory >> 10, passes, outlen, type: argon2.ARGON2ID })
      out.set(buf)
      return 0
    }

    default:
      throw new Error('Invalid input')
  }
}

function crypto_pwhash_argon2i_str (out, passwd, salt, passes, memory, alg) {
  const outlen = 32
  const passwdlen = passwd.byteLength

  if (passwdlen > crypto_pwhash_argon2i_PASSWD_MAX ||
    passes > crypto_pwhash_argon2i_OPSLIMIT_MAX ||
    memory > crypto_pwhash_argon2i_MEMLIMIT_MAX) {
    throw new Error('Too large')
  }

  if (passwdlen < crypto_pwhash_argon2i_PASSWD_MIN ||
    (passes && passes < crypto_pwhash_argon2i_OPSLIMIT_MIN) ||
    (memory && memory < crypto_pwhash_argon2i_MEMLIMIT_MIN)) {
    throw new Error('Invalid opts')
  }

  switch (alg) {
    case crypto_pwhash_argon2i_ALG_ARGON2I13:
      return argon2(passwd, salt, null, null, { memory: memory >> 10, passes, outlen, type: argon2.ARGON2I })

    default:
      throw new Error('Invalid input')
  }
}

function crypto_pwhash_argon2id_str (out, passwd, salt, passes, memory, alg) {
  const outlen = 32
  const passwdlen = passwd.byteLength

  if (passwdlen > crypto_pwhash_argon2id_PASSWD_MAX ||
    passes > crypto_pwhash_argon2id_OPSLIMIT_MAX ||
    memory > crypto_pwhash_argon2id_MEMLIMIT_MAX) {
    throw new Error('Too large')
  }

  if (passwdlen < crypto_pwhash_argon2id_PASSWD_MIN ||
    (passes && passes < crypto_pwhash_argon2id_OPSLIMIT_MIN) ||
    (memory && memory < crypto_pwhash_argon2id_MEMLIMIT_MIN)) {
    throw new Error('Invalid opts')
  }

  switch (alg) {
    case crypto_pwhash_argon2id_ALG_ARGON2ID13:
      out.write(argon2(passwd, salt, null, null, { memory: memory >> 10, passes, outlen, type: argon2.ARGON2ID }))
      return

    default:
      throw new Error('Invalid input')
  }
}

function crypto_pwhash (out, passwd, salt, opslimit, memlimit, alg) {
  switch (alg) {
    case crypto_pwhash_argon2i_ALG_ARGON2I13:
      return crypto_pwhash_argon2i(out, passwd, salt, opslimit, memlimit, alg)

    case crypto_pwhash_argon2id_ALG_ARGON2ID13:
      return crypto_pwhash_argon2id(out, passwd, salt, opslimit, memlimit, alg)
  }
}

function crypto_pwhash_str (out, passwd, opslimit, memlimit) {
  const salt = b4a.alloc(crypto_pwhash_SALTBYTES)
  randombytes_buf(salt)

  return crypto_pwhash_argon2id_str(out, passwd, salt, opslimit, memlimit, crypto_pwhash_ALG_DEFAULT)
}

function crypto_pwhash_str_verify (str, passwd) {
  if (b4a.isBuffer(str)) return crypto_pwhash_str_verify(str.toString(), passwd)

  if (str.slice(0, crypto_pwhash_argon2id_STRPREFIX.length) === crypto_pwhash_argon2id_STRPREFIX) {
    return argon2.verify(str, passwd, null)
  }

  if (str.slice(0, crypto_pwhash_argon2i_STRPREFIX.length) === crypto_pwhash_argon2i_STRPREFIX) {
    return argon2.verify(str, passwd, null)
  }

  return false
}

function crypto_pwhash_str_needs_rehash (str, opslimit, memlimit, type) {
  memlimit >>= 10

  if ((opslimit | memlimit) > 0xffffffff || (str.byteLength > crypto_pwhash_STRBYTES)) {
    throw new Error('Invalid opts.')
  }

  try {
    return argon2.needsRehash(str, opslimit, memlimit, type)
  } catch {
    return true
  }
}

/* eslint-disable camelcase */
const { assert } = require('nanoassert')
const { randombytes_buf } = require('./randombytes')
const { crypto_stream_chacha20_ietf, crypto_stream_chacha20_ietf_xor, crypto_stream_chacha20_ietf_xor_ic, crypto_stream_chacha20_ietf_KEYBYTES, crypto_stream_chacha20_ietf_NONCEBYTES } = require('./crypto_stream_chacha20')
const { crypto_core_hchacha20, crypto_core_hchacha20_INPUTBYTES } = require('./crypto_core_hchacha20')
const Poly1305 = require('./internal/poly1305')

const crypto_secretstream_xchacha20poly1305_COUNTERBYTES = 4
const crypto_secretstream_xchacha20poly1305_INONCEBYTES = 8

const crypto_aead_xchacha20poly1305_ietf_KEYBYTES = 32
const crypto_secretstream_xchacha20poly1305_KEYBYTES = crypto_aead_xchacha20poly1305_ietf_KEYBYTES

// #define crypto_secretstream_xchacha20poly1305_HEADERBYTES \
// crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
const crypto_aead_xchacha20poly1305_ietf_NPUBBYTES = 24
const crypto_secretstream_xchacha20poly1305_HEADERBYTES = crypto_aead_xchacha20poly1305_ietf_NPUBBYTES

// #define crypto_aead_xchacha20poly1305_ietf_ABYTES 16U
const crypto_aead_xchacha20poly1305_ietf_ABYTES = 16
// #define crypto_secretstream_xchacha20poly1305_ABYTES \
//     (1U + crypto_aead_xchacha20poly1305_ietf_ABYTES)
const crypto_secretstream_xchacha20poly1305_ABYTES = 1 + crypto_aead_xchacha20poly1305_ietf_ABYTES

// #define crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX \
//     SODIUM_MIN(SODIUM_SIZE_MAX - crypto_secretstream_xchacha20poly1305_ABYTES, \
//               (64ULL * ((1ULL << 32) - 2ULL)))
const crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX = Number.MAX_SAFE_INTEGER
const crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX = Number.MAX_SAFE_INTEGER

// #define STATE_COUNTER(STATE) ((STATE)->nonce)
// #define STATE_INONCE(STATE)  ((STATE)->nonce + \
//                               crypto_secretstream_xchacha20poly1305_COUNTERBYTES)

const _pad0 = new Uint8Array(16).fill(0)

class crypto_secretstream_xchacha20poly1305_state {
  constructor (k, nonce, pad) {
    this.k = Uint8Array(crypto_stream_chacha20_ietf_KEYBYTES).fill(0)
    this.nonce = Uint8Array(crypto_stream_chacha20_ietf_NONCEBYTES).fill(0)
    this.pad = Uint8Array(8).fill(0)
  }
}

// static inline void
// _crypto_secretstream_xchacha20poly1305_counter_reset
//     (crypto_secretstream_xchacha20poly1305_state *state)
// {
//     memset(STATE_COUNTER(state), 0,
//            crypto_secretstream_xchacha20poly1305_COUNTERBYTES);
//     STATE_COUNTER(state)[0] = 1;
// }
function _crypto_secretstream_xchacha20poly1305_counter_reset (state) {
  assert(state instanceof crypto_secretstream_xchacha20poly1305_state, 'state is not an instance of crypto_secretstream_xchacha20poly1305_state')
  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_COUNTERBYTES; i++) {
    state[i] = 0
  }
  state[0] = 1
}

// void
// crypto_secretstream_xchacha20poly1305_keygen
//    (unsigned char k[crypto_secretstream_xchacha20poly1305_KEYBYTES])
// {
//     randombytes_buf(k, crypto_secretstream_xchacha20poly1305_KEYBYTES);
// }
function crypto_secretstream_xchacha20poly1305_keygen (k) {
  assert(k.length === crypto_secretstream_xchacha20poly1305_KEYBYTES)
  randombytes_buf(k)
}

// int
// crypto_secretstream_xchacha20poly1305_init_push
//    (crypto_secretstream_xchacha20poly1305_state *state,
//     unsigned char out[crypto_secretstream_xchacha20poly1305_HEADERBYTES],
//     const unsigned char k[crypto_secretstream_xchacha20poly1305_KEYBYTES])
// {
//     COMPILER_ASSERT(crypto_secretstream_xchacha20poly1305_HEADERBYTES ==
//                     crypto_core_hchacha20_INPUTBYTES +
//                     crypto_secretstream_xchacha20poly1305_INONCEBYTES);
//     COMPILER_ASSERT(crypto_secretstream_xchacha20poly1305_HEADERBYTES ==
//                     crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
//     COMPILER_ASSERT(sizeof state->nonce ==
//                     crypto_secretstream_xchacha20poly1305_INONCEBYTES +
//                     crypto_secretstream_xchacha20poly1305_COUNTERBYTES);

//     randombytes_buf(out, crypto_secretstream_xchacha20poly1305_HEADERBYTES);
//     crypto_core_hchacha20(state->k, out, k, NULL);
//     _crypto_secretstream_xchacha20poly1305_counter_reset(state);
//     memcpy(STATE_INONCE(state), out + crypto_core_hchacha20_INPUTBYTES,
//            crypto_secretstream_xchacha20poly1305_INONCEBYTES);
//     memset(state->_pad, 0, sizeof state->_pad);

//     return 0;
// }
function crypto_secretstream_xchacha20poly1305_init_push (state, out, k) {
  assert(state instanceof crypto_secretstream_xchacha20poly1305_state, 'state not instance of crypto_secretstream_xchacha20poly1305_state')
  assert(out instanceof Uint8Array && out.length === crypto_secretstream_xchacha20poly1305_HEADERBYTES, 'out not byte array of length crypto_secretstream_xchacha20poly1305_HEADERBYTES')
  assert(k instanceof Uint8Array && k.length === crypto_secretstream_xchacha20poly1305_KEYBYTES, 'k not byte array of length crypto_secretstream_xchacha20poly1305_KEYBYTES')
  assert(crypto_secretstream_xchacha20poly1305_HEADERBYTES === crypto_core_hchacha20_INPUTBYTES + crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  assert(crypto_secretstream_xchacha20poly1305_HEADERBYTES === crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
  assert(state.nonce.length === crypto_secretstream_xchacha20poly1305_INONCEBYTES + crypto_secretstream_xchacha20poly1305_COUNTERBYTES)

  randombytes_buf(out, crypto_secretstream_xchacha20poly1305_HEADERBYTES)
  crypto_core_hchacha20(state.k, out, k, null)
  _crypto_secretstream_xchacha20poly1305_counter_reset(state)
  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    state.nonce[i + crypto_secretstream_xchacha20poly1305_COUNTERBYTES] = out[i + crypto_core_hchacha20_INPUTBYTES]
  }
  state.pad.fill(0)
  return 0
}

// int
// crypto_secretstream_xchacha20poly1305_init_pull
//    (crypto_secretstream_xchacha20poly1305_state *state,
//     const unsigned char in[crypto_secretstream_xchacha20poly1305_HEADERBYTES],
//     const unsigned char k[crypto_secretstream_xchacha20poly1305_KEYBYTES])
// {
//     crypto_core_hchacha20(state->k, in, k, NULL);
//     _crypto_secretstream_xchacha20poly1305_counter_reset(state);
//     memcpy(STATE_INONCE(state), in + crypto_core_hchacha20_INPUTBYTES,
//            crypto_secretstream_xchacha20poly1305_INONCEBYTES);
//     memset(state->_pad, 0, sizeof state->_pad);

//     return 0;
// }
function crypto_secretstream_xchacha20poly1305_init_pull (state, _in, k) {
  assert(state instanceof crypto_secretstream_xchacha20poly1305_state,
    'state not instance of crypto_secretstream_xchacha20poly1305_state')
  assert(_in instanceof Uint8Array && _in.length === crypto_secretstream_xchacha20poly1305_HEADERBYTES,
    '_in not byte array of length crypto_secretstream_xchacha20poly1305_HEADERBYTES')
  assert(k instanceof Uint8Array && k.length === crypto_secretstream_xchacha20poly1305_KEYBYTES,
    'k not byte array of length crypto_secretstream_xchacha20poly1305_KEYBYTES')
  crypto_core_hchacha20(state.k, _in, k, null)
  _crypto_secretstream_xchacha20poly1305_counter_reset(state)

  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    state.nonce[i + crypto_secretstream_xchacha20poly1305_COUNTERBYTES] = _in[i + crypto_core_hchacha20_INPUTBYTES]
  }
  state.pad.fill(0)
  return 0
}

// void
// crypto_secretstream_xchacha20poly1305_rekey
//     (crypto_secretstream_xchacha20poly1305_state *state)
// {
//     unsigned char new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES +
//                                      crypto_secretstream_xchacha20poly1305_INONCEBYTES];
//     size_t        i;

//     for (i = 0U; i < crypto_stream_chacha20_ietf_KEYBYTES; i++) {
//         new_key_and_inonce[i] = state->k[i];
//     }
//     for (i = 0U; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
//         new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES + i] =
//             STATE_INONCE(state)[i];
//     }
//     crypto_stream_chacha20_ietf_xor(new_key_and_inonce, new_key_and_inonce,
//                                     sizeof new_key_and_inonce,
//                                     state->nonce, state->k);
//     for (i = 0U; i < crypto_stream_chacha20_ietf_KEYBYTES; i++) {
//         state->k[i] = new_key_and_inonce[i];
//     }
//     for (i = 0U; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
//         STATE_INONCE(state)[i] =
//             new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES + i];
//     }
//     _crypto_secretstream_xchacha20poly1305_counter_reset(state);
// }
function crypto_secretstream_xchacha20poly1305_rekey (state) {
  assert(state instanceof crypto_secretstream_xchacha20poly1305_state,
    'state not instance of crypto_secretstream_xchacha20poly1305_state')
  const new_key_and_inonce = new Uint8Array(
    crypto_stream_chacha20_ietf_KEYBYTES + crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  let i
  for (i = 0; i < crypto_stream_chacha20_ietf_KEYBYTES; i++) {
    new_key_and_inonce[i] = state.k[i]
  }
  for (i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES + i] =
      state.nonce[crypto_secretstream_xchacha20poly1305_COUNTERBYTES + i]
  }
  crypto_stream_chacha20_ietf_xor(new_key_and_inonce, new_key_and_inonce, state.nonce, state.k)
  for (i = 0; i < crypto_stream_chacha20_ietf_KEYBYTES; i++) {
    state.k[i] = new_key_and_inonce[i]
  }
  for (i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    state.nonce[crypto_secretstream_xchacha20poly1305_COUNTERBYTES + i] =
      new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES + i]
  }
  _crypto_secretstream_xchacha20poly1305_counter_reset(state)
}

// int
// crypto_secretstream_xchacha20poly1305_push
//    (crypto_secretstream_xchacha20poly1305_state *state,
//     unsigned char *out, unsigned long long *outlen_p,
//     const unsigned char *m, unsigned long long mlen,
//     const unsigned char *ad, unsigned long long adlen, unsigned char tag)
// {
//     crypto_onetimeauth_poly1305_state poly1305_state;
//     unsigned char                     block[64U];
//     unsigned char                     slen[8U];
//     unsigned char                    *c;
//     unsigned char                    *mac;

//     if (outlen_p != NULL) {
//         *outlen_p = 0U;
//     }
//     COMPILER_ASSERT(crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX
//                     <= crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX);
//     if (mlen > crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX) {
//         sodium_misuse();
//     }
//     crypto_stream_chacha20_ietf(block, sizeof block, state->nonce, state->k);
//     crypto_onetimeauth_poly1305_init(&poly1305_state, block);
//     sodium_memzero(block, sizeof block);

//     crypto_onetimeauth_poly1305_update(&poly1305_state, ad, adlen);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, _pad0,
//                                        (0x10 - adlen) & 0xf);
//     memset(block, 0, sizeof block);
//     block[0] = tag;

//     crypto_stream_chacha20_ietf_xor_ic(block, block, sizeof block,
//                                        state->nonce, 1U, state->k);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, block, sizeof block);
//     out[0] = block[0];

//     c = out + (sizeof tag);
//     crypto_stream_chacha20_ietf_xor_ic(c, m, mlen, state->nonce, 2U, state->k);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, c, mlen);
//     crypto_onetimeauth_poly1305_update
//         (&poly1305_state, _pad0, (0x10 - (sizeof block) + mlen) & 0xf);
//     /* should have been (0x10 - (sizeof block + mlen)) & 0xf to keep input blocks aligned */

//     STORE64_LE(slen, (uint64_t) adlen);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, slen, sizeof slen);
//     STORE64_LE(slen, (sizeof block) + mlen);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, slen, sizeof slen);

//     mac = c + mlen;
//     crypto_onetimeauth_poly1305_final(&poly1305_state, mac);
//     sodium_memzero(&poly1305_state, sizeof poly1305_state);

//     COMPILER_ASSERT(crypto_onetimeauth_poly1305_BYTES >=
//                     crypto_secretstream_xchacha20poly1305_INONCEBYTES);
//     XOR_BUF(STATE_INONCE(state), mac,
//             crypto_secretstream_xchacha20poly1305_INONCEBYTES);
//     sodium_increment(STATE_COUNTER(state),
//                      crypto_secretstream_xchacha20poly1305_COUNTERBYTES);
//     if ((tag & crypto_secretstream_xchacha20poly1305_TAG_REKEY) != 0 ||
//         sodium_is_zero(STATE_COUNTER(state),
//                        crypto_secretstream_xchacha20poly1305_COUNTERBYTES)) {
//         crypto_secretstream_xchacha20poly1305_rekey(state);
//     }
//     if (outlen_p != NULL) {
//         *outlen_p = crypto_secretstream_xchacha20poly1305_ABYTES + mlen;
//     }
//     return 0;
// }
function crypto_secretstream_xchacha20poly1305_push (state, out, m, ad, tag) {
  const block = new Uint8Array(64)

  assert(crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX <=
    crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX)

  crypto_stream_chacha20_ietf(block, state.nonce, state.k)
  const poly = new Poly1305(block)
  block.fill(0)

  poly.update(ad, 0, ad.byteLength)
  poly.update(_pad0, 0, (0x10 - ad.byteLength) & 0xf)

  block[0] = tag
  crypto_stream_chacha20_ietf_xor_ic(block, state.nonce, 1, state.k)

  poly.update(block, 0, block.byteLength)
  out[0] = block[0];

  // block is 64 bytes. sizeof tag is 1, as it's a byte, so c is the subarray starting at out[1]
  // c = out + (sizeof tag);
  let c = out.subarray(1, out.byteLength)
  crypto_stream_chacha20_ietf_xor_ic(c, m, state.nonce, 2, state.key)

}

// int
// crypto_secretstream_xchacha20poly1305_pull
//    (crypto_secretstream_xchacha20poly1305_state *state,
//     unsigned char *m, unsigned long long *mlen_p, unsigned char *tag_p,
//     const unsigned char *in, unsigned long long inlen,
//     const unsigned char *ad, unsigned long long adlen)
// {
//     crypto_onetimeauth_poly1305_state poly1305_state;
//     unsigned char                     block[64U];
//     unsigned char                     slen[8U];
//     unsigned char                     mac[crypto_onetimeauth_poly1305_BYTES];
//     const unsigned char              *c;
//     const unsigned char              *stored_mac;
//     unsigned long long                mlen;
//     unsigned char                     tag;

//     if (mlen_p != NULL) {
//         *mlen_p = 0U;
//     }
//     if (tag_p != NULL) {
//         *tag_p = 0xff;
//     }
//     if (inlen < crypto_secretstream_xchacha20poly1305_ABYTES) {
//         return -1;
//     }
//     mlen = inlen - crypto_secretstream_xchacha20poly1305_ABYTES;
//     if (mlen > crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX) {
//         sodium_misuse();
//     }
//     crypto_stream_chacha20_ietf(block, sizeof block, state->nonce, state->k);
//     crypto_onetimeauth_poly1305_init(&poly1305_state, block);
//     sodium_memzero(block, sizeof block);

//     crypto_onetimeauth_poly1305_update(&poly1305_state, ad, adlen);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, _pad0,
//                                        (0x10 - adlen) & 0xf);

//     memset(block, 0, sizeof block);
//     block[0] = in[0];
//     crypto_stream_chacha20_ietf_xor_ic(block, block, sizeof block,
//                                        state->nonce, 1U, state->k);
//     tag = block[0];
//     block[0] = in[0];
//     crypto_onetimeauth_poly1305_update(&poly1305_state, block, sizeof block);

//     c = in + (sizeof tag);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, c, mlen);
//     crypto_onetimeauth_poly1305_update
//         (&poly1305_state, _pad0, (0x10 - (sizeof block) + mlen) & 0xf);
//     /* should have been (0x10 - (sizeof block + mlen)) & 0xf to keep input blocks aligned */

//     STORE64_LE(slen, (uint64_t) adlen);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, slen, sizeof slen);
//     STORE64_LE(slen, (sizeof block) + mlen);
//     crypto_onetimeauth_poly1305_update(&poly1305_state, slen, sizeof slen);

//     crypto_onetimeauth_poly1305_final(&poly1305_state, mac);
//     sodium_memzero(&poly1305_state, sizeof poly1305_state);

//     stored_mac = c + mlen;
//     if (sodium_memcmp(mac, stored_mac, sizeof mac) != 0) {
//         sodium_memzero(mac, sizeof mac);
//         return -1;
//     }

//     crypto_stream_chacha20_ietf_xor_ic(m, c, mlen, state->nonce, 2U, state->k);
//     XOR_BUF(STATE_INONCE(state), mac,
//             crypto_secretstream_xchacha20poly1305_INONCEBYTES);
//     sodium_increment(STATE_COUNTER(state),
//                      crypto_secretstream_xchacha20poly1305_COUNTERBYTES);
//     if ((tag & crypto_secretstream_xchacha20poly1305_TAG_REKEY) != 0 ||
//         sodium_is_zero(STATE_COUNTER(state),
//                        crypto_secretstream_xchacha20poly1305_COUNTERBYTES)) {
//         crypto_secretstream_xchacha20poly1305_rekey(state);
//     }
//     if (mlen_p != NULL) {
//         *mlen_p = mlen;
//     }
//     if (tag_p != NULL) {
//         *tag_p = tag;
//     }
//     return 0;
// }

// size_t
// crypto_secretstream_xchacha20poly1305_statebytes(void)
// {
//     return sizeof(crypto_secretstream_xchacha20poly1305_state);
// }

// size_t
// crypto_secretstream_xchacha20poly1305_abytes(void)
// {
//     return crypto_secretstream_xchacha20poly1305_ABYTES;
// }

// size_t
// crypto_secretstream_xchacha20poly1305_headerbytes(void)
// {
//     return crypto_secretstream_xchacha20poly1305_HEADERBYTES;
// }

// size_t
// crypto_secretstream_xchacha20poly1305_keybytes(void)
// {
//     return crypto_secretstream_xchacha20poly1305_KEYBYTES;
// }

// size_t
// crypto_secretstream_xchacha20poly1305_messagebytes_max(void)
// {
//     return crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX;
// }

// unsigned char
// crypto_secretstream_xchacha20poly1305_tag_message(void)
// {
//     return crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;
// }

// unsigned char
// crypto_secretstream_xchacha20poly1305_tag_push(void)
// {
//     return crypto_secretstream_xchacha20poly1305_TAG_PUSH;
// }

// unsigned char
// crypto_secretstream_xchacha20poly1305_tag_rekey(void)
// {
//     return crypto_secretstream_xchacha20poly1305_TAG_REKEY;
// }

// unsigned char
// crypto_secretstream_xchacha20poly1305_tag_final(void)
// {
//     return crypto_secretstream_xchacha20poly1305_TAG_FINAL;
// }

module.exports = {
  crypto_aead_xchacha20poly1305_ietf_ABYTES,
  crypto_secretstream_xchacha20poly1305_ABYTES,
  crypto_secretstream_xchacha20poly1305_keygen,
  crypto_secretstream_xchacha20poly1305_init_push,
  crypto_secretstream_xchacha20poly1305_init_pull,
  crypto_secretstream_xchacha20poly1305_rekey,
  crypto_secretstream_xchacha20poly1305_push
}

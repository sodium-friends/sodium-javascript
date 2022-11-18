const b4a = require('b4a')
const assert = require('nanoassert')

const {
  ge25519_p3,
  ge25519_p1p1,
  ge25519_cached,
  ge25519_frombytes,
  ge25519_p3_tobytes,
  ge25519_p1p1_to_p3,
  ge25519_p3_to_cached,
  ge25519_is_on_curve,
  ge25519_is_canonical,
  ge25519_is_on_main_subgroup,
  ge25519_has_small_order,
  ge25519_add_cached,
  ge25519_sub_cached,
  ge25519_from_uniform,
  sc25519_reduce,
  sc25519_mul,
  sc25519_invert,
  sc25519_is_canonical
} = require('./fe25519_25.js')

const { randombytes_buf } = require('./randombytes')

const {
  sodium_add,
  sodium_sub,
  sodium_is_zero,
  sodium_memzero
} = require('./utils')

function crypto_core_ed25519_is_valid_point (p) {
  const p_p3 = ge25519_p3()

  if (ge25519_is_canonical(p) == 0 ||
      ge25519_has_small_order(p) != 0 ||
      ge25519_frombytes(p_p3, p) != 0 ||
      ge25519_is_on_curve(p_p3) == 0 ||
      ge25519_is_on_main_subgroup(p_p3) == 0) {
    return false;
  }
  return true;
}

function crypto_core_ed25519_add (r, p, q) {
  const p_p3 = ge25519_p3()
  const q_p3 = ge25519_p3()
  const r_p3 = ge25519_p3()

  const r_p1p1 = ge25519_p1p1()
  const q_cached = ge25519_cached()

  if (ge25519_frombytes(p_p3, p) != 0 || ge25519_is_on_curve(p_p3) == 0 ||
      ge25519_frombytes(q_p3, q) != 0 || ge25519_is_on_curve(q_p3) == 0) {
    throw new Error('Operands must be valid points.')
  }

  ge25519_p3_to_cached(q_cached, q_p3)
  ge25519_add_cached(r_p1p1, p_p3, q_cached)
  ge25519_p1p1_to_p3(r_p3, r_p1p1)
  ge25519_p3_tobytes(r, r_p3)
}

function crypto_core_ed25519_sub (r, p, q) {
  const p_p3 = ge25519_p3()
  const q_p3 = ge25519_p3()
  const r_p3 = ge25519_p3()

  const r_p1p1 = ge25519_p1p1()
  const q_cached = ge25519_cached()

  if (ge25519_frombytes(p_p3, p) != 0 || ge25519_is_on_curve(p_p3) == 0 ||
      ge25519_frombytes(q_p3, q) != 0 || ge25519_is_on_curve(q_p3) == 0) {
    throw new Error('Operands must be valid points.')
  }
  ge25519_p3_to_cached(q_cached, q_p3);
  ge25519_sub_cached(r_p1p1, p_p3, q_cached);
  ge25519_p1p1_to_p3(r_p3, r_p1p1);
  ge25519_p3_tobytes(r, r_p3);
}

function crypto_core_ed25519_from_uniform (p, r) {
    ge25519_from_uniform(p, r)
}

// const HASH_GE_L = 48

// function _string_to_points (px, n, ctx, msg, msg_len, hash_alg) {
//     const h = b4a.alloc(crypto_core_ed25519_HASHBYTES)
//     const h_be = b4a.alloc(2 * HASH_GE_L)

//     let i
//     let j

//     if (n > 2) {
//         // abort(); /* LCOV_EXCL_LINE */
//         throw new Error('abort')
//     }
//     if (core_h2c_string_to_hash(h_be, n * HASH_GE_L, ctx, msg, msg_len,
//                                 hash_alg) != 0) {
//         return -1;
//     }
//     COMPILER_ASSERT(sizeof h >= HASH_GE_L);
//     for (i = 0U; i < n; i++) {
//         for (j = 0U; j < HASH_GE_L; j++) {
//             h[j] = h_be[i * HASH_GE_L + HASH_GE_L - 1U - j];
//         }
//         memset(&h[j], 0, (sizeof h) - j);
//         ge25519_from_hash(&px[i * crypto_core_ed25519_BYTES], h);
//     }
//     return 0;
// }

// int
// crypto_core_ed25519_from_string(unsigned char p[crypto_core_ed25519_BYTES],
//                                 const char *ctx, msg,
//                                 size_t msg_len, int hash_alg)
// {
//     return _string_to_points(p, 1, ctx, msg, msg_len, hash_alg);
// }

// int
// crypto_core_ed25519_from_string_ro(unsigned char p[crypto_core_ed25519_BYTES],
//                                    const char *ctx, msg,
//                                    size_t msg_len, int hash_alg)
// {
//     unsigned char px[2 * crypto_core_ed25519_BYTES];

//     if (_string_to_points(px, 2, ctx, msg, msg_len, hash_alg) != 0) {
//         return -1;
//     }
//     return crypto_core_ed25519_add(p, &px[0], &px[crypto_core_ed25519_BYTES]);
// }


function crypto_core_ed25519_random (p) {
  const h = b4a.alloc(crypto_core_ed25519_UNIFORMBYTES)

  randombytes_buf(h)
  crypto_core_ed25519_from_uniform(p, h)
}

function crypto_core_ed25519_scalar_random (r) {
  do {
    randombytes_buf(r, crypto_core_ed25519_SCALARBYTES)
    r[crypto_core_ed25519_SCALARBYTES - 1] &= 0x1f
  } while (sc25519_is_canonical(r) == 0 ||
           sodium_is_zero(r, crypto_core_ed25519_SCALARBYTES));
}

function crypto_core_ed25519_scalar_invert (recip, s) {
  sc25519_invert(recip, s)

  if (sodium_is_zero(s, crypto_core_ed25519_SCALARBYTES)) {
    throw new Error('Zero point')
  }
}

/* 2^252+27742317777372353535851937790883648493 */
const L = b4a.from([
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7,
  0xa2, 0xde, 0xf9, 0xde, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10
])

function crypto_core_ed25519_scalar_negate (neg, s) {
  const t_ = b4a.alloc(crypto_core_ed25519_NONREDUCEDSCALARBYTES)
  const s_ = b4a.alloc(crypto_core_ed25519_NONREDUCEDSCALARBYTES)

  assert(crypto_core_ed25519_NONREDUCEDSCALARBYTES >=
          2 * crypto_core_ed25519_SCALARBYTES);

  t_.fill(0)
  s_.fill(0)

  t_.set(L.subarray(0, crypto_core_ed25519_SCALARBYTES), crypto_core_ed25519_SCALARBYTES)
  s_.set(s.subarray(0, crypto_core_ed25519_SCALARBYTES))

  sodium_sub(t_, s_, crypto_core_ed25519_NONREDUCEDSCALARBYTES)
  sc25519_reduce(t_)

  neg.set(t_.subarray(0 , crypto_core_ed25519_SCALARBYTES))
}

function crypto_core_ed25519_scalar_complement (comp, s) {
  const t_ = b4a.alloc(crypto_core_ed25519_NONREDUCEDSCALARBYTES)
  const s_ = b4a.alloc(crypto_core_ed25519_NONREDUCEDSCALARBYTES)

  assert(crypto_core_ed25519_NONREDUCEDSCALARBYTES >=
                  2 * crypto_core_ed25519_SCALARBYTES);

  t_.fill(0)
  s_.fill(0)
  t_[0]++;
  
  t_.set(L.subarray(0, crypto_core_ed25519_SCALARBYTES), crypto_core_ed25519_SCALARBYTES)
  s_.set(s.subarray(0, crypto_core_ed25519_SCALARBYTES))
  
  sodium_sub(t_, s_, crypto_core_ed25519_NONREDUCEDSCALARBYTES)
  sc25519_reduce(t_)

  comp.set(t_.subarray(0, crypto_core_ed25519_SCALARBYTES))
}

function crypto_core_ed25519_scalar_add (z, x, y) {
  const x_ = b4a.alloc(crypto_core_ed25519_NONREDUCEDSCALARBYTES)
  const y_ = b4a.alloc(crypto_core_ed25519_NONREDUCEDSCALARBYTES)

  x_.fill(0)
  y_.fill(0)

  x_.set(x.subarray(0, crypto_core_ed25519_SCALARBYTES))
  y_.set(y.subarray(0, crypto_core_ed25519_SCALARBYTES))

  sodium_add(x_, y_, crypto_core_ed25519_SCALARBYTES)
  crypto_core_ed25519_scalar_reduce(z, x_)
}

function crypto_core_ed25519_scalar_sub(z, x, y) {
  const yn = b4a.alloc(crypto_core_ed25519_SCALARBYTES)

  crypto_core_ed25519_scalar_negate(yn, y)
  crypto_core_ed25519_scalar_add(z, x, yn)
}

function crypto_core_ed25519_scalar_mul(z, x, y) {
  sc25519_mul(z, x, y)
}

function crypto_core_ed25519_scalar_reduce(r, s) {
  const t = b4a.alloc(crypto_core_ed25519_NONREDUCEDSCALARBYTES)

  t.set(s)

  sc25519_reduce(t)
  r.set(t.subarray(0, crypto_core_ed25519_SCALARBYTES))
  sodium_memzero(t)
}

function crypto_core_ed25519_scalar_is_canonical(s) {
  return sc25519_is_canonical(s)
}

const crypto_core_ed25519_BYTES = 32
const crypto_core_ed25519_UNIFORMBYTES = 32
const crypto_core_ed25519_SCALARBYTES = 32
const crypto_core_ed25519_NONREDUCEDSCALARBYTES = 64

module.exports = {
  crypto_core_ed25519_is_valid_point,
  crypto_core_ed25519_add,
  crypto_core_ed25519_sub,
  crypto_core_ed25519_from_uniform,
  crypto_core_ed25519_random,
  crypto_core_ed25519_scalar_random,
  crypto_core_ed25519_scalar_invert,
  crypto_core_ed25519_scalar_negate,
  crypto_core_ed25519_scalar_complement,
  crypto_core_ed25519_scalar_add,
  crypto_core_ed25519_scalar_sub,
  crypto_core_ed25519_scalar_mul,
  crypto_core_ed25519_scalar_reduce,
  crypto_core_ed25519_scalar_is_canonical,
  crypto_core_ed25519_BYTES,
  crypto_core_ed25519_UNIFORMBYTES,
  crypto_core_ed25519_SCALARBYTES,
  crypto_core_ed25519_NONREDUCEDSCALARBYTES
}

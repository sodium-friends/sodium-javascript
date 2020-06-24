var sodium = require('./')

var key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES)
var nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)

sodium.randombytes_buf(key)
sodium.randombytes_buf(nonce)

var message = Buffer.from('Hello, World!')
var cipher = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES)

sodium.crypto_secretbox_easy(cipher, message, nonce, key)

console.log('Encrypted:', cipher)

var plainText = Buffer.alloc(cipher.length - sodium.crypto_secretbox_MACBYTES)

sodium.crypto_secretbox_open_easy(plainText, cipher, nonce, key)

console.log('Plaintext:', plainText.toString())

if (typeof window !== 'undefined') window.close()

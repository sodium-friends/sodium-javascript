(module
  (memory $0 1)
  (export "memory" (memory $0))

  ;; (func $i32.log (import "debug" "log") (param i32))
  ;; (func $i32.log_tee (import "debug" "log_tee") (param i32) (result i32))
  ;; ;; No i64 interop with JS yet - but maybe coming with WebAssembly BigInt
  ;; ;; So we can instead fake this by splitting the i64 into two i32 limbs,
  ;; ;; however these are WASM functions using i32x2.log:
  ;; (func $i32x2.log (import "debug" "log") (param i32) (param i32))
  ;; (func $f32.log (import "debug" "log") (param f32))
  ;; (func $f32.log_tee (import "debug" "log_tee") (param f32) (result f32))
  ;; (func $f64.log (import "debug" "log") (param f64))
  ;; (func $f64.log_tee (import "debug" "log_tee") (param f64) (result f64))  
  
  ;; ;; i64 logging by splitting into two i32 limbs
  ;; (func $i64.log
  ;;   (param $0 i64)
  ;;   (call $i32x2.log
  ;;     ;; Upper limb
  ;;     (i32.wrap/i64
  ;;       (i64.shr_s (get_local $0)
  ;;         (i64.const 32)))
  ;;     ;; Lower limb
  ;;     (i32.wrap/i64 (get_local $0))))

  ;; (func $i64.log_tee
  ;;   (param $0 i64)
  ;;   (result i64)
  ;;   (call $i64.log (get_local $0))
  ;;   (return (get_local $0)))

  (func $fe_mul32
    (param $f0 i64)
    (param $f1 i64)
    (param $f2 i64)
    (param $f3 i64)
    (param $f4 i64)
    (param $f5 i64)
    (param $f6 i64)
    (param $f7 i64)
    (param $f8 i64)
    (param $f9 i64)

    (param $n i32)

    (param $h i32)

    (local $sn i64)

    (local $h0 i64)
    (local $h1 i64)
    (local $h2 i64)
    (local $h3 i64)
    (local $h4 i64)
    (local $h5 i64)
    (local $h6 i64)
    (local $h7 i64)
    (local $h8 i64)
    (local $h9 i64)
    
    (local $carry0 i64)
    (local $carry1 i64)
    (local $carry2 i64)
    (local $carry3 i64)
    (local $carry4 i64)
    (local $carry5 i64)
    (local $carry6 i64)
    (local $carry7 i64)
    (local $carry8 i64)
    (local $carry9 i64)

    (set_local $sn (i64.extend_s/i32 (get_local $n)))

    (set_local $f0 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f0))))
    (set_local $f1 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f1))))
    (set_local $f2 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f2))))
    (set_local $f3 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f3))))
    (set_local $f4 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f4))))
    (set_local $f5 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f5))))
    (set_local $f6 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f6))))
    (set_local $f7 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f7))))
    (set_local $f8 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f8))))
    (set_local $f9 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f9))))

    (set_local $h0 (i64.mul (get_local $f0) (get_local $sn)))
    (set_local $h1 (i64.mul (get_local $f1) (get_local $sn)))
    (set_local $h2 (i64.mul (get_local $f2) (get_local $sn)))
    (set_local $h3 (i64.mul (get_local $f3) (get_local $sn)))
    (set_local $h4 (i64.mul (get_local $f4) (get_local $sn)))
    (set_local $h5 (i64.mul (get_local $f5) (get_local $sn)))
    (set_local $h6 (i64.mul (get_local $f6) (get_local $sn)))
    (set_local $h7 (i64.mul (get_local $f7) (get_local $sn)))
    (set_local $h8 (i64.mul (get_local $f8) (get_local $sn)))
    (set_local $h9 (i64.mul (get_local $f9) (get_local $sn)))

    (set_local $carry9 (i64.shr_s (i64.add (get_local $h9) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h0 (i64.add (get_local $h0) (i64.mul (get_local $carry9) (i64.const 19))))
    (set_local $h9 (i64.sub (get_local $h9) (i64.mul (get_local $carry9) (i64.shl (i64.const 1) (i64.const 25)))))

    (set_local $carry1 (i64.shr_s (i64.add (get_local $h1) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h2 (i64.add (get_local $h2) (get_local $carry1)))
    (set_local $h1 (i64.sub (get_local $h1) (i64.mul (get_local $carry1) (i64.shl (i64.const 1) (i64.const 25)))))

    (set_local $carry3 (i64.shr_s (i64.add (get_local $h3) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h4 (i64.add (get_local $h4) (get_local $carry3)))
    (set_local $h3 (i64.sub (get_local $h3) (i64.mul (get_local $carry3) (i64.shl (i64.const 1) (i64.const 25)))))

    (set_local $carry5 (i64.shr_s (i64.add (get_local $h5) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h6 (i64.add (get_local $h6) (get_local $carry5)))
    (set_local $h5 (i64.sub (get_local $h5) (i64.mul (get_local $carry5) (i64.shl (i64.const 1) (i64.const 25)))))

    (set_local $carry7 (i64.shr_s (i64.add (get_local $h7) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h8 (i64.add (get_local $h8) (get_local $carry7)))
    (set_local $h7 (i64.sub (get_local $h7) (i64.mul (get_local $carry7) (i64.shl (i64.const 1) (i64.const 25)))))

    (set_local $carry0 (i64.shr_s (i64.add (get_local $h0) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h1 (i64.add (get_local $h1) (get_local $carry0)))
    (set_local $h0 (i64.sub (get_local $h0) (i64.mul (get_local $carry0) (i64.shl (i64.const 1) (i64.const 26)))))

    (set_local $carry2 (i64.shr_s (i64.add (get_local $h2) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h3 (i64.add (get_local $h3) (get_local $carry2)))
    (set_local $h2 (i64.sub (get_local $h2) (i64.mul (get_local $carry2) (i64.shl (i64.const 1) (i64.const 26)))))

    (set_local $carry4 (i64.shr_s (i64.add (get_local $h4) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h5 (i64.add (get_local $h5) (get_local $carry4)))
    (set_local $h4 (i64.sub (get_local $h4) (i64.mul (get_local $carry4) (i64.shl (i64.const 1) (i64.const 26)))))

    (set_local $carry6 (i64.shr_s (i64.add (get_local $h6) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h7 (i64.add (get_local $h7) (get_local $carry6)))
    (set_local $h6 (i64.sub (get_local $h6) (i64.mul (get_local $carry6) (i64.shl (i64.const 1) (i64.const 26)))))

    (set_local $carry8 (i64.shr_s (i64.add (get_local $h8) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h9 (i64.add (get_local $h9) (get_local $carry8)))
    (set_local $h8 (i64.sub (get_local $h8) (i64.mul (get_local $carry8) (i64.shl (i64.const 1) (i64.const 26)))))

    (i64.store32 offset=0  (get_local $h) (get_local $h0))
    (i64.store32 offset=4  (get_local $h) (get_local $h1))
    (i64.store32 offset=8  (get_local $h) (get_local $h2))
    (i64.store32 offset=12 (get_local $h) (get_local $h3))
    (i64.store32 offset=16 (get_local $h) (get_local $h4))
    (i64.store32 offset=20 (get_local $h) (get_local $h5))
    (i64.store32 offset=24 (get_local $h) (get_local $h6))
    (i64.store32 offset=28 (get_local $h) (get_local $h7))
    (i64.store32 offset=32 (get_local $h) (get_local $h8))
    (i64.store32 offset=36 (get_local $h) (get_local $h9)))

  (func $fe25519_mul32 (export "fe25519_mul32") (param $h i32) (param $f i32) (param $n i32)
    (i64.load32_u offset=0  (get_local $f))
    (i64.load32_u offset=4  (get_local $f))
    (i64.load32_u offset=8  (get_local $f))
    (i64.load32_u offset=12 (get_local $f))
    (i64.load32_u offset=16 (get_local $f))
    (i64.load32_u offset=20 (get_local $f))
    (i64.load32_u offset=24 (get_local $f))
    (i64.load32_u offset=28 (get_local $f))
    (i64.load32_u offset=32 (get_local $f))
    (i64.load32_u offset=36 (get_local $f))
    (get_local $n)
    (get_local $h)
    (call $fe_mul32)))

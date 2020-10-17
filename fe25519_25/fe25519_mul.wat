(module
  (import "js" "table" (table 1 anyfunc))
  (import "js" "mem" (memory 1))
  
  (elem (i32.const 1) $fe_mul)

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

  (func $fe_mul
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

    (param $g0 i64)
    (param $g1 i64)
    (param $g2 i64)
    (param $g3 i64)
    (param $g4 i64)
    (param $g5 i64)
    (param $g6 i64)
    (param $g7 i64)
    (param $g8 i64)
    (param $g9 i64)

    (param $h i32)

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

    (local $g1_19 i64)
    (local $g2_19 i64)
    (local $g3_19 i64)
    (local $g4_19 i64)
    (local $g5_19 i64)
    (local $g6_19 i64)
    (local $g7_19 i64)
    (local $g8_19 i64)
    (local $g9_19 i64)
    (local $f1_2  i64)
    (local $f3_2  i64)
    (local $f5_2  i64)
    (local $f7_2  i64)
    (local $f9_2  i64)

    (local $f0g0    i64)
    (local $f0g1    i64)
    (local $f0g2    i64)
    (local $f0g3    i64)
    (local $f0g4    i64)
    (local $f0g5    i64)
    (local $f0g6    i64)
    (local $f0g7    i64)
    (local $f0g8    i64)
    (local $f0g9    i64)
    (local $f1g0    i64)
    (local $f1g1_2  i64)
    (local $f1g2    i64)
    (local $f1g3_2  i64)
    (local $f1g4    i64)
    (local $f1g5_2  i64)
    (local $f1g6    i64)
    (local $f1g7_2  i64)
    (local $f1g8    i64)
    (local $f1g9_38 i64)
    (local $f2g0    i64)
    (local $f2g1    i64)
    (local $f2g2    i64)
    (local $f2g3    i64)
    (local $f2g4    i64)
    (local $f2g5    i64)
    (local $f2g6    i64)
    (local $f2g7    i64)
    (local $f2g8_19 i64)
    (local $f2g9_19 i64)
    (local $f3g0    i64)
    (local $f3g1_2  i64)
    (local $f3g2    i64)
    (local $f3g3_2  i64)
    (local $f3g4    i64)
    (local $f3g5_2  i64)
    (local $f3g6    i64)
    (local $f3g7_38 i64)
    (local $f3g8_19 i64)
    (local $f3g9_38 i64)
    (local $f4g0    i64)
    (local $f4g1    i64)
    (local $f4g2    i64)
    (local $f4g3    i64)
    (local $f4g4    i64)
    (local $f4g5    i64)
    (local $f4g6_19 i64)
    (local $f4g7_19 i64)
    (local $f4g8_19 i64)
    (local $f4g9_19 i64)
    (local $f5g0    i64)
    (local $f5g1_2  i64)
    (local $f5g2    i64)
    (local $f5g3_2  i64)
    (local $f5g4    i64)
    (local $f5g5_38 i64)
    (local $f5g6_19 i64)
    (local $f5g7_38 i64)
    (local $f5g8_19 i64)
    (local $f5g9_38 i64)
    (local $f6g0    i64)
    (local $f6g1    i64)
    (local $f6g2    i64)
    (local $f6g3    i64)
    (local $f6g4_19 i64)
    (local $f6g5_19 i64)
    (local $f6g6_19 i64)
    (local $f6g7_19 i64)
    (local $f6g8_19 i64)
    (local $f6g9_19 i64)
    (local $f7g0    i64)
    (local $f7g1_2  i64)
    (local $f7g2    i64)
    (local $f7g3_38 i64)
    (local $f7g4_19 i64)
    (local $f7g5_38 i64)
    (local $f7g6_19 i64)
    (local $f7g7_38 i64)
    (local $f7g8_19 i64)
    (local $f7g9_38 i64)
    (local $f8g0    i64)
    (local $f8g1    i64)
    (local $f8g2_19 i64)
    (local $f8g3_19 i64)
    (local $f8g4_19 i64)
    (local $f8g5_19 i64)
    (local $f8g6_19 i64)
    (local $f8g7_19 i64)
    (local $f8g8_19 i64)
    (local $f8g9_19 i64)
    (local $f9g0    i64)
    (local $f9g1_38 i64)
    (local $f9g2_19 i64)
    (local $f9g3_38 i64)
    (local $f9g4_19 i64)
    (local $f9g5_38 i64)
    (local $f9g6_19 i64)
    (local $f9g7_38 i64)
    (local $f9g8_19 i64)
    (local $f9g9_38 i64)

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

    (set_local $g0 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g0))))
    (set_local $g1 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g1))))
    (set_local $g2 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g2))))
    (set_local $g3 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g3))))
    (set_local $g4 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g4))))
    (set_local $g5 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g5))))
    (set_local $g6 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g6))))
    (set_local $g7 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g7))))
    (set_local $g8 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g8))))
    (set_local $g9 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g9))))

    (set_local $g1_19 (i64.sub (i64.mul (i64.const 19) (get_local $g1)) (i64.mul (i64.shl (i64.and (get_local $g1) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))
    (set_local $g2_19 (i64.sub (i64.mul (i64.const 19) (get_local $g2)) (i64.mul (i64.shl (i64.and (get_local $g2) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))
    (set_local $g3_19 (i64.sub (i64.mul (i64.const 19) (get_local $g3)) (i64.mul (i64.shl (i64.and (get_local $g3) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))
    (set_local $g4_19 (i64.sub (i64.mul (i64.const 19) (get_local $g4)) (i64.mul (i64.shl (i64.and (get_local $g4) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))
    (set_local $g5_19 (i64.sub (i64.mul (i64.const 19) (get_local $g5)) (i64.mul (i64.shl (i64.and (get_local $g5) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))
    (set_local $g6_19 (i64.sub (i64.mul (i64.const 19) (get_local $g6)) (i64.mul (i64.shl (i64.and (get_local $g6) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))
    (set_local $g7_19 (i64.sub (i64.mul (i64.const 19) (get_local $g7)) (i64.mul (i64.shl (i64.and (get_local $g7) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))
    (set_local $g8_19 (i64.sub (i64.mul (i64.const 19) (get_local $g8)) (i64.mul (i64.shl (i64.and (get_local $g8) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))
    (set_local $g9_19 (i64.sub (i64.mul (i64.const 19) (get_local $g9)) (i64.mul (i64.shl (i64.and (get_local $g9) (i64.const 0x80000000)) (i64.const 1)) (i64.const 19))))

    (set_local $f1_2 (i64.sub (i64.mul (i64.const 2) (get_local $f1)) (i64.mul (i64.shl (i64.and (get_local $f1) (i64.const 0x80000000)) (i64.const 1)) (i64.const 2))))
    (set_local $f3_2 (i64.sub (i64.mul (i64.const 2) (get_local $f3)) (i64.mul (i64.shl (i64.and (get_local $f3) (i64.const 0x80000000)) (i64.const 1)) (i64.const 2))))
    (set_local $f5_2 (i64.sub (i64.mul (i64.const 2) (get_local $f5)) (i64.mul (i64.shl (i64.and (get_local $f5) (i64.const 0x80000000)) (i64.const 1)) (i64.const 2))))
    (set_local $f7_2 (i64.sub (i64.mul (i64.const 2) (get_local $f7)) (i64.mul (i64.shl (i64.and (get_local $f7) (i64.const 0x80000000)) (i64.const 1)) (i64.const 2))))
    (set_local $f9_2 (i64.sub (i64.mul (i64.const 2) (get_local $f9)) (i64.mul (i64.shl (i64.and (get_local $f9) (i64.const 0x80000000)) (i64.const 1)) (i64.const 2))))

    (set_local $g1_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g1_19))))
    (set_local $g2_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g2_19))))
    (set_local $g3_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g3_19))))
    (set_local $g4_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g4_19))))
    (set_local $g5_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g5_19))))
    (set_local $g6_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g6_19))))
    (set_local $g7_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g7_19))))
    (set_local $g8_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g8_19))))
    (set_local $g9_19 (i64.extend_s/i32 (i32.wrap/i64 (get_local $g9_19))))

    (set_local $f1_2 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f1_2))))
    (set_local $f3_2 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f3_2))))
    (set_local $f5_2 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f5_2))))
    (set_local $f7_2 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f7_2))))
    (set_local $f9_2 (i64.extend_s/i32 (i32.wrap/i64 (get_local $f9_2))))

    (set_local $f0g0    (i64.mul (get_local $f0  ) (get_local $g0)))
    (set_local $f0g1    (i64.mul (get_local $f0  ) (get_local $g1)))
    (set_local $f0g2    (i64.mul (get_local $f0  ) (get_local $g2)))
    (set_local $f0g3    (i64.mul (get_local $f0  ) (get_local $g3)))
    (set_local $f0g4    (i64.mul (get_local $f0  ) (get_local $g4)))
    (set_local $f0g5    (i64.mul (get_local $f0  ) (get_local $g5)))
    (set_local $f0g6    (i64.mul (get_local $f0  ) (get_local $g6)))
    (set_local $f0g7    (i64.mul (get_local $f0  ) (get_local $g7)))
    (set_local $f0g8    (i64.mul (get_local $f0  ) (get_local $g8)))
    (set_local $f0g9    (i64.mul (get_local $f0  ) (get_local $g9)))
    (set_local $f1g0    (i64.mul (get_local $f1  ) (get_local $g0)))
    (set_local $f1g1_2  (i64.mul (get_local $f1_2) (get_local $g1)))
    (set_local $f1g2    (i64.mul (get_local $f1  ) (get_local $g2)))
    (set_local $f1g3_2  (i64.mul (get_local $f1_2) (get_local $g3)))
    (set_local $f1g4    (i64.mul (get_local $f1  ) (get_local $g4)))
    (set_local $f1g5_2  (i64.mul (get_local $f1_2) (get_local $g5)))
    (set_local $f1g6    (i64.mul (get_local $f1  ) (get_local $g6)))
    (set_local $f1g7_2  (i64.mul (get_local $f1_2) (get_local $g7)))
    (set_local $f1g8    (i64.mul (get_local $f1  ) (get_local $g8)))
    (set_local $f1g9_38 (i64.mul (get_local $f1_2) (get_local $g9_19)))
    (set_local $f2g0    (i64.mul (get_local $f2  ) (get_local $g0)))
    (set_local $f2g1    (i64.mul (get_local $f2  ) (get_local $g1)))
    (set_local $f2g2    (i64.mul (get_local $f2  ) (get_local $g2)))
    (set_local $f2g3    (i64.mul (get_local $f2  ) (get_local $g3)))
    (set_local $f2g4    (i64.mul (get_local $f2  ) (get_local $g4)))
    (set_local $f2g5    (i64.mul (get_local $f2  ) (get_local $g5)))
    (set_local $f2g6    (i64.mul (get_local $f2  ) (get_local $g6)))
    (set_local $f2g7    (i64.mul (get_local $f2  ) (get_local $g7)))
    (set_local $f2g8_19 (i64.mul (get_local $f2  ) (get_local $g8_19)))
    (set_local $f2g9_19 (i64.mul (get_local $f2  ) (get_local $g9_19)))
    (set_local $f3g0    (i64.mul (get_local $f3  ) (get_local $g0)))
    (set_local $f3g1_2  (i64.mul (get_local $f3_2) (get_local $g1)))
    (set_local $f3g2    (i64.mul (get_local $f3  ) (get_local $g2)))
    (set_local $f3g3_2  (i64.mul (get_local $f3_2) (get_local $g3)))
    (set_local $f3g4    (i64.mul (get_local $f3  ) (get_local $g4)))
    (set_local $f3g5_2  (i64.mul (get_local $f3_2) (get_local $g5)))
    (set_local $f3g6    (i64.mul (get_local $f3  ) (get_local $g6)))
    (set_local $f3g7_38 (i64.mul (get_local $f3_2) (get_local $g7_19)))
    (set_local $f3g8_19 (i64.mul (get_local $f3  ) (get_local $g8_19)))
    (set_local $f3g9_38 (i64.mul (get_local $f3_2) (get_local $g9_19)))
    (set_local $f4g0    (i64.mul (get_local $f4) (get_local $g0)))
    (set_local $f4g1    (i64.mul (get_local $f4) (get_local $g1)))
    (set_local $f4g2    (i64.mul (get_local $f4) (get_local $g2)))
    (set_local $f4g3    (i64.mul (get_local $f4) (get_local $g3)))
    (set_local $f4g4    (i64.mul (get_local $f4) (get_local $g4)))
    (set_local $f4g5    (i64.mul (get_local $f4) (get_local $g5)))
    (set_local $f4g6_19 (i64.mul (get_local $f4) (get_local $g6_19)))
    (set_local $f4g7_19 (i64.mul (get_local $f4) (get_local $g7_19)))
    (set_local $f4g8_19 (i64.mul (get_local $f4) (get_local $g8_19)))
    (set_local $f4g9_19 (i64.mul (get_local $f4) (get_local $g9_19)))
    (set_local $f5g0    (i64.mul (get_local $f5) (get_local $g0)))
    (set_local $f5g1_2  (i64.mul (get_local $f5_2) (get_local $g1)))
    (set_local $f5g2    (i64.mul (get_local $f5) (get_local $g2)))
    (set_local $f5g3_2  (i64.mul (get_local $f5_2) (get_local $g3)))
    (set_local $f5g4    (i64.mul (get_local $f5) (get_local $g4)))
    (set_local $f5g5_38 (i64.mul (get_local $f5_2) (get_local $g5_19)))
    (set_local $f5g6_19 (i64.mul (get_local $f5) (get_local $g6_19)))
    (set_local $f5g7_38 (i64.mul (get_local $f5_2) (get_local $g7_19)))
    (set_local $f5g8_19 (i64.mul (get_local $f5) (get_local $g8_19)))
    (set_local $f5g9_38 (i64.mul (get_local $f5_2) (get_local $g9_19)))
    (set_local $f6g0    (i64.mul (get_local $f6) (get_local $g0)))
    (set_local $f6g1    (i64.mul (get_local $f6) (get_local $g1)))
    (set_local $f6g2    (i64.mul (get_local $f6) (get_local $g2)))
    (set_local $f6g3    (i64.mul (get_local $f6) (get_local $g3)))
    (set_local $f6g4_19 (i64.mul (get_local $f6) (get_local $g4_19)))
    (set_local $f6g5_19 (i64.mul (get_local $f6) (get_local $g5_19)))
    (set_local $f6g6_19 (i64.mul (get_local $f6) (get_local $g6_19)))
    (set_local $f6g7_19 (i64.mul (get_local $f6) (get_local $g7_19)))
    (set_local $f6g8_19 (i64.mul (get_local $f6) (get_local $g8_19)))
    (set_local $f6g9_19 (i64.mul (get_local $f6) (get_local $g9_19)))
    (set_local $f7g0    (i64.mul (get_local $f7) (get_local $g0)))
    (set_local $f7g1_2  (i64.mul (get_local $f7_2) (get_local $g1)))
    (set_local $f7g2    (i64.mul (get_local $f7) (get_local $g2)))
    (set_local $f7g3_38 (i64.mul (get_local $f7_2) (get_local $g3_19)))
    (set_local $f7g4_19 (i64.mul (get_local $f7) (get_local $g4_19)))
    (set_local $f7g5_38 (i64.mul (get_local $f7_2) (get_local $g5_19)))
    (set_local $f7g6_19 (i64.mul (get_local $f7) (get_local $g6_19)))
    (set_local $f7g7_38 (i64.mul (get_local $f7_2) (get_local $g7_19)))
    (set_local $f7g8_19 (i64.mul (get_local $f7) (get_local $g8_19)))
    (set_local $f7g9_38 (i64.mul (get_local $f7_2) (get_local $g9_19)))
    (set_local $f8g0    (i64.mul (get_local $f8) (get_local $g0)))
    (set_local $f8g1    (i64.mul (get_local $f8) (get_local $g1)))
    (set_local $f8g2_19 (i64.mul (get_local $f8) (get_local $g2_19)))
    (set_local $f8g3_19 (i64.mul (get_local $f8) (get_local $g3_19)))
    (set_local $f8g4_19 (i64.mul (get_local $f8) (get_local $g4_19)))
    (set_local $f8g5_19 (i64.mul (get_local $f8) (get_local $g5_19)))
    (set_local $f8g6_19 (i64.mul (get_local $f8) (get_local $g6_19)))
    (set_local $f8g7_19 (i64.mul (get_local $f8) (get_local $g7_19)))
    (set_local $f8g8_19 (i64.mul (get_local $f8) (get_local $g8_19)))
    (set_local $f8g9_19 (i64.mul (get_local $f8) (get_local $g9_19)))
    (set_local $f9g0    (i64.mul (get_local $f9) (get_local $g0)))
    (set_local $f9g1_38 (i64.mul (get_local $f9_2) (get_local $g1_19)))
    (set_local $f9g2_19 (i64.mul (get_local $f9) (get_local $g2_19)))
    (set_local $f9g3_38 (i64.mul (get_local $f9_2) (get_local $g3_19)))
    (set_local $f9g4_19 (i64.mul (get_local $f9) (get_local $g4_19)))
    (set_local $f9g5_38 (i64.mul (get_local $f9_2) (get_local $g5_19)))
    (set_local $f9g6_19 (i64.mul (get_local $f9) (get_local $g6_19)))
    (set_local $f9g7_38 (i64.mul (get_local $f9_2) (get_local $g7_19)))
    (set_local $f9g8_19 (i64.mul (get_local $f9) (get_local $g8_19)))
    (set_local $f9g9_38 (i64.mul (get_local $f9_2) (get_local $g9_19)))

    (set_local $h0 (i64.add (get_local $f0g0) (i64.add (get_local $f1g9_38) (i64.add (get_local $f2g8_19) (i64.add (get_local $f3g7_38) (i64.add (get_local $f4g6_19) (i64.add (get_local $f5g5_38) (i64.add (get_local $f6g4_19) (i64.add (get_local $f7g3_38) (i64.add (get_local $f8g2_19) (get_local $f9g1_38)))))))))))
    (set_local $h1 (i64.add (get_local $f0g1) (i64.add (get_local $f1g0) (i64.add (get_local $f2g9_19) (i64.add (get_local $f3g8_19) (i64.add (get_local $f4g7_19) (i64.add (get_local $f5g6_19) (i64.add (get_local $f6g5_19) (i64.add (get_local $f7g4_19) (i64.add (get_local $f8g3_19) (get_local $f9g2_19)))))))))))
    (set_local $h2 (i64.add (get_local $f0g2) (i64.add (get_local $f1g1_2) (i64.add (get_local $f2g0) (i64.add (get_local $f3g9_38) (i64.add (get_local $f4g8_19) (i64.add (get_local $f5g7_38) (i64.add (get_local $f6g6_19) (i64.add (get_local $f7g5_38) (i64.add (get_local $f8g4_19) (get_local $f9g3_38)))))))))))
    (set_local $h3 (i64.add (get_local $f0g3) (i64.add (get_local $f1g2) (i64.add (get_local $f2g1) (i64.add (get_local $f3g0) (i64.add (get_local $f4g9_19) (i64.add (get_local $f5g8_19) (i64.add (get_local $f6g7_19) (i64.add (get_local $f7g6_19) (i64.add (get_local $f8g5_19) (get_local $f9g4_19)))))))))))
    (set_local $h4 (i64.add (get_local $f0g4) (i64.add (get_local $f1g3_2) (i64.add (get_local $f2g2) (i64.add (get_local $f3g1_2) (i64.add (get_local $f4g0) (i64.add (get_local $f5g9_38) (i64.add (get_local $f6g8_19) (i64.add (get_local $f7g7_38) (i64.add (get_local $f8g6_19) (get_local $f9g5_38)))))))))))
    (set_local $h5 (i64.add (get_local $f0g5) (i64.add (get_local $f1g4) (i64.add (get_local $f2g3) (i64.add (get_local $f3g2) (i64.add (get_local $f4g1) (i64.add (get_local $f5g0) (i64.add (get_local $f6g9_19) (i64.add (get_local $f7g8_19) (i64.add (get_local $f8g7_19) (get_local $f9g6_19)))))))))))
    (set_local $h6 (i64.add (get_local $f0g6) (i64.add (get_local $f1g5_2) (i64.add (get_local $f2g4) (i64.add (get_local $f3g3_2) (i64.add (get_local $f4g2) (i64.add (get_local $f5g1_2) (i64.add (get_local $f6g0) (i64.add (get_local $f7g9_38) (i64.add (get_local $f8g8_19) (get_local $f9g7_38)))))))))))
    (set_local $h7 (i64.add (get_local $f0g7) (i64.add (get_local $f1g6) (i64.add (get_local $f2g5) (i64.add (get_local $f3g4) (i64.add (get_local $f4g3) (i64.add (get_local $f5g2) (i64.add (get_local $f6g1) (i64.add (get_local $f7g0) (i64.add (get_local $f8g9_19) (get_local $f9g8_19)))))))))))
    (set_local $h8 (i64.add (get_local $f0g8) (i64.add (get_local $f1g7_2) (i64.add (get_local $f2g6) (i64.add (get_local $f3g5_2) (i64.add (get_local $f4g4) (i64.add (get_local $f5g3_2) (i64.add (get_local $f6g2) (i64.add (get_local $f7g1_2) (i64.add (get_local $f8g0) (get_local $f9g9_38)))))))))))
    (set_local $h9 (i64.add (get_local $f0g9) (i64.add (get_local $f1g8) (i64.add (get_local $f2g7) (i64.add (get_local $f3g6) (i64.add (get_local $f4g5) (i64.add (get_local $f5g4) (i64.add (get_local $f6g3) (i64.add (get_local $f7g2) (i64.add (get_local $f8g1) (get_local $f9g0)))))))))))

    (set_local $carry0 (i64.shr_s (i64.add (get_local $h0) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h1 (i64.add (get_local $h1) (get_local $carry0)))
    (set_local $h0 (i64.sub (get_local $h0) (i64.mul (get_local $carry0) (i64.shl (i64.const 1) (i64.const 26)))))
    (set_local $carry4 (i64.shr_s (i64.add (get_local $h4) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h5 (i64.add (get_local $h5) (get_local $carry4)))
    (set_local $h4 (i64.sub (get_local $h4) (i64.mul (get_local $carry4) (i64.shl (i64.const 1) (i64.const 26)))))

    (set_local $carry1 (i64.shr_s (i64.add (get_local $h1) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h2 (i64.add (get_local $h2) (get_local $carry1)))
    (set_local $h1 (i64.sub (get_local $h1) (i64.mul (get_local $carry1) (i64.shl (i64.const 1) (i64.const 25)))))
    (set_local $carry5 (i64.shr_s (i64.add (get_local $h5) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h6 (i64.add (get_local $h6) (get_local $carry5)))
    (set_local $h5 (i64.sub (get_local $h5) (i64.mul (get_local $carry5) (i64.shl (i64.const 1) (i64.const 25)))))

    (set_local $carry2 (i64.shr_s (i64.add (get_local $h2) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h3 (i64.add (get_local $h3) (get_local $carry2)))
    (set_local $h2 (i64.sub (get_local $h2) (i64.mul (get_local $carry2) (i64.shl (i64.const 1) (i64.const 26)))))
    (set_local $carry6 (i64.shr_s (i64.add (get_local $h6) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h7 (i64.add (get_local $h7) (get_local $carry6)))
    (set_local $h6 (i64.sub (get_local $h6) (i64.mul (get_local $carry6) (i64.shl (i64.const 1) (i64.const 26)))))

    (set_local $carry3 (i64.shr_s (i64.add (get_local $h3) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h4 (i64.add (get_local $h4) (get_local $carry3)))
    (set_local $h3 (i64.sub (get_local $h3) (i64.mul (get_local $carry3) (i64.shl (i64.const 1) (i64.const 25)))))
    (set_local $carry7 (i64.shr_s (i64.add (get_local $h7) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h8 (i64.add (get_local $h8) (get_local $carry7)))
    (set_local $h7 (i64.sub (get_local $h7) (i64.mul (get_local $carry7) (i64.shl (i64.const 1) (i64.const 25)))))

    (set_local $carry4 (i64.shr_s (i64.add (get_local $h4) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h5 (i64.add (get_local $h5) (get_local $carry4)))
    (set_local $h4 (i64.sub (get_local $h4) (i64.mul (get_local $carry4) (i64.shl (i64.const 1) (i64.const 26)))))
    (set_local $carry8 (i64.shr_s (i64.add (get_local $h8) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h9 (i64.add (get_local $h9) (get_local $carry8)))
    (set_local $h8 (i64.sub (get_local $h8) (i64.mul (get_local $carry8) (i64.shl (i64.const 1) (i64.const 26)))))

    (set_local $carry9 (i64.shr_s (i64.add (get_local $h9) (i64.shl (i64.const 1) (i64.const 24))) (i64.const 25)))
    (set_local $h0 (i64.add (get_local $h0) (i64.mul (get_local $carry9) (i64.const 19))))
    (set_local $h9 (i64.sub (get_local $h9) (i64.mul (get_local $carry9) (i64.shl (i64.const 1) (i64.const 25)))))

    (set_local $carry0 (i64.shr_s (i64.add (get_local $h0) (i64.shl (i64.const 1) (i64.const 25))) (i64.const 26)))
    (set_local $h1 (i64.add (get_local $h1) (get_local $carry0)))
    (set_local $h0 (i64.sub (get_local $h0) (i64.mul (get_local $carry0) (i64.shl (i64.const 1) (i64.const 26)))))

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

  (func $fe25519_mul (export "fe25519_mul") (param $h i32) (param $f i32) (param $g i32)
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
    (i64.load32_u offset=0  (get_local $g))
    (i64.load32_u offset=4  (get_local $g))
    (i64.load32_u offset=8  (get_local $g))
    (i64.load32_u offset=12 (get_local $g))
    (i64.load32_u offset=16 (get_local $g))
    (i64.load32_u offset=20 (get_local $g))
    (i64.load32_u offset=24 (get_local $g))
    (i64.load32_u offset=28 (get_local $g))
    (i64.load32_u offset=32 (get_local $g))
    (i64.load32_u offset=36 (get_local $g))
    (get_local $h)
    (call $fe_mul)))

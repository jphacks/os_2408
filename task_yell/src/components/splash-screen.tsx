'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export function SplashScreenComponent({ onFinished }: { onFinished: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onFinished, 500) // アニメーション終了後にメインアプリに遷移
    }, 2000) // 2秒後にアニメーション開始

    return () => clearTimeout(timer)
  }, [onFinished])

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-white z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Image
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYzb-4FeuqT1z-pxQCYGnmbunWM33GjZar06qSWQf_g-GLfeAE_k6H9qZeo6_kffE-bP9geMs65W3lxxCxgOJhpZtA4dBvXrsJBS9Mr0Da119OVQ9BYgUF3mxtLnrE77UH94ApOrkB7D76/s800/character_sports_baseball.png"
          alt="野球キャラクター"
          width={300}
          height={300}
          className="w-64 h-64 object-contain"
        />
      </motion.div>
    </motion.div>
  )
}
// components/Logo.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function Logo({ size = 44 }: { size?: number }) {
  // Default: coba logo.png dulu
  const [src, setSrc] = useState('/logo.png')

  return (
    <Image
      src={src}
      alt="Logo SMA Unggulan BPPT Al Fattah"
      width={size}
      height={size}
      priority
      style={{ display: 'block' }}
      onError={() => setSrc('/logo.svg')}
    />
  )
}
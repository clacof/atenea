import Image from 'next/image'

interface LogoProps {
  variant?: 'full' | 'emblem'
  size?: number
  className?: string
  priority?: boolean
}

// Logo vectorizado (public/brand). Fondo transparente, pensado para superficies oscuras.
const sources = {
  full: { src: '/brand/atenea-logo.svg', ratio: 992 / 976, alt: 'Atenea Night Club' },
  emblem: { src: '/brand/atenea-emblem.svg', ratio: 1, alt: 'Atenea' },
}

export default function Logo({ variant = 'full', size = 160, className = '', priority = false }: LogoProps) {
  const { src, ratio, alt } = sources[variant]
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={Math.round(size * ratio)}
      priority={priority}
      unoptimized
      className={className}
    />
  )
}

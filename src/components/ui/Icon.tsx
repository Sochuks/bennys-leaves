// src/components/ui/Icon.tsx

import type { ComponentProps } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'

type AppIconProps = ComponentProps<typeof HugeiconsIcon>

export function Icon({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.5,
  ...props
}: AppIconProps) {
  return (
    <HugeiconsIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  )
}
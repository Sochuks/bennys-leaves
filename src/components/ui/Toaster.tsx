'use client'

import { Toaster as Sonner } from 'sonner'
import { Icon } from '@/components/ui/Icon'

import {
  AlertCircleIcon,
  CircleCheckIcon,
  InformationCircleIcon,
  TriangleAlertIcon,
} from '@hugeicons/core-free-icons'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      duration={4500}
      gap={10}
      visibleToasts={3}
      icons={{
        success: (
          <Icon
            icon={CircleCheckIcon}
            size={20}
            strokeWidth={1.8}
            className="text-ochre"
          />
        ),

        error: (
          <Icon
            icon={AlertCircleIcon}
            size={20}
            strokeWidth={1.8}
            className="text-terracotta"
          />
        ),

        info: (
          <Icon
            icon={InformationCircleIcon}
            size={20}
            strokeWidth={1.8}
            className="text-parchment"
          />
        ),

        warning: (
          <Icon
            icon={TriangleAlertIcon}
            size={20}
            strokeWidth={1.8}
            className="text-ochre"
          />
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-md bg-espresso p-4 font-sans text-parchment shadow-raised',

          icon: 'mt-0.5 shrink-0',

          content: 'flex flex-col gap-0.5',

          title:
            'text-body-base font-semibold leading-snug',

          description:
            'text-caption leading-snug text-parchment/70',
        },
      }}
    />
  )
}
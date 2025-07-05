const badgeVariants = cva(
  'inline-block text-xs font-sans px-2 py-1 rounded-full border border-white text-white bg-transparent',
  {
    variants: {
      variant: {
        default: '',
        // you can define other variants like ghost, info, etc. later
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
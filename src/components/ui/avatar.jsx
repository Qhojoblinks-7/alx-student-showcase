import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Avatar container
const Avatar = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
))
Avatar.displayName = 'Avatar'

// Avatar image with src check
const AvatarImage = forwardRef(({ src, className, ...props }, ref) => {
  if (!src) return null // Prevent rendering if src is empty or undefined

  return (
    <img
      ref={ref}
      src={src}
      className={cn('aspect-square h-full w-full', className)}
      {...props}
    />
  )
})
AvatarImage.displayName = 'AvatarImage'

// Fallback placeholder
const AvatarFallback = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'

// Prop types for validation
Avatar.propTypes = {
  className: PropTypes.string
}

AvatarImage.propTypes = {
  src: PropTypes.string, // Add src validation
  className: PropTypes.string
}

AvatarFallback.propTypes = {
  className: PropTypes.string
}

export { Avatar, AvatarImage, AvatarFallback }
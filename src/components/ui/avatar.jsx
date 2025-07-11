import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils'

const Avatar = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = forwardRef(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

Avatar.propTypes = {
  className: PropTypes.string
};

AvatarImage.propTypes = {
  className: PropTypes.string
};

AvatarFallback.propTypes = {
  className: PropTypes.string
};

export { Avatar, AvatarImage, AvatarFallback };
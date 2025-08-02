// src/components/ui/button.jsx
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils.js';
import { buttonVariants } from './button-variants.js';

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button'; // Changed to 'span' or 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon']),
  asChild: PropTypes.bool
};

export { Button };
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils.js';

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
));
Label.displayName = 'Label';

Label.propTypes = {
  className: PropTypes.string
};

export { Label };
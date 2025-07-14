import { forwardRef, createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils'; // Assuming cn utility is here or accessible

// Create a Context for the Tabs component to share state (value and onValueChange)
const TabsContext = createContext(null);

/**
 * Tabs component - The main container for a set of tabbed content.
 * It manages the active tab's value and provides a function to change it via context.
 * @param {object} props - Component props.
 * @param {string} props.className - Additional CSS classes.
 * @param {string} props.value - The currently active tab's value.
 * @param {function} props.onValueChange - Callback function when the active tab changes.
 * @param {React.ReactNode} props.children - Child components (TabsList and TabsContent).
 * @param {React.Ref} ref - Ref to the underlying div element.
 */
const Tabs = forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  useEffect(() => {
    // Removed 'className' and 'props' from dependencies to prevent excessive logging
    console.log('Tabs rendered:', { value });
  }, [value]); // Log only when 'value' changes

  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {children} {/* Render children inside the div */}
      </div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = 'Tabs';

/**
 * TabsList component - A container for TabsTrigger components.
 * @param {object} props - Component props.
 * @param {string} props.className - Additional CSS classes.
 * @param {React.ReactNode} props.children - Child components (TabsTrigger).
 * @param {React.Ref} ref - Ref to the underlying div element.
 */
const TabsList = forwardRef(({ className, children, ...props }, ref) => {
  useEffect(() => {
    // Removed 'className' and 'props' from dependencies to prevent excessive logging
    console.log('TabsList rendered');
  }, []); // Log only on initial render

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      role="tablist" // Added for accessibility
      {...props}
    >
      {children}
    </div>
  );
});
TabsList.displayName = 'TabsList';

/**
 * TabsTrigger component - An individual clickable tab button.
 * It uses the TabsContext to determine its active state and trigger value changes.
 * @param {object} props - Component props.
 * @param {string} props.className - Additional CSS classes.
 * @param {string} props.value - The unique value associated with this tab.
 * @param {React.ReactNode} props.children - Content of the tab button.
 * @param {React.Ref} ref - Ref to the underlying button element.
 */
const TabsTrigger = forwardRef(({ className, value, children, ...props }, ref) => {
  const context = useContext(TabsContext);
  // Determine if this trigger's value matches the active value from context
  const isActive = context.value === value;

  useEffect(() => {
    // Removed 'className' and 'props' from dependencies to prevent excessive logging
    console.log('TabsTrigger rendered:', { value, isActive });
  }, [value, isActive]); // Log only when 'value' or 'isActive' changes

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-background text-foreground shadow-sm' : 'data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground', // Dynamically apply active/inactive styles
        className
      )}
      data-state={isActive ? 'active' : 'inactive'} // Set data-state attribute for styling
      onClick={() => context.onValueChange?.(value)} // Call onValueChange from context when clicked
      role="tab" // Added for accessibility
      aria-selected={isActive} // Added for accessibility
      {...props}
    >
      {children} {/* Render children inside the button */}
    </button>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

/**
 * TabsContent component - The content panel associated with a specific tab.
 * It only renders its children if its value matches the active tab's value from context.
 * @param {object} props - Component props.
 * @param {string} props.className - Additional CSS classes.
 * @param {string} props.value - The unique value associated with this content panel.
 * @param {React.ReactNode} props.children - Content to be displayed.
 * @param {React.Ref} ref - Ref to the underlying div element.
 */
const TabsContent = forwardRef(({ className, value, children, ...props }, ref) => {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  useEffect(() => {
    // Removed 'className' and 'props' from dependencies to prevent excessive logging
    console.log('TabsContent rendered:', { value, isActive });
  }, [value, isActive]); // Log only when 'value' or 'isActive' changes

  if (!isActive) return null; // Only render content if it's the active tab

  return (
    <div
      ref={ref}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      role="tabpanel" // Added for accessibility
      {...props}
    >
      {children} {/* Render children inside the div */}
    </div>
  );
});
TabsContent.displayName = 'TabsContent';

// PropTypes for the refactored Tabs components
Tabs.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired, // Ensure children are passed
};

TabsList.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

TabsTrigger.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired, // Value is now required for trigger
  children: PropTypes.node.isRequired,
};

TabsContent.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired, // Value is now required for content
  children: PropTypes.node.isRequired,
};

export { Tabs, TabsList, TabsTrigger, TabsContent };

import {Button as ShadcnButton} from '@shadcn/button/button';
import {Button, ButtonProps} from '@ui/buttons/button';
import {ButtonBaseProps} from '@ui/buttons/button-base';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {PlusIcon} from 'lucide-react';
import React, {ReactElement, ReactNode} from 'react';
import {Link, To} from 'react-router';

export interface DataTableAddItemButtonProps {
  children: ReactNode;
  to?: To;
  href?: string;
  download?: boolean | string;
  elementType?: ButtonBaseProps['elementType'];
  onClick?: ButtonBaseProps['onClick'];
  icon?: ReactElement;
  disabled?: boolean;
  className?: string;
  alwaysDesktop?: boolean;
  size?: ButtonProps['size'];
}
export const DataTableAddItemButton = React.forwardRef<
  HTMLButtonElement,
  DataTableAddItemButtonProps
>(
  (
    {
      children,
      to,
      elementType,
      onClick,
      href,
      download,
      icon,
      disabled,
      className,
      alwaysDesktop,
      size = 'sm',
    },
    ref,
  ) => {
    const isMobile = useIsMobileMediaQuery();
    const resolvedIcon = icon || <PlusIcon />;

    if (isMobile && !alwaysDesktop) {
      const iconSize = size === 'xs' ? 'icon-sm' : 'icon';
      if (to) {
        return (
          <ShadcnButton
            variant="default"
            color="primary"
            size={iconSize}
            nativeButton={false}
            render={<Link to={to} />}
            disabled={disabled}
            className={className}
          >
            {resolvedIcon}
          </ShadcnButton>
        );
      }
      if (href) {
        return (
          <ShadcnButton
            variant="default"
            color="primary"
            size={iconSize}
            nativeButton={false}
            render={<a href={href} download={download} />}
            onClick={onClick}
            disabled={disabled}
            className={className}
          >
            {resolvedIcon}
          </ShadcnButton>
        );
      }
      return (
        <ShadcnButton
          ref={ref}
          variant="default"
          color="primary"
          size={iconSize}
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={className}
        >
          {resolvedIcon}
        </ShadcnButton>
      );
    }

    return (
      <Button
        ref={ref}
        startIcon={resolvedIcon}
        variant="flat"
        color="primary"
        size={size}
        to={to}
        href={href}
        download={download}
        elementType={elementType}
        onClick={onClick}
        disabled={disabled}
        display="flex"
        className={className}
      >
        {children}
      </Button>
    );
  },
);

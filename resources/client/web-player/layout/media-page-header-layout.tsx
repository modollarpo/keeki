import clsx from 'clsx';
import {cloneElement, ReactElement, ReactNode} from 'react';

interface MediaPageHeaderLayoutProps {
  className?: string;
  image: ReactElement<{size: string; className?: string}>;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  actionsBar?: ReactNode;
  centerItems?: boolean;
  footer?: ReactNode;
}
export function MediaPageHeaderLayout({
  className,
  image,
  title,
  subtitle,
  description,
  actionsBar,
  footer,
  centerItems = true,
}: MediaPageHeaderLayoutProps) {
  return (
    <div>
      <header
        className={clsx(
          'flex flex-col gap-6 md:flex-row md:gap-8.5',
          centerItems && 'md:items-center',
          className,
        )}
      >
        {cloneElement(image, {
          size: image.props.size || 'size-48 md:size-64',
          className: clsx(
            image.props.className,
            'mx-auto shrink-0 dark:shadow-lg',
          ),
        })}
        <div className="min-w-0 flex-auto pb-2">
          <h1 className="mb-2.5 text-center text-2xl font-bold md:text-start md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <div className="mx-auto w-max max-w-full md:mx-0">{subtitle}</div>
          )}
          {description ? (
            <div className="text-muted-foreground mx-auto mt-4.5 w-max max-w-full text-center text-sm md:mx-0 md:mt-6.5 md:text-start">
              {description}
            </div>
          ) : null}

          {footer ? <div className="mx-auto mt-6">{footer}</div> : null}
        </div>
      </header>
      {actionsBar ? <div className="my-12">{actionsBar}</div> : null}
    </div>
  );
}

interface ActionButtonClassNameProps {
  isFirst?: boolean;
}
export function actionButtonClassName({
  isFirst,
}: ActionButtonClassNameProps = {}) {
  return clsx('min-h-10.5', isFirst ? 'min-w-32 mr-5' : 'mr-2.5 min-w-25');
}

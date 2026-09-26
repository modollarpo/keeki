import clsx from 'clsx';
import {forwardRef, MouseEventHandler, ReactNode, useContext} from 'react';
import {TreeContext} from './tree-context';

interface TreeLabelProps {
  level?: number;
  node: any;
  icon?: ReactNode;
  label?: ReactNode;
  className?: string;
}
export const TreeLabel = forwardRef<HTMLDivElement, TreeLabelProps>(
  ({icon, label, level = 0, node, className, ...domProps}, ref) => {
    const {expandedKeys, setExpandedKeys, selectedKeys, setSelectedKeys} =
      useContext(TreeContext);
    const isExpanded = expandedKeys.includes(node.id);
    const isSelected = selectedKeys.includes(node.id);

    const handleExpandIconClick: MouseEventHandler = e => {
      e.stopPropagation();
      const index = expandedKeys.indexOf(node.id);
      const newExpandedKeys = [...expandedKeys];
      if (index > -1) {
        newExpandedKeys.splice(index, 1);
      } else {
        newExpandedKeys.push(node.id);
      }
      setExpandedKeys(newExpandedKeys);
    };

    return (
      <div
        {...domProps}
        ref={ref}
        onClick={e => {
          e.stopPropagation();
          setSelectedKeys([node.id]);
        }}
        className={clsx(
          "header tree-label flex cursor-pointer flex-nowrap items-center overflow-hidden rounded-button py-1.5 text-ellipsis whitespace-nowrap [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
          isSelected && 'text-sidebar-accent-foreground bg-sidebar-accent',
          !isSelected && 'hover:bg-sidebar-accent',
        )}
      >
        {level > 0 && (
          <div className="flex">
            {Array.from({length: level}).map((_, i) => {
              return <div key={i} className="size-3" />;
            })}
          </div>
        )}
        <div onClick={handleExpandIconClick}>
          <svg
            className={clsx(
              'color-current size-3 cursor-default transition-transform',
              isExpanded && 'rotate-90',
            )}
            viewBox="0 0 20 20"
            focusable="false"
          >
            <polygon points="8,5 13,10 8,15" />
          </svg>
        </div>
        {icon}
        <div className="overflow-hidden px-2 text-ellipsis">{label}</div>
      </div>
    );
  },
);
TreeLabel.displayName = 'TreeLabel';

import {Input as InputPrimitive} from '@base-ui/react/input';
import {HookForm} from '@shadcn/forms/form/hook-form';

import {cn} from '@ui/utils/cn';
import {Ref, use} from 'react';
import {mergeRefs} from 'react-merge-refs';

type TextareaProps = Omit<InputPrimitive.Props, 'ref'> & {
  rows?: number;
  bindToHookForm?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
};

function Textarea({
  className,
  rows,
  bindToHookForm = true,
  onChange,
  onBlur,
  value,
  disabled,
  ref,
  ...props
}: TextareaProps) {
  const hookFieldCtx = bindToHookForm ? use(HookForm.FieldContext) : null;
  const mergedOnChange: InputPrimitive.Props['onChange'] = e => {
    onChange?.(e);
    hookFieldCtx?.onChange(e);
  };
  const mergedOnBlur: InputPrimitive.Props['onBlur'] = e => {
    onBlur?.(e);
    hookFieldCtx?.onBlur();
  };
  // if is bound to hook form, make sure it's always controlled by defaulting to empty string
  const mergedValue = hookFieldCtx ? (hookFieldCtx.value ?? '') : value;
  const mergedDisabled = disabled ?? hookFieldCtx?.disabled;
  const mergedRef = hookFieldCtx ? mergeRefs([hookFieldCtx.ref, ref]) : ref;
  return (
    <InputPrimitive
      render={<textarea rows={rows} />}
      data-slot="textarea"
      className={cn(
        'rounded-input border-input placeholder:text-muted-foreground hover:border-foreground/20 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:outline-destructive dark:bg-input/30 dark:disabled:bg-input/80 flex field-sizing-content min-h-16 w-full resize-none border bg-transparent px-3 py-3 text-base transition-[color,box-shadow,background-color] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      onChange={mergedOnChange}
      onBlur={mergedOnBlur}
      value={mergedValue}
      disabled={mergedDisabled}
      ref={mergedRef}
      {...props}
    />
  );
}

export {Textarea};

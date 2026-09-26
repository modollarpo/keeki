import {ContextMenu} from '@shadcn/context-menu/context-menu';
import preview from '@storybook/preview';
import {
  ClipboardPasteIcon,
  CopyIcon,
  ScissorsIcon,
  TrashIcon,
} from 'lucide-react';
import {useState} from 'react';

const meta = preview.meta({
  title: 'Context Menu',
  component: ContextMenu,
  tags: ['autodocs'],
});

export const ContextMenuDemo = meta.story(() => {
  return (
    <ContextMenu>
      <ContextMenu.Trigger className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm">
        <span className="hidden pointer-fine:inline-block">
          Right click here
        </span>
        <span className="hidden pointer-coarse:inline-block">
          Long press here
        </span>
      </ContextMenu.Trigger>
      <ContextMenu.Content className="w-48">
        <ContextMenu.Group>
          <ContextMenu.Item>
            Back
            <ContextMenu.Shortcut>⌘[</ContextMenu.Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Item disabled>
            Forward
            <ContextMenu.Shortcut>⌘]</ContextMenu.Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Item>
            Reload
            <ContextMenu.Shortcut>⌘R</ContextMenu.Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>More Tools</ContextMenu.SubTrigger>
            <ContextMenu.SubContent className="w-44">
              <ContextMenu.Group>
                <ContextMenu.Item>Save Page...</ContextMenu.Item>
                <ContextMenu.Item>Create Shortcut...</ContextMenu.Item>
                <ContextMenu.Item>Name Window...</ContextMenu.Item>
              </ContextMenu.Group>
              <ContextMenu.Separator />
              <ContextMenu.Group>
                <ContextMenu.Item>Developer Tools</ContextMenu.Item>
              </ContextMenu.Group>
              <ContextMenu.Separator />
              <ContextMenu.Group>
                <ContextMenu.Item variant="destructive">Delete</ContextMenu.Item>
              </ContextMenu.Group>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Group>
        <ContextMenu.Separator />
        <ContextMenu.Group>
          <ContextMenu.CheckboxItem checked>
            Show Bookmarks
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem>Show Full URLs</ContextMenu.CheckboxItem>
        </ContextMenu.Group>
        <ContextMenu.Separator />
        <ContextMenu.Group>
          <ContextMenu.RadioGroup value="pedro">
            <ContextMenu.Label>People</ContextMenu.Label>
            <ContextMenu.RadioItem value="pedro">
              Pedro Duarte
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="colm">Colm Tuite</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu>
  );
});

export const ContextMenuIcons = meta.story(() => {
  return (
    <ContextMenu>
      <ContextMenu.Trigger className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm">
        <span className="hidden pointer-fine:inline-block">
          Right click here
        </span>
        <span className="hidden pointer-coarse:inline-block">
          Long press here
        </span>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.Item>
            <CopyIcon />
            Copy
          </ContextMenu.Item>
          <ContextMenu.Item>
            <ScissorsIcon />
            Cut
          </ContextMenu.Item>
          <ContextMenu.Item>
            <ClipboardPasteIcon />
            Paste
          </ContextMenu.Item>
        </ContextMenu.Group>
        <ContextMenu.Separator />
        <ContextMenu.Group>
          <ContextMenu.Item variant="destructive">
            <TrashIcon />
            Delete
          </ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu>
  );
});

export const ContextMenuCheckboxes = meta.story(() => {
  return (
    <ContextMenu>
      <ContextMenu.Trigger className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm">
        <span className="hidden pointer-fine:inline-block">
          Right click here
        </span>
        <span className="hidden pointer-coarse:inline-block">
          Long press here
        </span>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.CheckboxItem defaultChecked>
            Show Bookmarks Bar
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem>Show Full URLs</ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem defaultChecked>
            Show Developer Tools
          </ContextMenu.CheckboxItem>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu>
  );
});

export const ContextMenuRadio = meta.story(() => {
  const [user, setUser] = useState('pedro');
  const [theme, setTheme] = useState('light');
  return (
    <ContextMenu>
      <ContextMenu.Trigger className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm">
        <span className="hidden pointer-fine:inline-block">
          Right click here
        </span>
        <span className="hidden pointer-coarse:inline-block">
          Long press here
        </span>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.Label>People</ContextMenu.Label>
          <ContextMenu.RadioGroup value={user} onValueChange={setUser}>
            <ContextMenu.RadioItem value="pedro">
              Pedro Duarte
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="colm">Colm Tuite</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
        </ContextMenu.Group>
        <ContextMenu.Separator />
        <ContextMenu.Group>
          <ContextMenu.Label>Theme</ContextMenu.Label>
          <ContextMenu.RadioGroup value={theme} onValueChange={setTheme}>
            <ContextMenu.RadioItem value="light">Light</ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="dark">Dark</ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="system">System</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu>
  );
});

export const ContextMenuSides = meta.story(() => {
  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-4">
      <ContextMenu>
        <ContextMenu.Trigger className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm">
          <span className="hidden pointer-fine:inline-block">
            Right click (top)
          </span>
          <span className="hidden pointer-coarse:inline-block">
            Long press (top)
          </span>
        </ContextMenu.Trigger>
        <ContextMenu.Content side="top">
          <ContextMenu.Group>
            <ContextMenu.Item>Back</ContextMenu.Item>
            <ContextMenu.Item>Forward</ContextMenu.Item>
            <ContextMenu.Item>Reload</ContextMenu.Item>
          </ContextMenu.Group>
        </ContextMenu.Content>
      </ContextMenu>
      <ContextMenu>
        <ContextMenu.Trigger className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm">
          <span className="hidden pointer-fine:inline-block">
            Right click (right)
          </span>
          <span className="hidden pointer-coarse:inline-block">
            Long press (right)
          </span>
        </ContextMenu.Trigger>
        <ContextMenu.Content side="right">
          <ContextMenu.Group>
            <ContextMenu.Item>Back</ContextMenu.Item>
            <ContextMenu.Item>Forward</ContextMenu.Item>
            <ContextMenu.Item>Reload</ContextMenu.Item>
          </ContextMenu.Group>
        </ContextMenu.Content>
      </ContextMenu>
      <ContextMenu>
        <ContextMenu.Trigger className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm">
          <span className="hidden pointer-fine:inline-block">
            Right click (bottom)
          </span>
          <span className="hidden pointer-coarse:inline-block">
            Long press (bottom)
          </span>
        </ContextMenu.Trigger>
        <ContextMenu.Content side="bottom">
          <ContextMenu.Group>
            <ContextMenu.Item>Back</ContextMenu.Item>
            <ContextMenu.Item>Forward</ContextMenu.Item>
            <ContextMenu.Item>Reload</ContextMenu.Item>
          </ContextMenu.Group>
        </ContextMenu.Content>
      </ContextMenu>
      <ContextMenu>
        <ContextMenu.Trigger className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm">
          <span className="hidden pointer-fine:inline-block">
            Right click (left)
          </span>
          <span className="hidden pointer-coarse:inline-block">
            Long press (left)
          </span>
        </ContextMenu.Trigger>
        <ContextMenu.Content side="left">
          <ContextMenu.Group>
            <ContextMenu.Item>Back</ContextMenu.Item>
            <ContextMenu.Item>Forward</ContextMenu.Item>
            <ContextMenu.Item>Reload</ContextMenu.Item>
          </ContextMenu.Group>
        </ContextMenu.Content>
      </ContextMenu>
    </div>
  );
});

'use client';

import { cn } from '@africatourismgate/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useId } from 'react';

const editorContentClass = cn(
  'min-h-[140px] px-4 py-3 text-sm leading-relaxed text-atg-fg',
  '[&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2:first-child]:mt-0',
  '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_strong]:font-semibold',
  '[&_em]:italic',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-atg-border [&_blockquote]:pl-3 [&_blockquote]:text-atg-muted',
);

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-atg-muted hover:bg-atg-surface hover:text-atg-fg',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      {label}
    </button>
  );
}

export type RichTextEditorProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
};

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  placeholder = 'Saisissez une description…',
  className,
  contentClassName,
}: RichTextEditorProps) {
  const generatedId = useId();
  const editorId = id ?? generatedId;

  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: editorId,
        class: cn(editorContentClass, contentClassName),
        'aria-label': label ?? 'Éditeur de texte enrichi',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  const disabled = !editor;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={editorId} className="mb-2 block text-sm font-medium text-atg-fg">
          {label}
        </label>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-atg-border bg-atg-elevated">
        <div
          className="flex flex-wrap gap-1 border-b border-atg-border bg-atg-surface/60 px-2 py-1.5"
          role="toolbar"
          aria-label="Mise en forme"
        >
          <ToolbarButton
            label="Gras"
            active={editor?.isActive('bold')}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="Italique"
            active={editor?.isActive('italic')}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="Titre"
            active={editor?.isActive('heading', { level: 2 })}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            label="Liste"
            active={editor?.isActive('bulletList')}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="Liste num."
            active={editor?.isActive('orderedList')}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
        </div>
        <div className="relative">
          {editor?.isEmpty ? (
            <p className="pointer-events-none absolute left-4 top-3 text-sm text-atg-muted">
              {placeholder}
            </p>
          ) : null}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { cn } from '@africatourismgate/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

const iconClass = 'h-4 w-4';

function BoldIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 4h7a4 4 0 0 1 0 8H6V4zm0 8h8a4 4 0 0 1 0 8H6v-8z"
      />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h9M5 20h9M14 4 10 20" />
    </svg>
  );
}

function HeadingIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6v12M20 6v12M4 12h16" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 6v12" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h12M9 12h12M9 18h12" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h12M9 12h12M9 18h12" />
      <text x="2" y="8" fill="currentColor" stroke="none" fontSize="7" fontWeight="600">
        1
      </text>
      <text x="2" y="14" fill="currentColor" stroke="none" fontSize="7" fontWeight="600">
        2
      </text>
      <text x="2" y="20" fill="currentColor" stroke="none" fontSize="7" fontWeight="600">
        3
      </text>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 16-5-5-7 7" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

const editorContentClass = cn(
  'min-h-[140px] px-4 py-3 text-sm leading-relaxed text-atg-fg',
  '[&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2:first-child]:mt-0',
  '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_strong]:font-semibold',
  '[&_a]:text-primary [&_a]:underline',
  '[&_img]:my-2 [&_img]:max-h-64 [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-md',
  '[&_em]:italic',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-atg-border [&_blockquote]:pl-3 [&_blockquote]:text-atg-muted',
);

export type RichTextUploadedAsset = {
  assetType: 'image' | 'pdf' | 'word';
  url: string;
  name?: string | null;
};

type ToolbarButtonProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, icon, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-atg-muted hover:bg-atg-surface hover:text-atg-fg',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      {icon}
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
  onUploadAsset?: (file: File) => Promise<RichTextUploadedAsset>;
};

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  placeholder = 'Saisissez une description…',
  className,
  contentClassName,
  onUploadAsset,
}: RichTextEditorProps) {
  const generatedId = useId();
  const editorId = id ?? generatedId;
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
  const canUpload = Boolean(onUploadAsset) && !disabled;

  async function handleAssetPick(file: File) {
    if (!editor || !onUploadAsset) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await onUploadAsset(file);
      if (uploaded.assetType === 'image') {
        editor
          .chain()
          .focus()
          .insertContent(
            `<p><img src="${uploaded.url}" alt="${uploaded.name ?? 'Image'}" /></p>`,
          )
          .run();
        return;
      }
      const label = uploaded.name?.trim() || file.name || uploaded.url;
      editor
        .chain()
        .focus()
        .insertContent(
          `<p><a href="${uploaded.url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`,
        )
        .run();
    } catch {
      setUploadError("Échec d'upload du fichier.");
    } finally {
      setUploading(false);
    }
  }

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
            icon={<BoldIcon />}
            active={editor?.isActive('bold')}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="Italique"
            icon={<ItalicIcon />}
            active={editor?.isActive('italic')}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="Titre"
            icon={<HeadingIcon />}
            active={editor?.isActive('heading', { level: 2 })}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            label="Liste"
            icon={<BulletListIcon />}
            active={editor?.isActive('bulletList')}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="Liste numérotée"
            icon={<OrderedListIcon />}
            active={editor?.isActive('orderedList')}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="Insérer une image"
            icon={<ImageIcon />}
            disabled={!canUpload || uploading}
            onClick={() => imageInputRef.current?.click()}
          />
          <ToolbarButton
            label="Insérer un document"
            icon={<FileIcon />}
            disabled={!canUpload || uploading}
            onClick={() => documentInputRef.current?.click()}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleAssetPick(file);
              event.currentTarget.value = '';
            }}
          />
          <input
            ref={documentInputRef}
            type="file"
            accept="application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleAssetPick(file);
              event.currentTarget.value = '';
            }}
          />
        </div>
        {uploadError ? (
          <p className="border-b border-atg-border bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {uploadError}
          </p>
        ) : null}
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

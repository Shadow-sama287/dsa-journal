import React, { useState, useRef } from 'react';
import { Bold, Italic, List, Code, Terminal, Edit3, Columns } from 'lucide-react';

/**
 * Clean, lightweight, zero-dependency Markdown renderer for engineering notes.
 */
export function renderMarkdown(content: string): React.ReactNode {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block check
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-1.5 p-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 font-mono text-[11px] overflow-x-auto whitespace-pre rounded-none"
          >
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Heading 3: ### Heading
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-2 mb-1 tracking-tight">
          {formatInline(line.slice(4))}
        </h4>
      );
      continue;
    }

    // Heading 2: ## Heading
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2 mb-1 tracking-tight">
          {formatInline(line.slice(3))}
        </h3>
      );
      continue;
    }

    // Blockquote: > Quote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          className="border-l border-zinc-400 dark:border-zinc-600 pl-2.5 my-1 text-zinc-600 dark:text-zinc-400 italic text-[11px]"
        >
          {formatInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet List: - item or * item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 my-0.5 text-xs text-zinc-800 dark:text-zinc-200">
          <span className="text-zinc-400 select-none">•</span>
          <span className="flex-1">{formatInline(line.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={i} className="h-1.5" />);
      continue;
    }

    // Standard paragraph line
    elements.push(
      <p key={i} className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed my-0.5">
        {formatInline(line)}
      </p>
    );
  }

  // Handle unclosed code block if any
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <pre
        key="code-unclosed"
        className="my-1.5 p-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 font-mono text-[11px] overflow-x-auto whitespace-pre rounded-none"
      >
        <code>{codeBlockLines.join('\n')}</code>
      </pre>
    );
  }

  return <div className="space-y-0.5 font-sans">{elements}</div>;
}

/**
 * Format inline tokens: **bold**, *italic*, `code`
 */
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Check for inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={`c-${keyIndex++}`}
          className="px-1 py-0.2 bg-zinc-150 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 font-mono text-[11px] rounded-none"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Check for **bold**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={`b-${keyIndex++}`} className="font-bold text-zinc-950 dark:text-white">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Check for *italic*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(
        <em key={`i-${keyIndex++}`} className="italic">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Regular character
    const nextSpecial = remaining.search(/[`*]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLines?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Notes, intuition, time/space complexity O(N)...',
  minLines = 4,
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSyntax = (before: string, after: string = '', defaultText: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value ? `${value}\n${before}${defaultText}${after}` : `${before}${defaultText}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = before + selectedText + after;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value ? `${value}\n- List item` : '- List item');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      const prefixed = selectedText
        .split('\n')
        .map(line => (line.startsWith('- ') ? line : `- ${line}`))
        .join('\n');
      const newValue = value.substring(0, start) + prefixed + value.substring(end);
      onChange(newValue);
    } else {
      const beforeCursor = value.substring(0, start);
      const needNewline = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
      const insert = (needNewline ? '\n- ' : '- ') + 'Item';
      const newValue = value.substring(0, start) + insert + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + (needNewline ? 3 : 2), start + insert.length);
      }, 0);
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-none bg-white dark:bg-zinc-950 overflow-hidden shadow-none transition-colors">
      {/* Editor Header: Formatting Toolbar & Mode Toggle Button */}
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 select-none flex-wrap">
        {/* Toolbar for Bold, Italic, and Bullet lists */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => insertSyntax('**', '**', 'bold')}
            className="px-2 py-0.5 text-xs font-mono rounded-none border border-zinc-250 dark:border-zinc-750 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1 transition cursor-pointer"
            title="Bold (**text**)"
          >
            <Bold className="w-3 h-3" />
            <span className="text-[11px] font-bold">Bold</span>
          </button>

          <button
            type="button"
            onClick={() => insertSyntax('*', '*', 'italic')}
            className="px-2 py-0.5 text-xs font-mono rounded-none border border-zinc-250 dark:border-zinc-750 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1 transition cursor-pointer"
            title="Italic (*text*)"
          >
            <Italic className="w-3 h-3" />
            <span className="text-[11px] italic">Italic</span>
          </button>

          <button
            type="button"
            onClick={insertBulletList}
            className="px-2 py-0.5 text-xs font-mono rounded-none border border-zinc-250 dark:border-zinc-750 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1 transition cursor-pointer"
            title="Bullet List (- item)"
          >
            <List className="w-3 h-3" />
            <span className="text-[11px]">Bullet list</span>
          </button>

          <div className="h-3.5 w-px bg-zinc-200 dark:border-zinc-800 mx-0.5 hidden xs:block" />

          <button
            type="button"
            onClick={() => insertSyntax('`', '`', 'code')}
            className="p-1 rounded-none text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
            title="Inline Code (`code`)"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertSyntax('```\n', '\n```', 'code block')}
            className="p-1 rounded-none text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
            title="Code Block (```)"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode Toggle Button: Edit vs Live Preview */}
        <div className="flex items-center border border-zinc-250 dark:border-zinc-750 bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-none">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-2.5 py-0.5 text-xs font-mono font-medium rounded-none transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'edit'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border border-zinc-900 dark:border-zinc-100 shadow-none'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-2.5 py-0.5 text-xs font-mono font-medium rounded-none transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'preview'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border border-zinc-900 dark:border-zinc-100 shadow-none'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area: Split-Pane View in Live Preview mode, Single Editor in Edit mode */}
      {mode === 'preview' ? (
        /* Split-Pane View: Left Editor, Right Live Rendered Markdown */
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* Left Pane: Editor */}
          <div className="flex flex-col bg-white dark:bg-zinc-950">
            <div className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-mono text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between select-none">
              <span>EDITOR PANE</span>
              <span className="text-[9px] text-zinc-400 font-mono">{value.length} chars</span>
            </div>
            <textarea
              ref={textareaRef}
              rows={minLines || 5}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none font-mono leading-relaxed rounded-none resize-none min-h-[140px] max-h-[260px] overflow-y-auto"
            />
          </div>

          {/* Right Pane: Live Preview */}
          <div className="flex flex-col bg-zinc-50/50 dark:bg-zinc-950/60">
            <div className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-mono text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between select-none">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none inline-block animate-pulse" />
                <span>LIVE PREVIEW</span>
              </span>
              <span className="text-[9px] text-zinc-400 font-mono">real-time</span>
            </div>
            <div className="p-3 min-h-[140px] max-h-[260px] overflow-y-auto">
              {value.trim() ? (
                renderMarkdown(value)
              ) : (
                <p className="text-xs text-zinc-400 italic font-sans">
                  Live preview will render here in real-time as you type...
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode: Full Width Single Editor Pane */
        <div className="flex flex-col bg-white dark:bg-zinc-950">
          <textarea
            ref={textareaRef}
            rows={minLines || 5}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none font-mono leading-relaxed rounded-none resize-y min-h-[120px]"
          />
        </div>
      )}
    </div>
  );
};

/**
 * Utility to convert markdown-like syntax and natural text into clean HTML.
 * Preserves existing HTML tags if already present.
 */

function inlineFormat(str: string): string {
    return str
        // Bold: **text**
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Inline code / highlight: `code`
        .replace(/`(.+?)`/g, '<code class="bg-stone-100 text-amber-800 px-1.5 py-0.5 rounded text-sm">$1</code>')
        // Links: [text](url)
        .replace(/\[(.*?)\]\((https?:\/\/[^\s]+|\/[^\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-600 hover:underline">$1</a>')
        // Inline image: ![alt](url)
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-xl shadow-md my-4 max-w-full h-auto" />');
}

export function formatContentToHtml(text: string): string {
    if (!text || !text.trim()) return '';

    // Split text into distinct blocks separated by one or more blank lines
    const blocks = text.trim().split(/\n\s*\n/);

    const htmlBlocks = blocks.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';

        // 1. If the block already starts with standard HTML block tags, keep as is
        if (/^<(p|h[1-6]|div|blockquote|ul|ol|table|figure|img|hr)/i.test(trimmed)) {
            return trimmed;
        }

        // 2. Horizontal rule: --- or ***
        if (/^(---|___|\*\*\*)$/.test(trimmed)) {
            return '<hr className="my-8 border-stone-200" />';
        }

        // 3. Standalone Image URL: http(s)://... or /uploads/... or Supabase storage URL
        // Example: https://.../public-assets/board/... or /uploads/...
        if (/^(https?:\/\/[^\s]+|\/uploads\/[^\s]+)(\.(jpe?g|png|gif|webp|svg)|(\/public-assets\/))(\?[^\s]*)?$/i.test(trimmed) ||
            /^(https?:\/\/[^\s]+\/storage\/v1\/object\/public\/[^\s]+)$/i.test(trimmed)) {
            return `<p><img src="${trimmed}" alt="이미지" /></p>`;
        }

        // 4. Markdown image syntax on its own line: ![alt](url)
        if (/^!\[(.*?)\]\((.*?)\)$/.test(trimmed)) {
            return trimmed.replace(/^!\[(.*?)\]\((.*?)\)$/, '<p><img src="$2" alt="$1" /></p>');
        }

        // 5. Headings:
        // ### -> <h4>
        if (/^###\s+(.+)$/.test(trimmed)) {
            return trimmed.replace(/^###\s+(.+)$/, '<h4>$1</h4>');
        }
        // ## -> <h3>
        if (/^##\s+(.+)$/.test(trimmed)) {
            return trimmed.replace(/^##\s+(.+)$/, '<h3>$1</h3>');
        }
        // # -> <h2>
        if (/^#\s+(.+)$/.test(trimmed)) {
            return trimmed.replace(/^#\s+(.+)$/, '<h2>$1</h2>');
        }

        // 6. Blockquote: > quote
        if (/^>\s*/.test(trimmed)) {
            const quoteLines = trimmed.split('\n').map(l => l.replace(/^>\s*/, '').trim()).filter(Boolean);
            const quoteContent = quoteLines.map(inlineFormat).join('<br />');
            return `<blockquote><p>${quoteContent}</p></blockquote>`;
        }

        // 7. Unordered list: - item or * item
        if (/^[-*]\s+/m.test(trimmed)) {
            const lines = trimmed.split('\n');
            const items = lines.map(line => line.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
            return `<ul>${items.map(it => `<li>${inlineFormat(it)}</li>`).join('')}</ul>`;
        }

        // 8. Ordered list: 1. item
        if (/^\d+\.\s+/m.test(trimmed)) {
            const lines = trimmed.split('\n');
            const items = lines.map(line => line.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
            return `<ol>${items.map(it => `<li>${inlineFormat(it)}</li>`).join('')}</ol>`;
        }

        // 9. Standard paragraph:
        // Converts internal single newlines to <br /> and applies bold/code/links
        const formatted = inlineFormat(trimmed).replace(/\n/g, '<br />');
        return `<p>${formatted}</p>`;
    });

    return htmlBlocks.filter(Boolean).join('\n');
}

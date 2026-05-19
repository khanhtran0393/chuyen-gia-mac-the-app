import React from 'react';

export default function MarkdownBody({ text, isStreaming = false }) {
  if (!text) return null;

  const lines = text.split('\n');

  const formatLine = (line, index) => {
    const trimmed = line.trim();

    // 1. Heading 1 (Book Title / Main Outline Header)
    if (trimmed.startsWith('📖') || trimmed.startsWith('=======================')) {
      return (
        <h1 
          key={index} 
          className="text-white text-2xl md:text-3xl font-extrabold uppercase mb-6 tracking-tight border-b border-zinc-800 pb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {line}
        </h1>
      );
    }

    // 2. Heading 2 (Bối cảnh, Nhân vật, Chương chi tiết)
    if (trimmed.startsWith('I.') || trimmed.startsWith('II.') || trimmed.startsWith('III.')) {
      return (
        <h2 
          key={index} 
          className="text-white text-xl md:text-2xl font-bold mt-9 mb-4 border-b border-zinc-800 pb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {line}
        </h2>
      );
    }

    // 3. Chapter item inside outlines (with orange bullet points and italic content)
    if (line.startsWith('*   **Chương') || line.startsWith('    *Ý chính:*')) {
      // Inline styling matching style.css:
      // Replace *   **(.*?)** with bold orange text
      // Replace *Ý chính:* with italic secondary text
      let processed = line;
      let isChapterTitle = line.includes('Chương');

      if (isChapterTitle) {
        const match = processed.match(/\*   \*\*(.*?)\*\*(.*)/);
        if (match) {
          return (
            <div key={index} className="ml-5 mb-2 leading-relaxed text-zinc-300">
              <strong className="text-amber-500 font-semibold">{match[1]}</strong>
              <span>{match[2]}</span>
            </div>
          );
        }
      } else {
        const match = processed.match(/    \*Ý chính:\*(.*)/);
        if (match) {
          return (
            <div key={index} className="ml-5 mb-2 leading-relaxed text-zinc-400">
              <em className="text-zinc-500 not-italic font-medium">Ý chính:</em>
              <span>{match[1]}</span>
            </div>
          );
        }
      }
    }

    // 4. Character Profile Chips inside Outlines
    if (line.startsWith('*   **')) {
      const match = line.match(/\*   \*\*(.*?)\*\*(.*)/);
      if (match) {
        return (
          <div key={index} className="ml-3 mb-3 leading-relaxed text-zinc-300">
            <strong className="text-white font-semibold text-[0.98rem]">{match[1]}</strong>
            <span>{match[2]}</span>
          </div>
        );
      }
    }

    // 5. Blockquote (World Settings, etc.)
    if (trimmed.startsWith('>')) {
      const content = line.substring(line.indexOf('>') + 1);
      return (
        <blockquote 
          key={index} 
          className="border-l-4 border-blue-500 bg-blue-500/2 px-4.5 py-3 my-5 rounded-r-lg text-zinc-400 leading-relaxed text-justify italic"
        >
          {content}
        </blockquote>
      );
    }

    // 6. Centered italic notes (e.g. *Bóng tối không đặc quánh...*)
    if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
      const content = trimmed.substring(1, trimmed.length - 1);
      return (
        <p 
          key={index} 
          className="italic text-zinc-400 mb-4.5 text-center leading-relaxed"
        >
          {content}
        </p>
      );
    }

    // Empty lines
    if (trimmed === '') {
      return <div key={index} className="h-4" />;
    }

    // 7. Standard Paragraph
    // Apply inline bold **text** and italic *text* replacement
    let content = line;
    // Simple inline parsing for bold/italic inside paragraphs
    const parts = [];
    let currentIdx = 0;
    
    // Quick regex scanner
    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const matchText = match[0];
      const matchIdx = match.index;
      
      // Add text before match
      if (matchIdx > currentIdx) {
        parts.push(content.substring(currentIdx, matchIdx));
      }
      
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        parts.push(
          <strong key={matchIdx} className="text-white font-semibold">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        parts.push(
          <em key={matchIdx} className="text-zinc-400 italic">
            {matchText.slice(1, -1)}
          </em>
        );
      }
      
      currentIdx = regex.lastIndex;
    }
    
    if (currentIdx < content.length) {
      parts.push(content.substring(currentIdx));
    }

    return (
      <p 
        key={index} 
        className="mb-4.5 text-justify leading-relaxed text-zinc-300"
        style={{ textIndent: trimmed.startsWith('*') ? '0' : '24px' }}
      >
        {parts.length > 0 ? parts : line}
      </p>
    );
  };

  return (
    <div className={`markdown-body text-zinc-300 leading-8 ${isStreaming ? 'typing-cursor' : ''}`}>
      {lines.map((line, idx) => formatLine(line, idx))}
    </div>
  );
}

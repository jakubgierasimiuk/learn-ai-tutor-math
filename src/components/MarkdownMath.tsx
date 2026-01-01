import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { normalizeMath } from "@/lib/markdown";

type Props = {
  content: string;
  className?: string;
};

/**
 * Renders Markdown with math (KaTeX).
 * - Supports $...$ (inline) and $$...$$ (block)
 * - Also supports \(...\) and \[...\] by converting to $/$$
 */
export function MarkdownMath({ content, className }: Props) {
  const normalized = normalizeMath(
    (content ?? "")
      // Convert LaTeX delimiters to remark-math delimiters
      .replace(/\\\[/g, "$$")
      .replace(/\\\]/g, "$$")
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
  );

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => (
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{children}</p>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

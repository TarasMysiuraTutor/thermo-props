import { marked } from "marked";

export default function MarkdownContent({ content }) {
  // const html = marked.parse(content);

  if (!content) return null;
  const html = marked.parse(content);

  return (
    <article
      className="seo-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

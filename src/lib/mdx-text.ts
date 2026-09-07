import { createProcessor } from '@mdx-js/mdx';

type Node = { type: string; name?: string | null; value?: string; alt?: string | null; children?: Node[] };

// Extract prose without evaluating JavaScript or indexing imports and component attributes.
export function mdxSearchText(body: string): string {
  const tree = createProcessor().parse(body);
  function text(node: Node): string {
    if (['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression'].includes(node.type) || ['script', 'style'].includes(node.name ?? '')) return '';
    if (['text', 'code', 'inlineCode'].includes(node.type)) return node.value ?? '';
    if (node.type === 'image') return node.alt ?? '';
    return (node.children ?? []).map(text).filter(Boolean).join(' ');
  }
  return text(tree).replace(/\s+/g, ' ').trim();
}

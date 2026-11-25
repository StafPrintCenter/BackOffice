export function setCaretAfter(node: Node): Range {
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return range;
}

export function setCaretIn(node: Node): Range {
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return range;
}

export function elementForNode(node: Node): Element | null {
  return node instanceof Element ? node : node.parentElement;
}

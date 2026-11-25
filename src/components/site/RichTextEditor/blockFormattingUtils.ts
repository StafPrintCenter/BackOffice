function unwrapElement(element: Element): void {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  element.remove();
}

function clearInlineStyles(root: Element): void {
  root.querySelectorAll("strong, b, em, i, u, s, strike, del, sub, sup, code, span, font, a").forEach(unwrapElement);
  root.querySelectorAll("[style], [class]").forEach((element) => {
    element.removeAttribute("style");
    element.removeAttribute("class");
  });
  root.removeAttribute("style");
  root.removeAttribute("class");
}

function replaceWithParagraph(element: HTMLElement): HTMLParagraphElement {
  const paragraph = document.createElement("p");
  while (element.firstChild) paragraph.append(element.firstChild);
  element.replaceWith(paragraph);
  return paragraph;
}

export function clearFormattingInEditor(editor: HTMLElement, range: Range): Range {
  const affectedElements = Array.from(
    editor.querySelectorAll<HTMLElement>("p, h1, h2, h3, h4, h5, h6, blockquote, pre, li, ul, ol"),
  ).filter((element) => range.collapsed
    ? element.contains(range.startContainer)
    : range.intersectsNode(element));
  const affectedLists = affectedElements.filter(
    (element) => element.tagName === "UL" || element.tagName === "OL",
  ).filter((list) => !affectedElements.some(
    (element) => (element.tagName === "UL" || element.tagName === "OL") && element !== list && element.contains(list),
  ));
  const affectedBlocks = affectedElements.filter(
    (element) => !["UL", "OL", "LI"].includes(element.tagName),
  );
  const normalizedBlocks: HTMLElement[] = [];

  document.execCommand("removeFormat");

  affectedLists.forEach((list) => {
    const paragraphs = document.createDocumentFragment();
    Array.from(list.children).forEach((child) => {
      const paragraph = document.createElement("p");
      while (child.firstChild) paragraph.append(child.firstChild);
      clearInlineStyles(paragraph);
      normalizedBlocks.push(paragraph);
      paragraphs.append(paragraph);
    });
    list.replaceWith(paragraphs);
  });

  affectedBlocks.forEach((block) => {
    if (!editor.contains(block)) return;
    const paragraph = /^H[1-6]$/.test(block.tagName) || block.tagName === "BLOCKQUOTE" || block.tagName === "PRE"
      ? replaceWithParagraph(block)
      : block;
    clearInlineStyles(paragraph);
    normalizedBlocks.push(paragraph);
  });

  const focusBlock = normalizedBlocks[0] ?? editor;
  const nextRange = document.createRange();
  nextRange.selectNodeContents(focusBlock);
  nextRange.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(nextRange);
  return nextRange;
}

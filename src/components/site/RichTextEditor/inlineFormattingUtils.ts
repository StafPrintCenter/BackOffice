import { elementForNode, setCaretIn } from "./selectionUtils";

export function toggleInlineCode(editor: HTMLElement, range: Range): Range {
  const code = elementForNode(range.startContainer)?.closest("code");
  if (code && editor.contains(code)) {
    const parent = code.parentNode;
    if (!parent) return range;
    while (code.firstChild) parent.insertBefore(code.firstChild, code);
    code.remove();
    return range;
  }

  const inlineCode = document.createElement("code");
  if (range.collapsed) {
    inlineCode.append(document.createElement("br"));
    range.insertNode(inlineCode);
    return setCaretIn(inlineCode);
  }

  inlineCode.append(range.extractContents());
  range.insertNode(inlineCode);
  const nextRange = document.createRange();
  nextRange.selectNodeContents(inlineCode);
  nextRange.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(nextRange);
  return nextRange;
}

export function exitEmptyListItem(editor: HTMLElement, range: Range): Range | null {
  if (!range.collapsed) return null;
  const listItem = elementForNode(range.startContainer)?.closest("li");
  const list = listItem?.parentElement;
  if (
    !listItem ||
    !list ||
    !editor.contains(listItem) ||
    (list.tagName !== "UL" && list.tagName !== "OL") ||
    listItem.textContent?.trim() ||
    listItem.querySelector("ul, ol, table, img, video, iframe")
  ) {
    return null;
  }

  const followingItems: Element[] = [];
  let nextItem = listItem.nextElementSibling;
  while (nextItem) {
    followingItems.push(nextItem);
    nextItem = nextItem.nextElementSibling;
  }
  const paragraph = document.createElement("p");
  paragraph.append(document.createElement("br"));

  if (followingItems.length > 0) {
    const nextList = list.cloneNode(false) as HTMLUListElement | HTMLOListElement;
    followingItems.forEach((item) => nextList.append(item));
    listItem.remove();
    list.after(paragraph, nextList);
    if (list.children.length === 0) list.remove();
  } else {
    listItem.remove();
    if (list.children.length === 0) list.replaceWith(paragraph);
    else list.after(paragraph);
  }

  return setCaretIn(paragraph);
}

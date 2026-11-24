import type { InsertionPayload, TableAction } from "./types";

export function normalizeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function createVideoElement(url: string): HTMLVideoElement | HTMLIFrameElement {
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname.toLowerCase();
  let embedUrl: string | null = null;

  if (
    host === "youtu.be" ||
    ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)
  ) {
    const videoId =
      host === "youtu.be"
        ? parsedUrl.pathname.split("/").filter(Boolean)[0]
        : parsedUrl.searchParams.get("v") ?? parsedUrl.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];
    if (videoId && /^[\w-]{11}$/.test(videoId)) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
  } else if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
    const videoId = parsedUrl.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  if (embedUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = "Vidéo intégrée";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    return iframe;
  }

  const video = document.createElement("video");
  video.controls = true;
  video.playsInline = true;
  video.src = url;
  return video;
}

function setCaretAfter(node: Node): Range {
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return range;
}

function setCaretIn(node: Node): Range {
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return range;
}

function elementForNode(node: Node): Element | null {
  return node instanceof Element ? node : node.parentElement;
}

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

export function updateTableAtRange(
  editor: HTMLElement,
  range: Range,
  action: TableAction,
): Range | null {
  const selectedCell = elementForNode(range.startContainer)?.closest("td, th");
  if (!(selectedCell instanceof HTMLTableCellElement)) return null;
  const cell = selectedCell;
  const table = cell.closest("table");
  const row = cell.parentElement;
  if (
    !(table instanceof HTMLTableElement) ||
    !(row instanceof HTMLTableRowElement) ||
    !editor.contains(table)
  ) return null;

  if (action === "add-row") {
    const newRow = row.cloneNode(false) as HTMLTableRowElement;
    Array.from(row.cells).forEach((currentCell) => {
      const newCell = document.createElement(currentCell.tagName.toLowerCase());
      newCell.append(document.createElement("br"));
      newRow.append(newCell);
    });
    row.after(newRow);
    return setCaretIn(newRow.cells[Math.min(cell.cellIndex, newRow.cells.length - 1)]);
  }

  if (action === "remove-row") {
    if (table.rows.length <= 1) return null;
    const cellIndex = cell.cellIndex;
    const nextRow = row.nextElementSibling ?? row.previousElementSibling;
    row.remove();
    if (!(nextRow instanceof HTMLTableRowElement) || !nextRow.cells.length) return null;
    return setCaretIn(nextRow.cells[Math.min(cellIndex, nextRow.cells.length - 1)]);
  }

  const columnIndex = cell.cellIndex;
  const rowCells = Array.from(table.rows).map((tableRow) => tableRow.cells.length);
  const columnCount = Math.max(...rowCells);
  if (action === "remove-column" && columnCount <= 1) return null;

  Array.from(table.rows).forEach((tableRow) => {
    if (action === "add-column") {
      const newCell = document.createElement(cell.tagName.toLowerCase());
      newCell.append(document.createElement("br"));
      tableRow.insertBefore(newCell, tableRow.cells[columnIndex + 1] ?? null);
    } else {
      tableRow.cells[columnIndex]?.remove();
    }
  });

  const nextCell = row.cells[Math.min(columnIndex, row.cells.length - 1)];
  return nextCell ? setCaretIn(nextCell) : null;
}

function closestTextBlock(node: Node, editor: HTMLElement): HTMLElement | null {
  const element = node instanceof Element ? node : node.parentElement;
  const block = element?.closest("p, h1, h2, h3, h4, h5, h6, blockquote, li");
  return block instanceof HTMLElement && editor.contains(block) ? block : null;
}

function insertTableAtRange(editor: HTMLElement, range: Range, table: HTMLTableElement): Range {
  range.deleteContents();
  const block = closestTextBlock(range.startContainer, editor);

  if (!block) {
    range.insertNode(table);
    const paragraph = document.createElement("p");
    paragraph.append(document.createElement("br"));
    table.after(paragraph);
    return setCaretAfter(paragraph);
  }

  const tailRange = range.cloneRange();
  tailRange.setEnd(block, block.childNodes.length);
  const trailingContent = tailRange.extractContents();
  const trailingParagraph = document.createElement("p");
  if (trailingContent.hasChildNodes()) trailingParagraph.append(trailingContent);
  else trailingParagraph.append(document.createElement("br"));

  if (block.tagName === "LI") {
    block.append(table, trailingParagraph);
  } else {
    block.after(table);
    table.after(trailingParagraph);
  }

  const caretRange = document.createRange();
  caretRange.selectNodeContents(trailingParagraph);
  caretRange.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(caretRange);
  return caretRange;
}

function createTable(rows: number, columns: number): HTMLTableElement {
  const table = document.createElement("table");
  const body = table.createTBody();
  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const row = body.insertRow();
    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      row.insertCell().append(document.createElement("br"));
    }
  }
  return table;
}

export function insertPayloadAtRange(
  editor: HTMLElement,
  range: Range,
  payload: InsertionPayload,
): Range | null {
  if (payload.type === "table") {
    return insertTableAtRange(editor, range, createTable(payload.rows, payload.columns));
  }

  if (payload.type === "emoji") {
    const textNode = document.createTextNode(payload.value);
    range.deleteContents();
    range.insertNode(textNode);
    return setCaretAfter(textNode);
  }

  const url = normalizeHttpUrl(payload.url);
  if (!url) return null;

  let node: HTMLElement;
  if (payload.type === "image") {
    const image = document.createElement("img");
    image.src = url;
    image.alt = payload.alt;
    node = image;
  } else if (payload.type === "video") {
    node = createVideoElement(url);
  } else {
    const link = document.createElement("a");
    link.href = url;
    link.textContent = payload.text.trim() || url;
    node = link;
  }

  range.deleteContents();
  range.insertNode(node);
  return setCaretAfter(node);
}

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

import type { InsertionPayload } from "./types";

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
  root.querySelectorAll("strong, b, em, i, u, s, strike, del, sub, sup, span, font, a").forEach(unwrapElement);
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
    editor.querySelectorAll<HTMLElement>("p, h1, h2, h3, h4, h5, h6, blockquote, li, ul, ol"),
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
  const normalizedBlocks: HTMLParagraphElement[] = [];

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
    const paragraph = /^H[1-6]$/.test(block.tagName) || block.tagName === "BLOCKQUOTE"
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

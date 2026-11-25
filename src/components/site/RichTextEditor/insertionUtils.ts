import type { InsertionPayload } from "./types";
import { insertTableAtRange } from "./tableUtils";
import { setCaretAfter } from "./selectionUtils";

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

export function insertPayloadAtRange(
  editor: HTMLElement,
  range: Range,
  payload: InsertionPayload,
): Range | null {
  if (payload.type === "table") {
    return insertTableAtRange(editor, range, payload.rows, payload.columns);
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

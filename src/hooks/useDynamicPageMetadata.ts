import { useEffect } from "react";

export function useDynamicPageMetadata(title: string | undefined, description: string | undefined) {
  useEffect(() => {
    if (!title) return;

    document.title = title;
    const titleMeta = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (titleMeta) titleMeta.content = title;

    if (!description) return;

    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = description;

    const ogDescriptionMeta = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDescriptionMeta) ogDescriptionMeta.content = description;
  }, [title, description]);
}

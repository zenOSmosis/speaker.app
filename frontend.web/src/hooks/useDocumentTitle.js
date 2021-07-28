import { useEffect } from "react";

const ROOT_DOCUMENT_TITLE = document.title;
let DEFAULT_DOCUMENT_TITLE = ROOT_DOCUMENT_TITLE;

/**
 * @param {string | null} documentTitle
 * @param {string | null} defaultDocumentTitle? [optional] If defined, changes
 * are persistent across updates
 */
export default function useDocumentTitle(
  documentTitle,
  defaultDocumentTitle = null
) {
  useEffect(() => {
    // Override previous default document title if a new one is set
    if (defaultDocumentTitle) {
      DEFAULT_DOCUMENT_TITLE = defaultDocumentTitle;
    }

    document.title = documentTitle
      ? `${documentTitle} | ${DEFAULT_DOCUMENT_TITLE}`
      : DEFAULT_DOCUMENT_TITLE;
  }, [documentTitle, defaultDocumentTitle]);
}

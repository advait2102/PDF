import React, { useEffect, useRef } from "react";
import WebViewer from "@pdftron/webviewer";

function saveAuditLog(event) {
  // Use localStorage as a local DB for audit log
  let logs = [];
  try {
    logs = JSON.parse(localStorage.getItem('pdftron-auditlog') || '[]');
  } catch {}
  logs.unshift(event);
  localStorage.setItem('pdftron-auditlog', JSON.stringify(logs));
  // Also try to update the public JSON file (will only work in dev with a backend, but harmless in static)
  fetch('/pdftron-auditlog.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logs)
  }).catch(() => {});
}

const PdfTronViewer = ({ fileUrl }) => {
  const viewer = useRef(null);

  useEffect(() => {
    if (!fileUrl) return;
    WebViewer(
      {
        path: "/webviewer/lib",
        initialDoc: fileUrl,
        licenseKey: "demo:1751037981820:61ad8ba0030000000018b23224b9e0b3b01ad516b33cc8703ca455215c",
      },
      viewer.current
    ).then((instance) => {
      // Listen for page changes
      instance.Core.documentViewer.addEventListener('pageNumberUpdated', (page) => {
        saveAuditLog({ date: new Date().toLocaleString(), page, event: 'Page Changed' });
      });
      // Listen for annotationChanged (all annotation events)
      instance.Core.annotationManager.addEventListener('annotationChanged', (annotations, action, { imported, isUndoRedo }) => {
        annotations.forEach(a => {
          // Add/Modify/Delete
          if (action === 'add') {
            saveAuditLog({ date: new Date().toLocaleString(), page: a.PageNumber || '-', event: `Annotation Added (${a.Subject || a.Type})` });
          }
          if (action === 'modify') {
            saveAuditLog({ date: new Date().toLocaleString(), page: a.PageNumber || '-', event: `Annotation Modified (${a.Subject || a.Type})` });
          }
          if (action === 'delete') {
            saveAuditLog({ date: new Date().toLocaleString(), page: a.PageNumber || '-', event: `Annotation Deleted (${a.Subject || a.Type})` });
          }
          // Comment detection
          if (a.Subject === 'Comment' || a.getCustomData('trn-comment-state')) {
            saveAuditLog({ date: new Date().toLocaleString(), page: a.PageNumber || '-', event: 'Comment Added/Modified' });
          }
        });
      });
      // Listen for document loaded
      instance.Core.documentViewer.addEventListener('documentLoaded', () => {
        saveAuditLog({ date: new Date().toLocaleString(), page: 1, event: 'Document Loaded' });
        // Listen for bookmark changes (UI.BookmarksPanel is async)
        if (instance.UI && instance.UI.openElements) {
          instance.UI.openElements(['bookmarksPanel']);
          setTimeout(() => {
            const bookmarksPanel = instance.UI.getBookmarkPanel && instance.UI.getBookmarkPanel();
            if (bookmarksPanel && bookmarksPanel.on) {
              bookmarksPanel.on('bookmarkChanged', (bookmark) => {
                saveAuditLog({ date: new Date().toLocaleString(), page: bookmark?.PageNumber || '-', event: 'Bookmark Changed' });
              });
            }
          }, 1000);
        }
        // Listen for page rearrange (UI.ThumbnailPanel is async)
        if (instance.UI && instance.UI.openElements) {
          instance.UI.openElements(['thumbnailsPanel']);
          setTimeout(() => {
            const thumbnailPanel = instance.UI.getThumbnailPanel && instance.UI.getThumbnailPanel();
            if (thumbnailPanel && thumbnailPanel.on) {
              thumbnailPanel.on('pageMoved', ({ fromPageNumber, toPageNumber }) => {
                saveAuditLog({ date: new Date().toLocaleString(), page: `${fromPageNumber}→${toPageNumber}`, event: 'Page Rearranged' });
              });
            }
          }, 1000);
        }
      });
      // Listen for page deletion
      instance.Core.documentViewer.addEventListener('pagesDeleted', (deletedPages) => {
        saveAuditLog({
          date: new Date().toLocaleString(),
          page: Array.isArray(deletedPages) ? deletedPages.join(', ') : deletedPages,
          event: 'Page(s) Deleted',
        });
      });
      // Listen for page rearrange (pageMoved) using the Core API
      if (instance.Core && instance.Core.documentViewer) {
        instance.Core.documentViewer.addEventListener('pageMoved', ({ fromPageNumber, toPageNumber }) => {
          saveAuditLog({
            date: new Date().toLocaleString(),
            page: `${fromPageNumber}→${toPageNumber}`,
            event: 'Page Rearranged',
          });
        });
      }
    });
  }, [fileUrl]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <div ref={viewer} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default PdfTronViewer;

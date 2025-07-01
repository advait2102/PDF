import React, { useRef, useState } from 'react';
import PdfTronViewer from './PdfTronViewer';
import donorOverviewStyles from './donoroverview.style';
import { dummyMainGrid } from './model/donoroverview';
import WebViewer from '@pdftron/webviewer';

// Use actual files from public/files
const fileList = [
  'Black_Holes.pdf',
  'Origin_of_Species.pdf',
  'Special_Relativity.pdf',
];
const childGrid = fileList.map((file) => ({ id: 2003671, document: file }));

// Move PDFTron Core initialization to the very top of the component, so it starts as soon as the component renders
const DonorOverview = () => {
  const [rowHeight, setRowHeight] = useState(200);
  const isResizing = useRef(false);
  const [selectedDoc, setSelectedDoc] = useState(childGrid[0].document);
  const [showMenu, setShowMenu] = useState(false);
  const [showMergePopup, setShowMergePopup] = useState(false);
  const [mergedFileName, setMergedFileName] = useState('Merged.pdf');
  // Remove Game of Thrones.pdf from initial mergeOrder as well
  const [mergeOrder, setMergeOrder] = useState([...childGrid.map(f => f.document)]);
  const [mergedFile, setMergedFile] = useState(null);
  const [mergedUrl, setMergedUrl] = useState(null); // For download link
  const coreRef = useRef(null);
  const [coreReady, setCoreReady] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');
  const webviewerDiv = useRef(null); // Add this ref

  // Initialize PDFTron Core immediately on component render
  React.useLayoutEffect(() => {
    if (coreRef.current) {
      coreRef.current.dispose(); // Dispose of existing instance
      coreRef.current = null;
    }

    if (!webviewerDiv.current) return; // wait for DOM

    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey: 'demo:1751037981820:61ad8ba0030000000018b23224b9e0b3b01ad516b33cc8703ca455215c',
      },
      webviewerDiv.current // attach to hidden DOM node
    ).then(instance => {
      const { Core } = instance;
      if (Core && Core.setPDFWorkerPath) {
        Core.setPDFWorkerPath('/webviewer/lib/core/pdf');
      }
      coreRef.current = Core;
      setCoreReady(true);
    }).catch(e => {
      console.error('Error initializing WebViewer:', e);
    });

    return () => {
      if (coreRef.current && typeof coreRef.current.dispose === 'function') {
        coreRef.current.dispose(); // Cleanup on unmount
        coreRef.current = null;
      } else {
        coreRef.current = null;
      }
    };
  }, []);

  const handleMouseDown = () => {
    isResizing.current = true;
    document.body.style.cursor = 'row-resize';
  };
  const handleMouseUp = () => {
    isResizing.current = false;
    document.body.style.cursor = '';
  };
  const handleMouseMove = (e) => {
    if (isResizing.current) {
      const newHeight = Math.max(100, e.clientY - 80); // 80px header+menu approx
      setRowHeight(newHeight);
    }
  };
  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  // Drag and drop for merge order
  const handleDragStart = (e, idx) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('dragIndex', idx);
  };
  const handleDrop = (e, idx) => {
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'), 10);
    if (dragIndex === idx) return;
    const newOrder = [...mergeOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(idx, 0, removed);
    setMergeOrder(newOrder);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Merge handler
  const handleMerge = () => {
    setShowMenu(false);
    setShowMergePopup(true);
  };
  const handleMergeConfirm = async () => {
    setMergeError('');
    setMerging(true);
    setMergedUrl(null);
    try {
      const Core = coreRef.current;
      if (!Core) throw new Error('PDFTron Core not loaded yet.');
      // Load all PDFs in the specified order
      const docs = await Promise.all(mergeOrder.map(async (file, i) => {
        const url = `/files/${file}`;
        try {
          return await Core.createDocument(url, { extension: 'pdf' });
        } catch (e) {
          throw new Error('Failed to load file #' + (i+1) + ': ' + (e.message || e));
        }
      }));
      // Merge all docs into the first one (use insertPages(docToInsert, pages, destIndex) like MergePDF)
      let mergedDoc = docs[0];
      for (let i = 1; i < docs.length; i++) {
        const docToInsert = docs[i];
        const pageCount = await docToInsert.getPageCount();
        const pages = Array.from({ length: pageCount }, (_, k) => k + 1);
        await mergedDoc.insertPages(docToInsert, pages, mergedDoc.getPageCount() + 1);
      }
      // Get merged file as blob and set download link
      let data = await mergedDoc.getFileData({
        downloadType: 'blob',
        fileType: 'pdf',
      });
      if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
      }
      const blob = new Blob([data.buffer || data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
    } catch (e) {
      setMergeError(e.message || String(e));
    } finally {
      setMerging(false);
    }
    // Log the merge event to the audit log (localStorage)
    try {
      let logs = JSON.parse(localStorage.getItem('pdftron-auditlog') || '[]');
      logs.unshift({
        date: new Date().toLocaleString(),
        page: '-',
        event: `Merge Triggered: ${mergedFileName} [${mergeOrder.join(' -> ')}]`
      });
      localStorage.setItem('pdftron-auditlog', JSON.stringify(logs));
    } catch {}
  };

  // Files to show in grid
  const filesToShow = mergedFile
    ? [{ id: 2003671, document: mergedFile }, ...childGrid]
    : childGrid;

  return (
    <div style={donorOverviewStyles.container}>
      {/* Hidden WebViewer div for PDFTron Core initialization */}
      <div ref={webviewerDiv} style={{ display: 'none' }} />
      {/* Left Column (50%) */}
      <div style={donorOverviewStyles.leftColumn}>
        {/* Top Row: Child grid only, resizable */}
        <div style={{ ...donorOverviewStyles.topRow, height: rowHeight, display: 'block' }}>
          {/* Child grid */}
          <div style={{ ...donorOverviewStyles.childGrid, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, position: 'relative' }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: '#222', flex: 1 }}>Documents available for 2003671 </span>
              <div style={{ position: 'relative', left: '-10px' }}>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px', color: '#222', borderRadius: '50%' }}
                  onClick={() => setShowMenu((v) => !v)}
                  aria-label="Settings"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-settings"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
                {showMenu && (
                  <div style={{ position: 'absolute', right: 0, top: 28, background: '#fff', border: '1px solid #eee', borderRadius: 6, boxShadow: '0 2px 8px #0002', zIndex: 10 }}>
                    <div
                      style={{ padding: '10px 24px', cursor: 'pointer', fontSize: 15, color: '#222', whiteSpace: 'nowrap' }}
                      onClick={handleMerge}
                    >
                      <span style={{ fontWeight: 600, color: '#222' }}>Merge</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <table style={donorOverviewStyles.childTable}>
              <thead>
                <tr>
                  <th style={{ ...donorOverviewStyles.childThId, color: '#222', paddingRight: 8 }}>#</th>
                  <th style={{ ...donorOverviewStyles.childThDoc, paddingLeft: 8 }}>Document</th>
                </tr>
              </thead>
              <tbody>
                {filesToShow.map((row) => (
                  <tr
                    key={row.id + row.document}
                    style={{ background: selectedDoc === row.document ? '#e3eafc' : 'transparent', cursor: 'pointer', borderRadius: 4, position: 'relative' }}
                    onClick={() => setSelectedDoc(row.document)}
                  >
                    <td style={{ ...donorOverviewStyles.childTdId, color: '#222', paddingRight: 8 }}>{row.id}</td>
                    <td style={{ ...donorOverviewStyles.childTdDoc, paddingLeft: 8 }}>{row.document}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Row Resize Handle */}
        <div
          style={donorOverviewStyles.rowResizeHandle}
          onMouseDown={handleMouseDown}
        />
        {/* Bottom Row: Main grid */}
        <div style={donorOverviewStyles.mainGridBox}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#222', margin: '12px 0 8px 0', textAlign: 'left' }}>Donor overview</div>
          <table style={donorOverviewStyles.mainTable}>
            <thead>
              <tr>
                <th style={donorOverviewStyles.mainTh}>Id</th>
                <th style={donorOverviewStyles.mainTh}>Type</th>
                <th style={donorOverviewStyles.mainTh}>Received</th>
                <th style={donorOverviewStyles.mainTh}>Status</th>
                <th style={{ ...donorOverviewStyles.mainTh }}>LastUpdate</th>
              </tr>
            </thead>
            <tbody>
              {dummyMainGrid.map((row, idx) => (
                <tr key={idx} style={donorOverviewStyles.mainTr}>
                  <td style={donorOverviewStyles.mainTd}>{row.Id}</td>
                  <td style={donorOverviewStyles.mainTd}>{row.type}</td>
                  <td style={donorOverviewStyles.mainTd}>{row.Received}</td>
                  <td style={donorOverviewStyles.mainTd}>{row.Status}</td>
                  <td style={{ ...donorOverviewStyles.mainTd, fontWeight: 600 }}>{row.LastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Right Column (50%): PDFTron full height */}
      <div style={donorOverviewStyles.rightColumn}>
        <div style={donorOverviewStyles.pdfContainer}>
          <div style={{ ...donorOverviewStyles.viewerInner, width: '100%', height: '100%', position: 'relative', boxSizing: 'border-box' }}>
            {selectedDoc && !document.querySelector('.webviewer') && (
              <PdfTronViewer
                fileUrl={`/files/${selectedDoc}`}
                containerStyle={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, margin: 0, padding: 0, overflow: 'hidden', boxSizing: 'border-box' }}
              />
            )}
          </div>
        </div>
      </div>
      {/* Merge Popup */}
      {showMergePopup && (
        <div style={{ ...donorOverviewStyles.popupOverlay, zIndex: 1000, background: 'rgba(0,0,0,0.25)', position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...donorOverviewStyles.popupBox, background: '#f9f9f9', color: '#333', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', borderRadius: 8, padding: 24, minWidth: 400, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ ...donorOverviewStyles.popupTitle, color: '#333', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Merge Documents</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, fontSize: 14, color: '#555', display: 'block', marginBottom: 8 }}>Merged File Name:</label>
              <input
                type="text"
                value={mergedFileName}
                onChange={e => setMergedFileName(e.target.value)}
                style={{ ...donorOverviewStyles.inputBox, color: '#333', background: '#fff', border: '1px solid #ccc', borderRadius: 4, padding: '8px 12px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 500, fontSize: 14, color: '#555', display: 'block', marginBottom: 8 }}>Order Files (drag to reorder):</label>
              <ul style={{ ...donorOverviewStyles.mergeListBox, background: '#fff', border: '1px solid #ddd', borderRadius: 4, padding: 0, listStyle: 'none', margin: 0 }}>
                {mergeOrder.map((doc, idx) => (
                  <li
                    key={doc}
                    style={{ ...donorOverviewStyles.mergeListItem, padding: '8px 12px', cursor: 'move', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, idx)}
                  >
                    <span style={{ color: '#333', fontWeight: 500 }}>{doc}</span>
                    <span style={{ cursor: 'grab', userSelect: 'none' }} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4H14M2 8H14M2 12H14" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {mergeError && (
              <div style={{ color: 'red', fontWeight: 500, margin: '16px 0' }}>
                Error: {mergeError}
              </div>
            )}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setShowMergePopup(false)}
                style={{ ...donorOverviewStyles.button, background: '#f1f1f1', color: '#333', border: '1px solid #ccc', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
              >
                Close
              </button>
              <button
                onClick={handleMergeConfirm}
                style={{ ...donorOverviewStyles.button, background: '#007bff', color: '#fff', padding: '10px 20px', borderRadius: 4, cursor: coreReady && !merging ? 'pointer' : 'not-allowed', fontSize: 14, opacity: coreReady && !merging ? 1 : 0.6 }}
                disabled={!coreReady || merging}
              >
                {coreReady ? (merging ? 'Merging...' : 'Merge & Generate Link') : 'Loading...'}
              </button>
            </div>
            {mergedUrl && (
              <div style={{ marginTop: 18 }}>
                <a href={mergedUrl} download={mergedFileName.endsWith('.pdf') ? mergedFileName : mergedFileName + '.pdf'} style={{ color: '#007bff', fontWeight: 600, fontSize: 14 }}>
                  Download Merged PDF
                </a>
              </div>
            )}
            {!coreReady && (
              <div style={{ color: '#007bff', fontWeight: 500, margin: '12px 0' }}>
                Initializing PDFTron Core, please wait...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorOverview;

import React, { useRef, useState } from 'react';
import PdfTronViewer from './PdfTronViewer';
import donorOverviewStyles from './donoroverview.style';
import { dummyChildGrid, dummyMainGrid } from './model/donoroverview';

const DonorOverview = () => {
  const [rowHeight, setRowHeight] = useState(200);
  const isResizing = useRef(false);
  const [selectedDoc, setSelectedDoc] = useState(dummyChildGrid[0].document);
  const [showMenu, setShowMenu] = useState(false);
  const [showMergePopup, setShowMergePopup] = useState(false);
  const [mergedFileName, setMergedFileName] = useState('Merged.pdf');
  const [mergeOrder, setMergeOrder] = useState([...dummyChildGrid.map(f => f.document)]);
  const [mergedFile, setMergedFile] = useState(null);

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
  const handleMergeConfirm = () => {
    setShowMergePopup(false);
    setMergedFile(mergedFileName);
    setSelectedDoc(mergedFileName);
    setMergeOrder([mergedFileName, ...mergeOrder]);
  };

  // Files to show in grid
  const filesToShow = mergedFile
    ? [{ id: 2003671, document: mergedFile }, ...dummyChildGrid]
    : dummyChildGrid;

  return (
    <div style={donorOverviewStyles.container}>
      {/* Left Column (50%) */}
      <div style={donorOverviewStyles.leftColumn}>
        {/* Top Row: Child grid only, resizable */}
        <div style={{ ...donorOverviewStyles.topRow, height: rowHeight, display: 'block' }}>
          {/* Child grid */}
          <div style={{ ...donorOverviewStyles.childGrid, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, position: 'relative' }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: '#222', flex: 1 }}>Child Documents</span>
              <div style={{ position: 'relative', left: '-15px' }}>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4, color: '#222' }}
                  onClick={() => setShowMenu((v) => !v)}
                  aria-label="Settings"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="9" stroke="#222" strokeWidth="2" fill="#222" />
                    <path d="M10 6V10L12.5 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    onMouseEnter={e => {
                      const tooltip = document.createElement('div');
                      tooltip.className = 'doc-tooltip';
                      tooltip.style.position = 'fixed';
                      tooltip.style.left = e.clientX + 20 + 'px';
                      tooltip.style.top = e.clientY - 20 + 'px';
                      tooltip.style.background = '#fff';
                      tooltip.style.color = '#222';
                      tooltip.style.border = '1px solid #ccc';
                      tooltip.style.borderRadius = '6px';
                      tooltip.style.boxShadow = '0 2px 8px #0002';
                      tooltip.style.padding = '12px 18px';
                      tooltip.style.zIndex = 2000;
                      tooltip.innerHTML = `
                        <div style='font-weight:600;font-size:15px;margin-bottom:8px;'>Document Info</div>
                        <div>Donor ID: 2003671</div>
                        <div>Name: ${row.document}</div>
                        <div>Origin: Mail</div>
                        <div>Created on: 26-06-2025</div>
                        <div>Created by: sathish</div>
                        <div>File Origin: XYZ Agency</div>
                        <div>OCRed: No</div>
                        <div>Total pages: 1500</div>
                      `;
                      document.body.appendChild(tooltip);
                      e.target._tooltip = tooltip;
                    }}
                    onMouseMove={e => {
                      if (e.target._tooltip) {
                        e.target._tooltip.style.left = e.clientX + 20 + 'px';
                        e.target._tooltip.style.top = e.clientY - 20 + 'px';
                      }
                    }}
                    onMouseLeave={e => {
                      if (e.target._tooltip) {
                        document.body.removeChild(e.target._tooltip);
                        e.target._tooltip = null;
                      }
                    }}
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
          <table style={donorOverviewStyles.mainTable}>
            <thead>
              <tr>
                <th style={donorOverviewStyles.mainTh}>Id</th>
                <th style={donorOverviewStyles.mainTh}>Type</th>
                <th style={donorOverviewStyles.mainTh}>Received</th>
                <th style={donorOverviewStyles.mainTh}>Status</th>
                <th style={donorOverviewStyles.mainTh}>LastUpdate</th>
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
        <div style={{ ...donorOverviewStyles.viewerBox, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', boxSizing: 'border-box' }}>
          <div style={{ ...donorOverviewStyles.viewerInner, width: '100%', height: '100%', position: 'relative', boxSizing: 'border-box' }}>
            <PdfTronViewer
              fileUrl={'/files/Game of Thrones.pdf'}
              containerStyle={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>
      </div>
      {/* Merge Popup */}
      {showMergePopup && (
        <div style={{ ...donorOverviewStyles.popupOverlay, zIndex: 1000, background: 'rgba(0,0,0,0.25)', position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...donorOverviewStyles.popupBox, background: '#fff', color: '#222', boxShadow: '0 4px 24px #0003', minWidth: 400, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ ...donorOverviewStyles.popupTitle, color: '#222' }}>Merge Documents</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, fontSize: 15, color: '#222' }}>Merged File Name:</label>
              <input
                type="text"
                value={mergedFileName}
                onChange={e => setMergedFileName(e.target.value)}
                style={{ ...donorOverviewStyles.inputBox, color: '#222', background: '#f7f8fa', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 500, fontSize: 15, color: '#222' }}>Order Files (drag to reorder):</label>
              <ul style={{ ...donorOverviewStyles.mergeListBox, background: '#f7f8fa', border: '1px solid #eee' }}>
                {mergeOrder.map((doc, idx) => (
                  <li
                    key={doc}
                    style={{ ...donorOverviewStyles.mergeListItem, color: '#222', background: '#fff', border: '1px solid #eee' }}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    onDragOver={handleDragOver}
                  >
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={{ ...donorOverviewStyles.popupBtn, color: '#222', background: '#fff', border: '1px solid #ccc' }} onClick={() => setShowMergePopup(false)}>Cancel</button>
              <button style={{ ...donorOverviewStyles.popupBtn, background: '#2a6cff', color: '#fff', marginLeft: 12 }} onClick={handleMergeConfirm}>Merge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorOverview;

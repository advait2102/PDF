import React, { useRef, useState } from 'react';
import PdfTronViewer from './PdfTronViewer';

const dummyChildGrid = [
  { id: 2003671, document: 'Game of Thrones.pdf' },
  { id: 2003671, document: 'Auth.pdf' },
  { id: 2003671, document: 'Some record.pdf' },
];

const dummyMainGrid = [
  { Id: '2003671', type: '2-11', Received: '26-06-2025', Status: 'Reviewed', LastUpdate: '27-06-2025' },
  { Id: '2003672', type: 'T1', Received: '26-06-2025', Status: 'Reviewed', LastUpdate: '27-06-2025' },
  { Id: '2003673', type: '2-3', Received: '26-06-2025', Status: 'Reviewed', LastUpdate: '27-06-2025' },
  { Id: '2003674', type: '2-5', Received: '26-06-2025', Status: 'Reviewed', LastUpdate: '27-06-2025' },
  { Id: '2003675', type: '12-3', Received: '26-06-2025', Status: 'Reviewed', LastUpdate: '27-06-2025' },
];

const DonorOverview = () => {
  const [rowHeight, setRowHeight] = useState(260); 
  const isResizing = useRef(false);
  const [selectedDoc, setSelectedDoc] = useState(dummyChildGrid[0].document);

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
      const newHeight = Math.max(120, e.clientY - 80); 
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

  return (
    <div style={{ width: '100%', height: '100%', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      {/* First Row: 3 columns, resizable */}
      <div style={{ display: 'flex', width: '100%', minHeight: 120, height: rowHeight, transition: 'height 0.1s', background: '#fff', boxShadow: '0 2px 8px #0001', borderRadius: 8, margin: 24, marginBottom: 0, overflow: 'hidden' }}>
        {/* 1st col: Child grid */}
        <div style={{ flex: '0 0 30%', borderRight: '1px solid #eee', padding: 16, minWidth: 120, overflow: 'auto' }}>
          <table style={{ width: '100%', fontSize: 14, marginTop: 8, background: '#fff', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111' }}>
                <th style={{ textAlign: 'left', padding: 8, color: '#fff', fontWeight: 700 }}>#</th>
                <th style={{ textAlign: 'left', padding: 8, color: '#fff', fontWeight: 700 }}>Document</th>
              </tr>
            </thead>
            <tbody>
              {dummyChildGrid.map((row) => (
                <tr key={row.id} style={{ background: selectedDoc === row.document ? '#e3eafc' : '#fff', cursor: 'pointer' }} onClick={() => setSelectedDoc(row.document)}>
                  <td style={{ padding: 8, color: '#111' }}>{row.id}</td>
                  <td style={{ padding: 8, color: '#111' }}>{row.document}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 2nd col: Info */}
        <div style={{ flex: '0 0 20%', borderRight: '1px solid #eee', padding: 16, minWidth: 100, overflow: 'auto' }}>
          <h4 style={{ margin: 0, background: '#111', color: '#fff', fontWeight: 700, textAlign: 'left', padding: 8, borderRadius: 4 }}>Document Info</h4>
          <div style={{ margin: '8px 0', color: '#111', fontWeight: 500 }}>Donor ID: 2003671</div>
          <div style={{ margin: '8px 0', color: '#111', fontWeight: 500 }}>Name: {selectedDoc}</div>
          <div style={{ margin: '8px 0', color: '#111', fontWeight: 500 }}>Origin: Mail</div>
          <div style={{ margin: '8px 0', color: '#111', fontWeight: 500 }}>Created on: 26-06-2025</div>
            <div style={{ margin: '8px 0', color: '#111', fontWeight: 500 }}>Created by: sathish</div>
          <div style={{ margin: '8px 0', color: '#111', fontWeight: 500 }}>File Origin: XYZ Agency</div>
          <div style={{ margin: '8px 0', color: '#111', fontWeight: 500 }}>OCRed: No</div>
          <div style={{ margin: '8px 0', color: '#111', fontWeight: 500 }}>Total pages: 1500</div>
        </div>
        {/* 3rd col: PDFTron area */}
        <div style={{ flex: '0 0 50%', maxWidth: '50%', padding: 16, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: '320px', minHeight: 120, background: '#222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <PdfTronViewer fileUrl={'/files/Game of Thrones.pdf'} />
            </div>
          </div>
        </div>
      </div>
      {/* Row Resize Handle */}
      <div
        style={{ height: 8, cursor: 'row-resize', background: '#e0e0e0', width: 'calc(100% - 48px)', margin: '0 24px', borderRadius: 4, zIndex: 2 }}
        onMouseDown={handleMouseDown}
      />
      {/* Second Row: Full width/height grid, no heading */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', margin: 24, marginTop: 0, overflow: 'auto', padding: 24, minHeight: 120 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 0, background: '#fff' }}>
          <thead>
            <tr style={{ background: '#111' }}>
              <th style={{ padding: 12, border: '1px solid #e0e0e0', color: '#fff', fontWeight: 700 }}>Id</th>
              <th style={{ padding: 12, border: '1px solid #e0e0e0', color: '#fff', fontWeight: 700 }}>Type</th>
              <th style={{ padding: 12, border: '1px solid #e0e0e0', color: '#fff', fontWeight: 700 }}>Received</th>
              <th style={{ padding: 12, border: '1px solid #e0e0e0', color: '#fff', fontWeight: 700 }}>Status</th>
              <th style={{ padding: 12, border: '1px solid #e0e0e0', color: '#fff', fontWeight: 700 }}>LastUpdate</th>
            </tr>
          </thead>
          <tbody>
            {dummyMainGrid.map((row, idx) => (
              <tr key={idx}>
                <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#111' }}>{row.Id}</td>
                <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#111' }}>{row.type}</td>
                <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#111' }}>{row.Received}</td>
                <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#111' }}>{row.Status}</td>
                <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#111', fontWeight: 600 }}>{row.LastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorOverview;

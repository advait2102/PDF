import { useState } from 'react';
import './App.css'
import PdfTronViewer from './PdfTronViewer';
import DonorOverview from './DonorOverview';

const agencyFolders = [
  { name: 'Agency 1', locked: true, assigned: false, files: ['Game of Thrones.pdf'] },
  { name: 'Agency 2', locked: true, assigned: false, files: ['Game of Thrones.pdf'] },
  { name: 'Agency 4', locked: false, assigned: true, files: ['Game of Thrones.pdf'] },
  { name: 'Agency 5', locked: false, assigned: true, files: ['Game of Thrones.pdf'] },
];

function App() {
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [page, setPage] = useState('quality'); // 'quality' or 'donor-overview'

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header Banner */}
      <header style={{ width: '100%', background: '#1976d2', color: '#fff', padding: '16px 0', textAlign: 'center', fontSize: 28, fontWeight: 600, boxSizing: 'border-box' }}>
        Experion POC
      </header>
      {/* Menu Bar */}
      <nav style={{ width: '100%', background: '#1565c0', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', height: 48, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 32 }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
              padding: '0 8px',
              borderBottom: page === 'quality' ? '2px solid #fff' : 'none',
              fontWeight: 600
            }}
            onClick={() => setPage('quality')}
          >
            QA/QC
          </button>
          <button
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: '0 8px', borderBottom: page === 'donor-overview' ? '2px solid #fff' : 'none', fontWeight: 600 }}
            onClick={() => setPage('donor-overview')}
          >
            Donor Overview
          </button>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: '0 8px' }}>
            OCR
          </button>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: '0 8px' }}>
            Archived Donors
          </button>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: '0 8px' }}>
            Audit logs
          </button>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: '0 8px' }}>
            Track your files
          </button>
        </div>
      </nav>
      {/* Main Content */}
      {page === 'quality' ? (
        <div style={{ flex: 1, display: 'flex', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          {/* Left Column (20%) */}
          <aside style={{ width: '20%', background: '#f5f5f5', borderRight: '1px solid #e0e0e0', padding: 0, minWidth: 0, boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ padding: 16 }}>
              <h4 style={{ background: '#111', color: '#fff', fontWeight: 700, padding: 8, borderRadius: 4, margin: 0, marginBottom: 16 }}>Agencies</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {agencyFolders.map((agency, idx) => (
                  <li key={agency.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22, marginRight: 8 }}>📁</span>
                      <button
                        disabled={!agency.locked}
                        onClick={() => {
                          if (agency.locked) {
                            setSelectedAgency(idx);
                            setSelectedFile(null);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: agency.locked ? '#1976d2' : '#aaa',
                          fontWeight: 600,
                          fontSize: 16,
                          cursor: agency.locked ? 'pointer' : 'not-allowed',
                          textAlign: 'left',
                          padding: 0,
                          opacity: agency.locked ? 1 : 0.5
                        }}
                      >
                        {agency.name} {agency.locked ? '(locked for you)' : '(Assigned to different user)'}
                      </button>
                    </div>
                    {/* Tree view: show files as children if this agency is selected */}
                    {selectedAgency === idx && (
                      <ul style={{ listStyle: 'none', padding: '4px 0 4px 32px', margin: 0 }}>
                        {agency.files.map((file) => (
                          <li key={file}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 18 }}>📄</span>
                              <button
                                style={{
                                  background: selectedFile === file ? '#1976d2' : 'none',
                                  color: selectedFile === file ? '#fff' : '#1976d2',
                                  border: 'none',
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  borderRadius: 4,
                                  marginBottom: 2,
                                  fontWeight: selectedFile === file ? 600 : 400
                                }}
                                onClick={() => setSelectedFile(file)}
                              >
                                {file}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          {/* Right Column (80%) */}
          <main style={{ width: '80%', height: '100%', position: 'relative', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {selectedFile ? (
              <PdfTronViewer fileUrl={`/files/${selectedFile}`} />
            ) : (
              <div style={{ color: '#888', fontSize: 22, textAlign: 'center' }}>
                Select a folder and file from the left panel
              </div>
            )}
          </main>
        </div>
      ) : (
        <DonorOverview />
      )}
    </div>
  );
}

export default App;

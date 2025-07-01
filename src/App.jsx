import { useState } from 'react';
import './App.css'
import PdfTronViewer from './PdfTronViewer';
import DonorOverview from './DonorOverview';
import AuditLog from './AuditLog';
import MergePDF from './MergePDF';

const agencyFolders = [
  { name: 'Agency 1', locked: true, assigned: false, files: ['Black_Holes.pdf', 'Game of Thrones.pdf', 'Origin_of_Species.pdf', 'Special_Relativity.pdf'] },
  { name: 'Agency 2', locked: true, assigned: false, files: ['Black_Holes.pdf', 'Game of Thrones.pdf', 'Origin_of_Species.pdf', 'Special_Relativity.pdf'] },
];

function App() {
  const [selectedAgency, setSelectedAgency] = useState(null);
  // Store both agency index and file name for uniqueness
  const [selectedFile, setSelectedFile] = useState(null); // { agencyIdx, file } or null
  const [page, setPage] = useState('quality'); // 'quality', 'donor-overview', 'audit-log'

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header Banner */}
      <header style={{ width: '100%', background: '#1976d2', color: '#fff', padding: '16px 0', textAlign: 'center', fontSize: 28, fontWeight: 600, boxSizing: 'border-box' }}>
        Experion POC
      </header>
      {/* Menu Bar */}
      <nav style={{ width: '100%', background: '#1565c0', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', height: 48, boxSizing: 'border-box', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['QA/QC', 'Donor Overview', 'Audit logs', 'Merge PDFs'].map((label, idx) => (
            <button
              key={label}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 15,
                cursor: 'pointer',
                padding: '0 18px',
                borderBottom: (page === 'quality' && idx === 0) || (page === 'donor-overview' && idx === 1) || (page === 'audit-log' && idx === 2) || (page === 'merge-pdf' && idx === 3) ? '3px solid #2196f3' : '3px solid transparent',
                fontWeight: 500,
                height: 48,
                letterSpacing: 0.2,
                outline: 'none',
                transition: 'border-bottom 0.2s',
                fontFamily: 'Inter, Arial, sans-serif',
              }}
              onClick={() => {
                if (idx === 0) setPage('quality');
                if (idx === 1) setPage('donor-overview');
                if (idx === 2) setPage('audit-log');
                if (idx === 3) setPage('merge-pdf');
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
      {/* Main Content */}
      {page === 'quality' ? (
        <div style={{ flex: 1, display: 'flex', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          {/* Left Column (20%) */}
          <aside style={{ width: '20%', background: '#f5f5f5', borderRight: '1px solid #e0e0e0', padding: 0, minWidth: 0, boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ padding: 0 }}>
              <h4 style={{ background: '#222b36', color: '#fff', fontWeight: 600, fontSize: 13, letterSpacing: 0.2, padding: '18px 0 12px 24px', margin: 0, borderBottom: '1px solid #e0e0e0', fontFamily: 'Inter, Arial, sans-serif' }}>Agencies</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {agencyFolders.map((agency, idx) => (
                  <li key={agency.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20, marginRight: 8, color: agency.locked ? '#1976d2' : '#b0b0b0' }}>📁</span>
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
                          color: agency.locked ? '#222b36' : '#b0b0b0',
                          fontWeight: 500,
                          fontSize: 15,
                          cursor: agency.locked ? 'pointer' : 'not-allowed',
                          textAlign: 'left',
                          padding: '8px 0 8px 0',
                          width: '100%',
                          borderRadius: 0,
                          outline: 'none',
                          fontFamily: 'Inter, Arial, sans-serif',
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
                              <span style={{ fontSize: 16, color: '#1976d2' }}>📄</span>
                              <button
                                style={{
                                  background: selectedFile && selectedFile.agencyIdx === idx && selectedFile.file === file ? '#e3eafc' : 'none',
                                  color: selectedFile && selectedFile.agencyIdx === idx && selectedFile.file === file ? '#1976d2' : '#222b36',
                                  border: 'none',
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  borderRadius: 4,
                                  marginBottom: 2,
                                  fontWeight: selectedFile && selectedFile.agencyIdx === idx && selectedFile.file === file ? 600 : 400,
                                  fontFamily: 'Inter, Arial, sans-serif',
                                }}
                                onClick={() => setSelectedFile({ agencyIdx: idx, file })}
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
              <PdfTronViewer key={`${selectedFile.agencyIdx}-${selectedFile.file}`} fileUrl={`/files/${selectedFile.file}`} />
            ) : (
              <div style={{ color: '#888', fontSize: 22, textAlign: 'center' }}>
                Select a folder and file from the left panel
              </div>
            )}
          </main>
        </div>
      ) : page === 'donor-overview' ? (
        <DonorOverview />
      ) : page === 'audit-log' ? (
        <AuditLog />
      ) : page === 'merge-pdf' ? (
        <MergePDF />
      ) : null}
    </div>
  );
}

export default App;

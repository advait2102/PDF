import React, { useRef, useState, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import { Pointer } from 'lucide-react';

const MergePDF = () => {
  const viewer = useRef(null);
  const coreRef = useRef(null);
  const [coreReady, setCoreReady] = useState(false);
  const [files, setFiles] = useState([null, null, null, null]);
  const [merging, setMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState(null);
  const [error, setError] = useState('');

  // Initialize WebViewer/Core only once
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey: 'demo:1751037981820:61ad8ba0030000000018b23224b9e0b3b01ad516b33cc8703ca455215c',
      },
      viewer.current
    ).then(instance => {
      const { Core } = instance;
      // Set worker path to the pdf subfolder as per Apryse docs
      if (Core && Core.setPDFWorkerPath) {
        Core.setPDFWorkerPath('/webviewer/lib/core/pdf');
      }
      coreRef.current = Core;
      setCoreReady(true);
    }).catch(e => {
      setError('Failed to load PDFTron Core: ' + (e.message || e));
    });
  }, []);

  // Handle file selection for each input
  const handleFileChange = (idx, file) => {
    const newFiles = [...files];
    newFiles[idx] = file;
    setFiles(newFiles);
    setMergedUrl(null);
    setError('');
  };

  // Merge PDFs using Apryse Core API (browser-only)
  const handleMerge = async () => {
    setError('');
    const selectedFiles = files.filter(f => f);
    if (selectedFiles.length < 2) return setError('Select at least two PDF files to merge.');
    setMerging(true);
    setMergedUrl(null);
    try {
      const Core = coreRef.current;
      if (!Core) throw new Error('PDFTron Core not loaded yet.');
      // Load all documents in parallel, specifying extension for File objects
      const docs = await Promise.all(selectedFiles.map(async (f, i) => {
        try {
          return await Core.createDocument(f, { extension: 'pdf' });
        } catch (e) {
          throw new Error('Failed to load file #' + (i+1) + ': ' + (e.message || e));
        }
      }));
      let mergedDoc = docs[0];
      for (let i = 1; i < docs.length; i++) {
        const docToInsert = docs[i];
        const pageCount = await docToInsert.getPageCount();
        const pages = Array.from({ length: pageCount }, (_, k) => k + 1);
        await mergedDoc.insertPages(docToInsert, pages, mergedDoc.getPageCount() + 1);
      }
      // Get the merged file as a blob
      const fileData = await mergedDoc.getFileData({
        downloadType: 'blob',
      });
      // Wrap fileData in a Blob for createObjectURL
      setMergedUrl(URL.createObjectURL(new Blob([fileData], { type: 'application/pdf' })));
      setMerging(false);
    } catch (err) {
      setError('Merge failed: ' + (err.message || err));
      setMerging(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h2>Merge up to 4 PDF Files</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {[0, 1, 2, 3].map(idx => (
        <div key={idx} style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500 }}>File {idx + 1}: </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={e => handleFileChange(idx, e.target.files[0] || null)}
            disabled={!coreReady || merging}
            className=" cursor-pointer
                        block w-full text-sm text-gray-500
                        file:cursor-pointer
                        file:me-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-700
                        file:disabled:opacity-50 file:disabled:pointer-events-none
                        dark:text-neutral-500
                        dark:file:bg-blue-500
                        dark:hover:file:bg-blue-400
                      "
          />
          {files[idx] && <span style={{ marginLeft: 8, color: '#1976d2' }}>{files[idx].name}</span>}
        </div>
      ))}
      <div style={{ margin: '16px 0' }}>
        <button onClick={handleMerge} disabled={merging || files.filter(f => f).length < 2 || !coreReady}>
          {merging ? 'Merging...' : 'Merge PDFs'}
        </button>
      </div>
      {mergedUrl && (
        <div>
          <a href={mergedUrl} download="merged.pdf">Download Merged PDF</a>
        </div>
      )}
      <div ref={viewer} style={{ display: 'none' }} />
    </div>
  );
};

export default MergePDF;

import React, { useRef, useState } from 'react';
import PdfTronViewer from './PdfTronViewer';
import { dummyMainGrid, dummyChildGrid } from './model/donoroverview';
import WebViewer from '@pdftron/webviewer';
import { Settings, ArrowDownUp } from 'lucide-react';

const childGrid = dummyChildGrid;

const DonorOverview = () => {
  const [rowHeight, setRowHeight] = useState(200);
  const isResizing = useRef(false);
  const [selectedDoc, setSelectedDoc] = useState(childGrid[0].document);
  const [showMenu, setShowMenu] = useState(false);
  const [showMergePopup, setShowMergePopup] = useState(false);
  const [mergedFileName, setMergedFileName] = useState('Merged.pdf');
  const [mergeOrder, setMergeOrder] = useState([...childGrid.map(f => f.document)]);
  const [mergedFile, setMergedFile] = useState(null);
  const [mergedUrl, setMergedUrl] = useState(null);
  const coreRef = useRef(null);
  const [coreReady, setCoreReady] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');
  const webviewerDiv = useRef(null);
  const menuRef = useRef(null);


  React.useLayoutEffect(() => {
    if (coreRef.current) {
      coreRef.current.dispose();
      coreRef.current = null;
    }
    if (!webviewerDiv.current) return;

    WebViewer({
      path: '/webviewer/lib',
      licenseKey: 'demo:fkjehuiyrhkjnb',
    }, webviewerDiv.current).then(instance => {
      const { Core } = instance;
      if (Core?.setPDFWorkerPath) {
        Core.setPDFWorkerPath('/webviewer/lib/core/pdf');
      }
      coreRef.current = Core;
      setCoreReady(true);
    }).catch(console.error);

    return () => {
      coreRef.current?.dispose?.();
      coreRef.current = null;
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
      setRowHeight(Math.max(100, e.clientY - 80));
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
  React.useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleDragOver = (e) => e.preventDefault();

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

      const docs = await Promise.all(mergeOrder.map((file, i) => Core.createDocument(`/files/${file}`, { extension: 'pdf' })));
      let mergedDoc = docs[0];
      for (let i = 1; i < docs.length; i++) {
        const docToInsert = docs[i];
        const pageCount = await docToInsert.getPageCount();
        const pages = Array.from({ length: pageCount }, (_, k) => k + 1);
        await mergedDoc.insertPages(docToInsert, pages, mergedDoc.getPageCount() + 1);
      }

      let data = await mergedDoc.getFileData({ downloadType: 'blob', fileType: 'pdf' });
      if (data instanceof ArrayBuffer) data = new Uint8Array(data);
      const blob = new Blob([data.buffer || data], { type: 'application/pdf' });
      setMergedUrl(URL.createObjectURL(blob));
    } catch (e) {
      setMergeError(e.message || String(e));
    } finally {
      setMerging(false);
    }
  };

  const filesToShow = mergedFile ? [{ id: 2003671, document: mergedFile, Type: 'T1' }, ...childGrid] : childGrid;

  return (
    <div className="w-full h-screen flex">
      <div ref={webviewerDiv} className="hidden" />

      <div className="w-1/2 h-full flex flex-col">
        <div style={{ height: rowHeight }} className="overflow-y-auto p-4">
          <div className="flex space-x-60 items-center mb-2">
            <span className="font-bold text-lg mb-2">Documents Available for 2003671</span>
            <div className="relative inline-block text-left" ref={menuRef}>
              <button
                onClick={() => setShowMenu(v => !v)}
                className="text-gray-800 text-xl p-2 hover:bg-gray-100 rounded"
              >
                <Settings />
              </button>

              {showMenu && (
                <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg border text-sm">
                  <div
                    className="px-4 py-2 cursor-pointer hover:bg-sky-100 rounded"
                    onClick={handleMerge}
                  >
                    Merge
                  </div>
                </div>
              )}
            </div>
          </div>
          <table className="w-full text-left border border-gray-200">
            <thead className="bg-gray-100">
              <tr><th className="px-2 py-1">Id</th><th className="px-2 py-1">Document</th><th className="px-2 py-1">Type</th></tr>
            </thead>
            <tbody>
              {filesToShow.map(row => (
                <tr key={row.id + row.document} onClick={() => setSelectedDoc(row.document)} className={`cursor-pointer ${selectedDoc === row.document ? 'bg-blue-100' : ''}`}>
                  <td className="px-2 py-1">{row.id}</td>
                  <td className="px-2 py-1">{row.document}</td>
                  <td className="px-2 py-1">{row.Type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div onMouseDown={handleMouseDown} className="h-2 bg-gray-300 cursor-row-resize" />
        <div className="flex-grow overflow-y-auto p-4">
          <div className="font-bold text-lg mb-2">Donor Overview</div>
          <table className="w-full text-left border border-gray-200">
            <thead className="bg-gray-100">
              <tr><th className="px-2 py-1">Id</th><th className="px-2 py-1">Created by</th><th className="px-2 py-1">Received</th><th className="px-2 py-1">Status</th><th className="px-2 py-1">Last Update</th></tr>
            </thead>
            <tbody>
              {dummyMainGrid.map((row, idx) => (
                <tr key={idx} >
                  <td className="px-2 py-1">{row.Id}</td>
                  <td className="px-2 py-1">{row.Createdby}</td>
                  <td className="px-2 py-1">{row.Received}</td>
                  <td className="px-2 py-1">{row.Status}</td>
                  <td className="px-2 py-1 font-semibold">{row.LastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-1/2 h-full">
        <div className="w-full h-full relative">
          {selectedDoc && !document.querySelector('.webviewer') && (
            <PdfTronViewer fileUrl={`/files/${selectedDoc}`} containerStyle={{ width: '100%', height: '100%' }} />
          )}
        </div>
      </div>

      {showMergePopup && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <div className="text-lg font-semibold mb-4">Merge Documents</div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Merged File Name:</label>
            <input value={mergedFileName} onChange={e => setMergedFileName(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full mb-4" />
            <label className="text-sm font-medium text-gray-700 block mb-1">Order Files (drag to reorder):</label>
            <ul className="border border-gray-200 rounded mb-4">
              {mergeOrder.map((doc, idx) => (
                <li key={doc} className="flex justify-between items-center px-3 py-2 border-b last:border-b-0" draggable onDragStart={e => handleDragStart(e, idx)} onDragOver={handleDragOver} onDrop={e => handleDrop(e, idx)}>
                  <span className="text-gray-800 font-medium">{doc}</span>
                  <span className="cursor-move"><ArrowDownUp /> </span>
                </li>
              ))}
            </ul>
            {mergeError && <div className="text-red-500 mb-4">Error: {mergeError}</div>}
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowMergePopup(false)} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-sky-300">Close</button>
              <button onClick={handleMergeConfirm} disabled={!coreReady || merging} className={`px-4 py-2 text-white rounded ${coreReady && !merging ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'}`}>
                {coreReady ? (merging ? 'Merging...' : 'Merge & Download') : 'Loading...'}
              </button>
            </div>
            {mergedUrl && (
              <div className="mt-4">
                <a href={mergedUrl} download={mergedFileName.endsWith('.pdf') ? mergedFileName : `${mergedFileName}.pdf`} className="text-blue-600 underline">Download Merged PDF</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorOverview;
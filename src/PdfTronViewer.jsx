import React from "react";
import WebViewer from "@pdftron/webviewer";
import { useEffect, useRef } from "react";

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
    )
  }, [fileUrl]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <div ref={viewer} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default PdfTronViewer;

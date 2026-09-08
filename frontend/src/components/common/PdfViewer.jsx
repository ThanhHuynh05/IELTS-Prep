import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Highlighter, Eraser } from 'lucide-react';

// Configure the worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);
  const pageRef = useRef(null);
  const [highlights, setHighlights] = useState({});
  const [activeTool, setActiveTool] = useState(null); // 'highlight', 'eraser', or null

  const handleSelection = () => {
    if (!activeTool) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    if (!pageRef.current) return;

    const pageRect = pageRef.current.getBoundingClientRect();
    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects());

    const relativeRects = rects.map(r => ({
      top: (r.top - pageRect.top) / scale,
      left: (r.left - pageRect.left) / scale,
      width: r.width / scale,
      height: r.height / scale
    })).filter(r => r.width > 0 && r.height > 0);

    if (relativeRects.length === 0) return;

    if (activeTool === 'highlight') {
      setHighlights(prev => ({
        ...prev,
        [pageNumber]: [...(prev[pageNumber] || []), relativeRects]
      }));
    } else if (activeTool === 'eraser') {
      setHighlights(prev => {
        const pageHighlights = prev[pageNumber] || [];
        const remainingHighlights = pageHighlights.filter(group => {
          const overlaps = group.some(hRect => 
            relativeRects.some(eRect => 
              !(hRect.left > eRect.left + eRect.width || 
                hRect.left + hRect.width < eRect.left || 
                hRect.top > eRect.top + eRect.height ||
                hRect.top + hRect.height < eRect.top)
            )
          );
          return !overlaps;
        });
        return {
          ...prev,
          [pageNumber]: remainingHighlights
        };
      });
    }

    selection.removeAllRanges();
  };
  

  // Resize observer to auto-fit the PDF to the container width initially
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  
  const nextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  const prevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));

  if (!fileUrl) return null;

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevPage}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[4rem] text-center">
            {pageNumber} / {numPages || '-'}
          </span>
          <button 
            onClick={nextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition-colors"
            title="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTool(prev => prev === 'highlight' ? null : 'highlight')}
            className={`p-1.5 rounded-md transition-colors ${activeTool === 'highlight' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            title="Highlight Text"
          >
            <Highlighter size={20} />
          </button>
          <button
            onClick={() => setActiveTool(prev => prev === 'eraser' ? null : 'eraser')}
            className={`p-1.5 rounded-md transition-colors ${activeTool === 'eraser' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            title="Eraser Tool"
          >
            <Eraser size={20} />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          <button 
            onClick={zoomOut}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-xs font-medium text-gray-500 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={zoomIn}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* PDF Document Viewer */}
      <div 
        ref={containerRef} 
        onMouseUp={handleSelection}
        onTouchEnd={handleSelection}
        className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-950 flex justify-center p-4 relative"
        style={{ minHeight: '400px' }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Loading PDF...
            </div>
          }
          error={
            <div className="absolute inset-0 flex items-center justify-center text-red-500">
              Failed to load PDF.
            </div>
          }
          className={`flex flex-col items-center max-w-full ${activeTool ? 'cursor-text' : ''}`}
        >
          {containerWidth && (
            <Page
              inputRef={pageRef}
              pageNumber={pageNumber}
              scale={scale}
              width={containerWidth}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg bg-white relative"
            >
              {highlights[pageNumber]?.map((group, i) => (
                <div key={i}>
                  {group.map((rect, j) => (
                    <div 
                      key={`${i}-${j}`}
                      className="absolute bg-yellow-300 dark:bg-yellow-500 opacity-40 mix-blend-multiply pointer-events-none z-10"
                      style={{
                        top: rect.top * scale,
                        left: rect.left * scale,
                        width: rect.width * scale,
                        height: rect.height * scale
                      }}
                    />
                  ))}
                </div>
              ))}
            </Page>
          )}
        </Document>
      </div>
    </div>
  );
}

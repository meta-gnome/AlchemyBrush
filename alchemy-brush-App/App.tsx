
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas, type CanvasHandle } from './components/Canvas';
import type { BrushSettings, ShapeGroup, ActiveShapeGroups } from './types';
import { DEFAULT_SHAPES } from './constants';
import { v4 as uuidv4 } from 'uuid';


const App: React.FC = () => {
  const [settings, setSettings] = useState<BrushSettings>({
    color: '#FFFFFF',
    size: 50,
    opacity: 0.5,
  });
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [shapeGroups, setShapeGroups] = useState<ShapeGroup[]>(DEFAULT_SHAPES);
  
  const initialActiveGroups = DEFAULT_SHAPES.reduce((acc, group) => {
    acc[group.name] = true;
    return acc;
  }, {} as ActiveShapeGroups);

  const [activeShapeGroups, setActiveShapeGroups] = useState<ActiveShapeGroups>(initialActiveGroups);

  const canvasRef = useRef<CanvasHandle>(null);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
  }, []);

  const handleDownload = useCallback(() => {
    canvasRef.current?.download();
  }, []);

  const handleSvgUpload = (files: FileList | null) => {
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then(svgStrings => {
      const newShapes = svgStrings.map(svg => ({ svg, id: uuidv4() }));
      
      setShapeGroups(prevGroups => {
        const existingUploadGroup = prevGroups.find(g => g.name === 'Uploaded');
        if (existingUploadGroup) {
          return prevGroups.map(g => 
            g.name === 'Uploaded' 
              ? { ...g, shapes: [...g.shapes, ...newShapes] }
              : g
          );
        } else {
          return [...prevGroups, { name: 'Uploaded', shapes: newShapes }];
        }
      });

      // Automatically activate the new 'Uploaded' group
      setActiveShapeGroups(prev => ({ ...prev, 'Uploaded': true }));
    });
  };
  
  const activeShapes = useMemo(() => {
    return shapeGroups
      .filter(group => activeShapeGroups[group.name])
      .flatMap(group => group.shapes.map(shape => shape.svg));
  }, [shapeGroups, activeShapeGroups]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-900">
      <main className="flex-grow relative order-2 md:order-1">
        <Canvas 
          settings={settings} 
          isMirrored={isMirrored} 
          activeShapes={activeShapes}
          ref={canvasRef} 
        />
      </main>
      <aside className="w-full md:w-72 bg-gray-800 shadow-lg p-4 order-1 md:order-2">
        <Toolbar
          settings={settings}
          setSettings={setSettings}
          isMirrored={isMirrored}
          setIsMirrored={setIsMirrored}
          onClear={handleClear}
          onDownload={handleDownload}
          shapeGroups={shapeGroups}
          activeShapeGroups={activeShapeGroups}
          setActiveShapeGroups={setActiveShapeGroups}
          onSvgUpload={handleSvgUpload}
        />
      </aside>
    </div>
  );
};

// Simple polyfill for uuid
const v4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default App;

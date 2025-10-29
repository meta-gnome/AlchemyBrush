
import React, { useRef } from 'react';
import type { BrushSettings, ShapeGroup, ActiveShapeGroups } from '../types';
import { BrushIcon, MirrorIcon, TrashIcon, DownloadIcon, UploadIcon } from './Icons';

interface ToolbarProps {
  settings: BrushSettings;
  setSettings: React.Dispatch<React.SetStateAction<BrushSettings>>;
  isMirrored: boolean;
  setIsMirrored: React.Dispatch<React.SetStateAction<boolean>>;
  onClear: () => void;
  onDownload: () => void;
  shapeGroups: ShapeGroup[];
  activeShapeGroups: ActiveShapeGroups;
  setActiveShapeGroups: React.Dispatch<React.SetStateAction<ActiveShapeGroups>>;
  onSvgUpload: (files: FileList | null) => void;
}

const ControlGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-400 mb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const LabeledSlider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, min, max, step, onChange }) => (
  <div>
    <div className="flex justify-between items-center text-gray-300 text-sm">
      <label>{label}</label>
      <span>{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

export const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  setSettings,
  isMirrored,
  setIsMirrored,
  onClear,
  onDownload,
  shapeGroups,
  activeShapeGroups,
  setActiveShapeGroups,
  onSvgUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, color: e.target.value }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleGroupToggle = (groupName: string) => {
    setActiveShapeGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-white mb-6">Alchemy Brush</h2>
      
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <ControlGroup title="Brush">
          <div className="flex items-center space-x-3">
            <BrushIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <label className="relative w-full h-10 cursor-pointer">
              <div 
                className="absolute inset-0 rounded-md border-2 border-gray-600"
                style={{ backgroundColor: settings.color }}
              ></div>
              <input 
                type="color" 
                value={settings.color}
                onChange={handleColorChange}
                className="absolute inset-0 w-full h-full opacity-0"
              />
            </label>
          </div>

          <LabeledSlider
            label="Size"
            value={settings.size}
            min={1}
            max={300}
            step={1}
            onChange={(e) => setSettings(prev => ({ ...prev, size: Number(e.target.value) }))}
          />

          <LabeledSlider
            label="Opacity"
            value={settings.opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(e) => setSettings(prev => ({ ...prev, opacity: Number(e.target.value) }))}
          />
        </ControlGroup>
        
        <ControlGroup title="Shapes">
          {shapeGroups.map(group => (
            <div key={group.name}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!activeShapeGroups[group.name]}
                  onChange={() => handleGroupToggle(group.name)}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <span className="text-gray-300">{group.name}</span>
              </label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {group.shapes.slice(0, 4).map(shape => (
                  <div key={shape.id} className="p-1 bg-gray-700 rounded-md aspect-square flex items-center justify-center">
                    <img 
                      className="w-full h-full"
                      src={`data:image/svg+xml;base64,${btoa(shape.svg.replace(/currentColor/g, 'white'))}`} 
                      alt="Shape preview"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
           <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".svg,image/svg+xml"
              onChange={(e) => onSvgUpload(e.target.files)}
              className="hidden"
            />
          <button
            onClick={handleUploadClick}
            className="w-full flex items-center justify-center p-2 rounded-md transition-colors duration-200 bg-gray-700 hover:bg-cyan-600 text-gray-300 hover:text-white"
          >
            <UploadIcon className="w-5 h-5 mr-2" />
            <span>Upload SVGs</span>
          </button>
        </ControlGroup>

        <ControlGroup title="Symmetry">
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`w-full flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
              isMirrored ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <MirrorIcon className="w-5 h-5 mr-2" />
            <span>Mirror Drawing</span>
          </button>
        </ControlGroup>

        <ControlGroup title="Actions">
          <button
            onClick={onClear}
            className="w-full flex items-center justify-center p-2 rounded-md transition-colors duration-200 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            <span>Clear Canvas</span>
          </button>
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center p-2 rounded-md transition-colors duration-200 bg-gray-700 hover:bg-green-600 text-gray-300 hover:text-white"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            <span>Download</span>
          </button>
        </ControlGroup>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* bg-gray-700 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563; /* bg-gray-600 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* bg-gray-500 */
        }
      `}</style>
    </div>
  );
};

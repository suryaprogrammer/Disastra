import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ImageUploadProps {
  onAnalyze: (file: File) => Promise<void>;
  isAnalyzing?: boolean;
  acceptedTypes?: string;
  maxSizeMb?: number;
  title?: string;
  description?: string;
  disclaimerText?: string;
}

export type AnalysisStep = 
  | 'idle'
  | 'preparing'
  | 'analyzing'
  | 'evaluating'
  | 'completing';

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onAnalyze,
  isAnalyzing = false,
  acceptedTypes = 'image/jpeg,image/png,image/webp,image/tiff',
  maxSizeMb = 15,
  title = 'Upload Satellite or Aerial Imagery',
  description = 'Drag and drop high-resolution geotiff or satellite sensor tiles (Max 15MB)',
  disclaimerText,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file format. Please provide a supported imagery file.');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMsg(`File size exceeds the ${maxSizeMb}MB maximum limit.`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMsg(null);
    setCurrentStep('idle');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setCurrentStep('preparing');
    
    // Slight delay for UX
    await new Promise(r => setTimeout(r, 400));
    setCurrentStep('analyzing');
    
    try {
      await onAnalyze(selectedFile);
      // If successful, show completion steps
      setCurrentStep('evaluating');
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep('completing');
    } catch (err) {
      setCurrentStep('idle');
      setErrorMsg(err instanceof Error ? err.message : 'Unable to analyze image. Make sure the Disastra analysis server is running and try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <span>{title}</span>
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-mono font-medium text-emerald-700 border border-emerald-200">
            Live Analysis
          </span>
        </h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      {disclaimerText && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
          <div className="font-semibold flex items-center gap-1.5 text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>MODEL STATUS NOTICE</span>
          </div>
          <p className="mt-0.5 text-[11px] text-amber-700">{disclaimerText}</p>
        </div>
      )}

      {/* Main Upload Dropzone or Preview */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/30'
              : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload imagery file dropzone"
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleChange}
            className="hidden"
          />
          <div className="rounded-full bg-slate-100 p-3 text-slate-600 mb-3">
            <Upload className="h-6 w-6 text-slate-700" />
          </div>
          <p className="text-sm font-medium text-slate-900">
            Click to upload or drag & drop satellite tile
          </p>
          <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP or GeoTIFF up to {maxSizeMb}MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Selected Card */}
          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-4">
              {previewUrl && (
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-900">
                  <img
                    src={previewUrl}
                    alt="Selected preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                </div>
                <p className="mt-1 text-xs font-mono text-slate-500">
                  Size: {formatFileSize(selectedFile.size)} · Status: Ready for Visual Analysis
                </p>

                <div className="mt-3 flex items-center gap-3">
                  {currentStep === 'idle' ? (
                    <button
                      type="button"
                      onClick={handleStartAnalysis}
                      className="cursor-pointer rounded bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
                    >
                      Run AI Analysis
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      <span>Pipeline Active...</span>
                    </div>
                  )}

                  {currentStep === 'idle' && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="cursor-pointer text-xs text-slate-500 hover:text-rose-600 underline"
                    >
                      Remove File
                    </button>
                  )}
                </div>
              </div>

              {currentStep === 'idle' && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Remove selected image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Simulated Loading Sequence Stepper */}
          {currentStep !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900 border-b border-emerald-200/60 pb-2">
                <span>AI PIPELINE STATUS</span>
                <span className="font-mono text-[11px] text-emerald-700">PROCESSING</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className={`flex items-center gap-2 ${currentStep === 'preparing' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                  {currentStep !== 'preparing' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  )}
                  <span>1. Preparing image & checking resolution GSD...</span>
                </div>

                <div className={`flex items-center gap-2 ${currentStep === 'analyzing' ? 'text-slate-900 font-bold' : currentStep === 'evaluating' || currentStep === 'completing' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {currentStep === 'evaluating' || currentStep === 'completing' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : currentStep === 'analyzing' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-300" />
                  )}
                  <span>2. Analyzing visual data & segmenting features...</span>
                </div>

                <div className={`flex items-center gap-2 ${currentStep === 'evaluating' ? 'text-slate-900 font-bold' : currentStep === 'completing' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {currentStep === 'completing' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : currentStep === 'evaluating' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-300" />
                  )}
                  <span>3. Evaluating disaster indicators & risk severity...</span>
                </div>

                <div className={`flex items-center gap-2 ${currentStep === 'completing' ? 'text-emerald-800 font-bold' : 'text-slate-400'}`}>
                  {currentStep === 'completing' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-300" />
                  )}
                  <span>4. Preparing risk assessment results...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 text-xs text-rose-600 font-medium flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

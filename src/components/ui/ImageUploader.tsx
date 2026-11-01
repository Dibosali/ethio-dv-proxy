"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ZoomIn,
  Maximize2,
} from "lucide-react";
import { getNestedError } from "./FormInput";

export interface ImageUploaderProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  aspectRatioLabel?: string;
  maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  name,
  label = "Applicant Photograph",
  description,
  required,
  disabled,
  className,
  aspectRatioLabel = "Square (600x600 px recommended)",
  maxSizeMB = 5,
}) => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    sizeKB: number;
    name: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const watchedValue = watch(name);

  // Sync existing value from form state if initialized externally
  useEffect(() => {
    if (watchedValue instanceof File && watchedValue !== localFile) {
      updateFilePreview(watchedValue);
    }
  }, [watchedValue, localFile]);

  const errorMessage = getNestedError(errors, name);
  const uploaderId = `uploader-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const errorId = `${uploaderId}-error`;

  // Safely manage and revoke URL.createObjectURL previews
  const updateFilePreview = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
      setLocalFile(file);
      setFileDetails({
        name: file.name,
        sizeKB: Math.round(file.size / 1024),
      });
      setValue(name, file, { shouldValidate: true, shouldDirty: true });
    } else {
      setPreviewUrl(null);
      setLocalFile(null);
      setFileDetails(null);
      setValue(name, null, { shouldValidate: true, shouldDirty: true });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle ESC key and scroll locking when full page modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFilePreview(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      updateFilePreview(file);
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div>
            {label && (
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <span className="inline-flex items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {label}
                    {required && (
                      <span className="ml-1 text-red-500 font-bold" aria-hidden="true">
                        *
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    {aspectRatioLabel}
                  </span>
                </div>
              )}

              {description && !errorMessage && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                  {description}
                </p>
              )}

              {previewUrl && localFile ? (
                // Bigger Image Preview Card with Click-to-Zoom
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Enlarged Thumbnail (h-48 w-48 on mobile, h-56 w-56 on desktop) */}
                    <div
                      onClick={() => setIsModalOpen(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsModalOpen(true);
                        }
                      }}
                      className="group/preview relative h-48 w-48 sm:h-56 sm:w-56 shrink-0 cursor-zoom-in overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-md transition-all hover:border-blue-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Click to view in full page (በሙሉ ገጽ ለማየት ይጫኑ)"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Photo preview"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/preview:scale-105"
                      />

                      {/* Hover Overlay with Zoom Icon */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/45 p-2 text-white opacity-0 backdrop-blur-2xs transition-opacity group-hover/preview:opacity-100">
                        <ZoomIn className="h-7 w-7 text-white drop-shadow-md stroke-[2.5]" />
                        <span className="text-xs font-bold text-center drop-shadow-md">
                          Click for full page
                        </span>
                        <span className="text-[11px] font-medium text-white/95 font-sans drop-shadow-md">
                          (ሙሉ መጠን ይመልከቱ)
                        </span>
                      </div>

                      {/* Corner Badge */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-xs">
                        <Maximize2 className="h-3 w-3" />
                        <span>Click to expand</span>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Photo Uploaded (ፎቶ ተጭኗል)</span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm">
                          {fileDetails?.name}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          File size: <strong>{fileDetails?.sizeKB} KB</strong> (Max {maxSizeMB}MB)
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Tip: Click the picture above to preview it in full page.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Replace Photo (ፎቶ ይቀይሩ)</span>
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => updateFilePreview(null)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/40 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 shadow-2xs hover:bg-red-100 dark:hover:bg-red-900/60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Remove (ያስወግዱ)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Dropzone Zone
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !disabled && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !disabled) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={cn(
                    "group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    isDragging
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]"
                      : errorMessage
                      ? "border-red-400 bg-red-50/20 dark:bg-red-950/20 hover:bg-red-50/40"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/60 dark:hover:bg-slate-800/60",
                    disabled && "cursor-not-allowed opacity-50 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    {isDragging ? (
                      <UploadCloud className="h-7 w-7 animate-bounce" />
                    ) : (
                      <ImageIcon className="h-7 w-7" />
                    )}
                  </div>

                  <div className="mt-3.5 space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        Click to upload
                      </span>{" "}
                      or drag and drop (ፎቶ ለመጫን እዚህ ይጫኑ)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      JPEG, PNG, or WebP (Max {maxSizeMB}MB)
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                      Standard DV specs: Square format, neutral light background, recent 6 months
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                id={uploaderId}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={disabled}
                onChange={handleFileChange}
                className="hidden"
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? errorId : undefined}
              />

              {/* Full Page Modal / Lightbox with Exit "X" Button */}
              {isModalOpen && previewUrl && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-fadeIn"
                  onClick={() => setIsModalOpen(false)}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Full size photograph preview"
                >
                  {/* Exit Close Button X (Top Right) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(false);
                    }}
                    className="fixed top-5 right-5 z-60 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white shadow-xl backdrop-blur-md transition-all hover:bg-white/35 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white active:scale-95 cursor-pointer"
                    aria-label="Close full page view (ውጣ)"
                    title="Exit (X) / ዝጋ"
                  >
                    <X className="h-7 w-7 stroke-[2.5]" />
                  </button>

                  {/* Centered Modal Content Container */}
                  <div
                    className="relative flex flex-col items-center gap-4 max-h-[92vh] max-w-[92vw]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Full size photograph preview"
                        className="max-h-[82vh] max-w-[88vw] object-contain rounded-2xl select-none"
                      />
                    </div>

                    <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs text-white/90 shadow-lg backdrop-blur-md">
                      <span className="font-bold">{fileDetails?.name}</span>
                      <span className="text-white/40">•</span>
                      <span>{fileDetails?.sizeKB} KB</span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/80 font-medium">
                        Click X or press ESC to exit (ለመውጣት X ይጫኑ)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        />

      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 animate-fadeIn"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
};

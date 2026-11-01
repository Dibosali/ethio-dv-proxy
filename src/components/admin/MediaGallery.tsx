"use client";

import React, { useState } from "react";
import { SubmissionSummary } from "@/types/admin";
import {
  downloadImageFile,
  downloadAllPhotos,
  getSubmissionMediaList,
  MediaPhotoItem,
} from "@/lib/utils/download";
import {
  Download,
  Check,
  Image as ImageIcon,
  Maximize2,
  X,
  FileCheck2,
  Sparkles,
  Camera,
  Layers,
  User,
  Heart,
  Baby,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaGalleryProps {
  submission: SubmissionSummary;
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  submission,
  className,
}) => {
  const mediaList = getSubmissionMediaList(submission);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadAllSuccess, setDownloadAllSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaPhotoItem | null>(
    null
  );

  // Single photo download handler
  const handleSingleDownload = async (item: MediaPhotoItem) => {
    try {
      setDownloadingId(item.id);
      await downloadImageFile(item.url, item.filename);
      setTimeout(() => setDownloadingId(null), 1500);
    } catch (err) {
      console.error("Failed to download photo:", err);
      setDownloadingId(null);
    }
  };

  // Batch download handler
  const handleDownloadAll = async () => {
    if (mediaList.length === 0) return;
    try {
      setIsDownloadingAll(true);
      await downloadAllPhotos(mediaList);
      setIsDownloadingAll(false);
      setDownloadAllSuccess(true);
      setTimeout(() => setDownloadAllSuccess(false), 3500);
    } catch (err) {
      console.error("Batch download error:", err);
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-xl w-full rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-bold text-white text-sm block">
                  {selectedPhoto.personName}
                </span>
                <span className="text-xs text-blue-400 font-medium">
                  {selectedPhoto.roleLabel} • {selectedPhoto.filename}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-center p-2">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.personName}
                className="max-h-[60vh] w-auto rounded-2xl border border-slate-800 object-contain shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                {selectedPhoto.specs}
              </span>

              <button
                type="button"
                onClick={() => handleSingleDownload(selectedPhoto)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download This Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Section Header & Top Download All Button */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Submitted Media & Photo Gallery
                </h3>
                <span className="rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 text-xs font-bold font-mono">
                  {mediaList.length}{" "}
                  {mediaList.length === 1 ? "Photo" : "Photos"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official biometric passport photographs submitted for the primary entrant and derivatives.
              </p>
            </div>
          </div>

          {/* Top "Download All" Action Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={isDownloadingAll || mediaList.length === 0}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md focus:outline-none select-none cursor-pointer",
                downloadAllSuccess
                  ? "bg-emerald-600 text-white shadow-emerald-600/25"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/25 active:scale-[0.98] disabled:opacity-50"
              )}
              title="Download all photographs with formatted filenames"
            >
              {downloadAllSuccess ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>All Photos Downloaded!</span>
                </>
              ) : isDownloadingAll ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Saving Files...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download All Photos ({mediaList.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informational Subtext */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <span>Standard:</span>
            <strong className="text-slate-800 dark:text-slate-200">
              600x600 px • Neutral background • No spectacles/headwear
            </strong>
          </span>
          <span className="hidden md:inline text-slate-400 dark:text-slate-500">
            Filenames auto-formatted for Department of State filing
          </span>
        </div>

        {/* Photo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {mediaList.map((item) => {
            const isDownloading = downloadingId === item.id;

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-lg flex flex-col justify-between space-y-4"
              >
                {/* Photo Header Pill */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border",
                      item.role === "PRIMARY"
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                        : item.role === "SPOUSE"
                        ? "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    )}
                  >
                    {item.role === "PRIMARY" && <User className="h-3 w-3" />}
                    {item.role === "SPOUSE" && <Heart className="h-3 w-3" />}
                    {item.role === "CHILD" && <Baby className="h-3 w-3" />}
                    <span>{item.roleLabel}</span>
                  </span>

                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>PASSPORT READY</span>
                  </span>
                </div>

                {/* Photo Preview Container with Click-to-Enlarge */}
                <div
                  className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer shadow-inner"
                  onClick={() => setSelectedPhoto(item)}
                  title="Click to view full size"
                >
                  <img
                    src={item.url}
                    alt={item.personName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white backdrop-blur-[2px]">
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 px-3 py-1.5 text-xs font-semibold shadow-lg border border-slate-700">
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>View Full Resolution</span>
                    </div>
                  </div>
                </div>

                {/* Person Name & File Details */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.personName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.specs}</p>
                </div>

                {/* Bottom Card Actions: Download Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(item)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium cursor-pointer"
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSingleDownload(item)}
                    disabled={isDownloading}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm focus:outline-none cursor-pointer",
                      isDownloading
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-300 dark:border-slate-700 hover:border-blue-500"
                    )}
                  >
                    {isDownloading ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

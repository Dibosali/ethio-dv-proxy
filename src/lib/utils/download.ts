import { SubmissionSummary } from "@/types/admin";

/**
 * Clean a string to be safely used in a filesystem filename.
 */
export function sanitizeFilename(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
}

/**
 * Utility function that takes an image URL (Blob URL, Data URI, or HTTP URL),
 * converts/fetches it into a Blob, creates a temporary <a> tag, sets the download attribute,
 * and triggers a programmatic click to download the file directly to the user's machine.
 */
export async function downloadImageFile(
  imageUrl: string,
  filename: string
): Promise<void> {
  try {
    let blobUrl: string;
    let shouldRevoke = false;

    if (imageUrl.startsWith("blob:")) {
      blobUrl = imageUrl;
    } else if (imageUrl.startsWith("data:")) {
      // Data URI: convert to blob for reliable cross-browser file saving
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      blobUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    } else {
      // Remote or relative static image path
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      blobUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    }

    // Create temporary <a> element
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = blobUrl;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Clean up created object URL
    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    }
  } catch (err) {
    console.error("Error triggering programmatic download:", err);

    // Direct fallback
    const fallbackAnchor = document.createElement("a");
    fallbackAnchor.style.display = "none";
    fallbackAnchor.href = imageUrl;
    fallbackAnchor.download = filename;
    fallbackAnchor.target = "_blank";
    document.body.appendChild(fallbackAnchor);
    fallbackAnchor.click();
    document.body.removeChild(fallbackAnchor);
  }
}

export interface MediaPhotoItem {
  id: string;
  role: "PRIMARY" | "SPOUSE" | "CHILD";
  roleLabel: string;
  personName: string;
  url: string;
  filename: string;
  specs: string;
}

/**
 * Extracts and prepares all available photos from a submission with formatted filenames.
 */
export function getSubmissionMediaList(
  submission: SubmissionSummary
): MediaPhotoItem[] {
  const items: MediaPhotoItem[] = [];
  const primarySlug = sanitizeFilename(submission.applicantName);

  // 1. Primary Entrant Photo
  if (submission.photoUrl) {
    items.push({
      id: "photo-primary",
      role: "PRIMARY",
      roleLabel: "Primary Entrant",
      personName: submission.applicantName,
      url: submission.photoUrl,
      filename: `${primarySlug}_Primary_Photo.jpg`,
      specs: "600 x 600 px • 24-bit color • DV Specification",
    });
  }

  // 2. Spouse Photo
  if (submission.spousePhotoUrl) {
    const spouseName = submission.formData?.spouse
      ? `${submission.formData.spouse.name.firstName} ${submission.formData.spouse.name.lastName}`
      : "Spouse";
    const spouseSlug = sanitizeFilename(spouseName);

    items.push({
      id: "photo-spouse",
      role: "SPOUSE",
      roleLabel: "Spouse",
      personName: spouseName,
      url: submission.spousePhotoUrl,
      filename: `${primarySlug}_Spouse_${spouseSlug}_Photo.jpg`,
      specs: "600 x 600 px • 24-bit color • DV Specification",
    });
  }

  // 3. Children Photos
  if (submission.childrenPhotoUrls && submission.childrenPhotoUrls.length > 0) {
    submission.childrenPhotoUrls.forEach((photoUrl, index) => {
      const childData = submission.formData?.children?.[index];
      const childName = childData
        ? `${childData.name.firstName} ${childData.name.lastName}`
        : `Child ${index + 1}`;
      const childSlug = sanitizeFilename(childName);

      items.push({
        id: `photo-child-${index + 1}`,
        role: "CHILD",
        roleLabel: `Child #${index + 1}`,
        personName: childName,
        url: photoUrl,
        filename: `${primarySlug}_Child_${index + 1}_${childSlug}_Photo.jpg`,
        specs: "600 x 600 px • 24-bit color • DV Specification",
      });
    });
  }

  return items;
}

/**
 * Downloads all photos sequentially with a small delay so browsers don't block multiple rapid downloads.
 */
export async function downloadAllPhotos(
  photos: MediaPhotoItem[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (onProgress) {
      onProgress(i + 1, photos.length);
    }
    await downloadImageFile(photo.url, photo.filename);
    // Short pause between programmatic downloads to satisfy browser download managers
    await new Promise((res) => setTimeout(res, 400));
  }
}

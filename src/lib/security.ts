/**
 * F1RC.UZ Security Utility
 * Mitigates XSS, Open Redirect, and unsafe target=_blank navigation.
 */

/**
 * Validates whether a URL is safe for redirection or external navigation.
 * Allowed protocols: https, http (dev only).
 * Blocked: javascript:, data:, vbscript:, file:, blob:, and protocol-relative (//) paths.
 */
export function isValidSafeUrl(url: string): boolean {
  if (!url) return false;
  
  const trimmed = url.trim().toLowerCase();
  
  // Block javascript:, data:, vbscript:, file:, blob: protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('blob:')
  ) {
    return false;
  }

  // Block protocol-relative URLs (e.g., //evil.com)
  if (trimmed.startsWith('//')) {
    return false;
  }

  // Allow relative URLs (starts with / but not //)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  // Allow absolute safe http/https URLs
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    // If not a valid URL construction and doesn't match basic pattern, treat as unsafe
    return false;
  }
}

/**
 * Checks if a redirect URL is safe (internal-only path).
 * Allows only relative paths starting with / (but not //).
 * Blocks absolute URLs to prevent open redirect vulnerabilities.
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();

  try {
    const decoded = decodeURIComponent(trimmed);
    const hasControlCharacter = Array.from(decoded).some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127;
    });
    if (
      !decoded.startsWith('/') ||
      decoded.startsWith('//') ||
      decoded.includes('\\') ||
      hasControlCharacter
    ) {
      return false;
    }

    const lower = decoded.toLowerCase();
    if (
      lower.includes('javascript:') ||
      lower.includes('data:') ||
      lower.includes('vbscript:') ||
      lower.includes('file:') ||
      lower.includes('blob:')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Opens an external URL safely in a new window with noopener and noreferrer features.
 */
export function safeOpenWindow(url: string): void {
  if (isValidSafeUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    console.warn('[F1RC] Blocked navigation to unsafe URL:', url);
  }
}

/**
 * Validates uploaded image files for safety.
 * Max size: 5MB.
 * Allowed formats: jpeg, png, webp. (SVG is blocked due to potential XSS vectors).
 */
export const IMAGE_UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_UPLOAD_RULES_LABEL = 'JPG, JPEG, PNG yoki WEBP; maksimal 5 MB. SVG qabul qilinmaydi.';

const allowedImageMimeTypes: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];
const allowedImageExtensions: readonly string[] = ['.jpg', '.jpeg', '.png', '.webp'];

export function validateUploadedFile(file: File): { isValid: boolean; error?: string } {
  if (file.size === 0) {
    return { isValid: false, error: "Bo'sh faylni yuklab bo'lmaydi" };
  }

  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return { isValid: false, error: "Fayl hajmi 5MB dan oshmasligi kerak" };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExt = allowedImageExtensions.some(ext => fileName.endsWith(ext));
  if (!hasValidExt) {
    return { isValid: false, error: "Faqat JPG, PNG yoki WEBP formatdagi rasmlarga ruxsat beriladi" };
  }

  if (!allowedImageMimeTypes.includes(file.type.toLowerCase())) {
    return { isValid: false, error: "Rasm formati mos kelmadi (faqat JPG, PNG, WEBP)" };
  }

  return { isValid: true };
}

import { LocalBookmark, BibleVerse } from '../types';

export interface ShareContent {
  title?: string;
  text: string;
  reference: string;
  reflection?: string | null;
  translation?: string;
}

export const ShareService = {
  formatVerseText(content: ShareContent): string {
    let result = `«${content.text.trim()}»\n— ${content.reference} (${content.translation || 'RVR1909'})\n`;

    if (content.title && content.title !== content.reference) {
      result = `✦ ${content.title} ✦\n\n` + result;
    }

    if (content.reflection) {
      result += `\nReflexión: ${content.reflection.trim()}\n`;
    }

    result += `\n🕊️ Iglesia El-Shaddai • Santuario Digital`;
    return result;
  },

  /**
   * Guaranteed copy to clipboard with fallback for iframes and older mobile browsers
   */
  async copyToClipboard(text: string): Promise<boolean> {
    // Attempt 1: Modern navigator.clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fall through to fallback
      }
    }

    // Attempt 2: Document execCommand fallback (robust in iframes & webviews)
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) return true;
    } catch (e) {
      // Fall through
    }

    return false;
  },

  /**
   * Share via SMS / Messages
   */
  shareToSMS(content: ShareContent): void {
    const text = encodeURIComponent(this.formatVerseText(content));
    // Universal SMS protocol for iOS and Android
    window.location.href = `sms:?&body=${text}`;
  },

  /**
   * Native Share API (Web Share) with safety and user feedback
   */
  async nativeShare(content: ShareContent): Promise<'shared' | 'copied' | 'unsupported'> {
    const formatted = this.formatVerseText(content);
    const title = content.title || `${content.reference} — Biblia El-Shaddai`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const shareData: ShareData = {
          title,
          text: formatted
        };

        if (navigator.canShare && !navigator.canShare(shareData)) {
          // Fallback to text copy
          const copied = await this.copyToClipboard(formatted);
          return copied ? 'copied' : 'unsupported';
        }

        await navigator.share(shareData);
        return 'shared';
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // User opened sheet then cancelled
          return 'shared';
        }
        // If gesture or permission error occurred, fallback to clipboard
        const copied = await this.copyToClipboard(formatted);
        return copied ? 'copied' : 'unsupported';
      }
    }

    // If navigator.share is unavailable, copy to clipboard
    const copied = await this.copyToClipboard(formatted);
    return copied ? 'copied' : 'unsupported';
  },

  /**
   * Native Share with Image File (direct to Instagram Stories, WhatsApp, Photos, AirDrop)
   */
  async nativeShareImageFile(blob: Blob, filename: string, title: string, text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof File !== 'undefined') {
      try {
        const file = new File([blob], filename, { type: 'image/png' });
        const shareData: ShareData = {
          title,
          text,
          files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return true;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return true;
      }
    }
    return false;
  },

  /**
   * Share via WhatsApp
   */
  shareToWhatsApp(content: ShareContent): void {
    const text = encodeURIComponent(this.formatVerseText(content));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  },

  /**
   * Share via Telegram
   */
  shareToTelegram(content: ShareContent): void {
    const text = encodeURIComponent(this.formatVerseText(content));
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank', 'noopener,noreferrer');
  },

  /**
   * Share via X (Twitter)
   */
  shareToTwitter(content: ShareContent): void {
    const text = encodeURIComponent(this.formatVerseText(content));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  },

  /**
   * Share via Facebook
   */
  shareToFacebook(content: ShareContent): void {
    const text = encodeURIComponent(this.formatVerseText(content));
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`, '_blank', 'noopener,noreferrer');
  },

  /**
   * Share via Email
   */
  shareToEmail(content: ShareContent): void {
    const subject = encodeURIComponent(`${content.reference} — Biblia Sagrada El-Shaddai`);
    const body = encodeURIComponent(this.formatVerseText(content));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
};

import React, { useState } from 'react';
import { Phone, MessageCircle, Copy, Check, Share2, MapPin, Building2, Hash, Truck } from 'lucide-react';
import { ContactRecord } from '../types';

interface ContactCardProps {
  contact: ContactRecord;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const [copied, setCopied] = useState(false);

  // Clean phone number (strip spaces, hyphens, non-digits)
  const cleanPhoneDigits = contact.mobileNumber ? contact.mobileNumber.replace(/\D/g, '') : '';
  const hasValidPhone = cleanPhoneDigits.length >= 7 && cleanPhoneDigits !== '0000000000';

  // Format WhatsApp number (e.g. +91 prefix for 10-digit Indian numbers)
  const whatsappNumber = cleanPhoneDigits.length === 10 ? `91${cleanPhoneDigits}` : cleanPhoneDigits;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello ${contact.ownerName || 'Sir/Madam'}, contacting you regarding ${contact.agency || 'services'} at ${contact.streetName || contact.location}.`
  )}`;

  const callUrl = `tel:${contact.mobileNumber.trim()}`;
  const smsUrl = `sms:${contact.mobileNumber.trim()}`;

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(contact.mobileNumber.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareText = `${contact.ownerName || 'Contact'}\nAgency: ${contact.agency}\nLocation: ${contact.location}\nStreet: ${contact.streetName}\nPhone: ${contact.mobileNumber}\nAddress: ${contact.currentAddress}${contact.registrationNumber ? `\nReg No: ${contact.registrationNumber}` : ''}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: contact.ownerName || 'Contact Details',
          text: shareText,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Contact details copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between gap-4">
      <div>
        {/* Header: Owner Name & Agency Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {contact.ownerName || 'Owner / Operator'}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-3 h-3" />
                {contact.agency || 'Agency'}
              </span>
              {contact.registrationNumber && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Truck className="w-3 h-3" />
                  {contact.registrationNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Location & Street Name */}
        <div className="space-y-1.5 text-sm text-slate-600 mt-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-800">{contact.streetName || '-'}</strong>,{' '}
              <span className="text-slate-600">{contact.location}</span>
            </span>
          </div>

          {contact.currentAddress && (
            <div className="text-xs text-slate-500 pl-6 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {contact.currentAddress}
            </div>
          )}
        </div>
      </div>

      {/* Contact Details & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
        {/* Mobile Number Display */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mobile Number
          </div>
          <div className="text-base font-bold text-slate-900 font-mono">
            {contact.mobileNumber && contact.mobileNumber !== '0' ? contact.mobileNumber : 'Not Available'}
          </div>
        </div>

        {/* Action Buttons: WhatsApp, Call, Normal Features */}
        {hasValidPhone ? (
          <div className="grid grid-cols-2 gap-2">
            {/* Call Button */}
            <a
              href={callUrl}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-xs"
              title="Call now"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm transition-colors shadow-xs"
              title="Message on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyPhone}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
              title="Copy Phone Number"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Number</span>
                </>
              )}
            </button>

            {/* Share / SMS Button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
              title="Share contact details"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Details</span>
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-2 bg-slate-50 rounded-lg">
            No active phone number registered
          </div>
        )}
      </div>
    </div>
  );
};

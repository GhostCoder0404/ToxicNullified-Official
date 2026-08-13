import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { fetchQRCode } from '../services/api';

export default function QRCodeDisplay({ upiId = 'toxicnullified@upi', amount = 0, title = 'ToxicNullified Tournament Entry' }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchQRCode(upiId, title, amount)
      .then(res => {
        if (isMounted && res.success) {
          setQrCodeUrl(res.qrDataUrl);
        }
      })
      .catch(err => console.error('QR code fetch error:', err))
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [upiId, amount, title]);

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'rgba(10, 13, 20, 0.9)',
      border: '1px solid rgba(0, 243, 255, 0.25)',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: '0 8px 30px rgba(0, 243, 255, 0.08)'
    }}>
      <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cyan)', fontSize: '1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        <QrCode size={18} /> Official Payment Gateway (UPI)
      </h4>

      {/* QR Code Container */}
      <div style={{
        display: 'inline-block',
        background: '#fff',
        padding: '12px',
        borderRadius: '12px',
        margin: '0.5rem 0',
        boxShadow: '0 0 20px rgba(0, 243, 255, 0.3)'
      }}>
        {loading ? (
          <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            Generating QR...
          </div>
        ) : (
          <img
            src={qrCodeUrl}
            alt="Payment QR Code"
            style={{ width: '180px', height: '180px', display: 'block' }}
          />
        )}
      </div>

      <div style={{ marginTop: '0.8rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
          Entry Fee Payable
        </span>
        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-sub)' }}>
          {amount === 0 ? 'FREE ENTRY (₹ 0)' : `₹ ${amount}`}
        </span>
      </div>

      {/* UPI Copy Box */}
      <div style={{
        margin: '1rem 0',
        background: 'rgba(0, 243, 255, 0.06)',
        border: '1px border rgba(0, 243, 255, 0.2)',
        borderRadius: '8px',
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.9rem'
      }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Official UPI VPA:</span>
          <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, color: 'var(--cyan)' }}>{upiId}</span>
        </div>
        <button
          onClick={copyUPI}
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--green)' : 'var(--cyan)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-sub)',
            fontWeight: 700
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Note about payouts */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        textAlign: 'left',
        background: 'rgba(255, 183, 0, 0.08)',
        border: '1px solid rgba(255, 183, 0, 0.2)',
        borderRadius: '6px',
        padding: '0.6rem',
        fontSize: '0.78rem',
        color: '#ffc83b'
      }}>
        <AlertCircle size={16} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>Important Note:</strong> Prize pool payouts for winning teams will be disbursed strictly to the winning captain's UPI ID associated with this registration reference.
        </span>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import api from '../../services/api';

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [enabled, setEnabled] = useState(false);

  const startSetup = async () => {
    try {
      const { data } = await api.post('/auth/2fa/generate');
      setQrCode(data.qrCode);
    } catch (err) {
      alert('Error generating QR Code');
    }
  };

  const verifyAndEnable = async () => {
    try {
      await api.post('/auth/2fa/verify', { token: code });
      setEnabled(true);
      setQrCode('');
      alert('2FA Enabled Successfully! 🔐');
    } catch (err) {
      alert('Invalid Code. Try again.');
    }
  };

  if (enabled) return <div className="text-green-500 font-bold">✅ 2FA is Secured</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-4">
      <h3 className="text-xl text-white font-bold mb-4">Two-Factor Authentication</h3>
      
      {!qrCode ? (
        <button 
          onClick={startSetup}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Enable 2FA
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-300">1. Scan this with Google Authenticator:</p>
          <img src={qrCode} alt="2FA QR Code" className="border-4 border-white rounded" />
          
          <p className="text-gray-300">2. Enter the 6-digit code:</p>
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white w-full border border-gray-600"
            placeholder="123456"
            maxLength={6}
          />
          <button 
            onClick={verifyAndEnable}
            className="bg-green-600 text-white px-4 py-2 rounded w-full font-bold"
          >
            Verify & Activate
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
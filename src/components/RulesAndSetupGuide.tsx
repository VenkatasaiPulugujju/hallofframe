import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Terminal, Database, Key } from 'lucide-react';

interface RulesAndSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesAndSetupGuide: React.FC<RulesAndSetupGuideProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSnippet = `# .env file for Campus Wall of Fame (Project: collage-b3e32)
VITE_ALLOWED_EMAIL_DOMAIN="cvv.ac.in"
VITE_FIREBASE_API_KEY="AIzaSyAdQnNiYpVwXvp1dgtbbKOrE0T5nbDDq10"
VITE_FIREBASE_AUTH_DOMAIN="collage-b3e32.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="collage-b3e32"
VITE_FIREBASE_STORAGE_BUCKET="collage-b3e32.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="428748235882"
VITE_FIREBASE_APP_ID="1:428748235882:web:74e4c16c541dcdaa2a9613"`;

  const customClaimsScript = `// set-admin-claims.js (Run once with Firebase Admin SDK)
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function grantAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(\`Successfully granted admin claim to \${uid}\`);
}

// Example: grantAdmin('USER_UID_OF_MODERATOR');`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl shadow-brutal-xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b-[2.5px] border-[#111111] bg-[#39D62D] text-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <h2 className="font-display font-black text-base uppercase tracking-tight">
              FIREBASE ARCHITECTURE & SETUP GUIDE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#FFF9F0] border-2 border-[#111111] shadow-brutal-xs flex items-center justify-center font-black hover:bg-gray-200 btn-press"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-800 leading-relaxed">
          {/* Section 1 */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#111111] shadow-brutal-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-[#FFD719] border border-black rounded-full flex items-center justify-center font-black text-[11px]">
                1
              </span>
              <h3 className="font-display font-black text-sm uppercase text-[#111111]">
                Google Sign-In with @cvv.ac.in Restriction
              </h3>
            </div>
            <p>
              Authentication uses Firebase Auth with Google Provider configured with the hosted domain
              hint (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">hd: "cvv.ac.in"</code>).
              Crucially, frontend domain check is backed by <strong>server-side security rules</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-semibold">
              <li>Normalized comparison ensures case-insensitivity.</li>
              <li>Unauthorized accounts (e.g. personal Gmail) are immediately rejected and signed out.</li>
              <li>Firestore and Storage rules evaluate <code className="bg-gray-100 px-1 rounded font-mono">request.auth.token.email.matches('^[a-zA-Z0-9._%+-]+@cvv[.]ac[.]in$')</code>.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#111111] shadow-brutal-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#FF4388] text-white border border-black rounded-full flex items-center justify-center font-black text-[11px]">
                  2
                </span>
                <h3 className="font-display font-black text-sm uppercase text-[#111111]">
                  Environment Configuration
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(envSnippet, 'env')}
                className="px-2 py-1 bg-[#FFF9F0] border border-black rounded text-[10px] font-bold flex items-center gap-1"
              >
                {copiedSection === 'env' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'env' ? 'Copied' : 'Copy .env'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#111111] text-[#39D62D] rounded-lg font-mono text-[11px] overflow-x-auto">
              {envSnippet}
            </pre>
          </div>

          {/* Section 3 */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#111111] shadow-brutal-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-[#8055F5] text-white border border-black rounded-full flex items-center justify-center font-black text-[11px]">
                3
              </span>
              <h3 className="font-display font-black text-sm uppercase text-[#111111]">
                Deploying Security Rules
              </h3>
            </div>
            <p>
              Hardened rules are included in <code className="font-mono bg-gray-100 px-1 rounded">firestore.rules</code> and <code className="font-mono bg-gray-100 px-1 rounded">storage.rules</code>. Deploy them using Firebase CLI:
            </p>
            <pre className="p-3 bg-[#111111] text-[#FFD719] rounded-lg font-mono text-[11px] overflow-x-auto">
              firebase deploy --only firestore:rules,storage
            </pre>
          </div>

          {/* Section 4 */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#111111] shadow-brutal-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#39D62D] border border-black rounded-full flex items-center justify-center font-black text-[11px]">
                  4
                </span>
                <h3 className="font-display font-black text-sm uppercase text-[#111111]">
                  Granting Moderator / Admin Claims
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(customClaimsScript, 'claims')}
                className="px-2 py-1 bg-[#FFF9F0] border border-black rounded text-[10px] font-bold flex items-center gap-1"
              >
                {copiedSection === 'claims' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'claims' ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>
            <p>
              Admins cannot be assigned from client code. Use a secure server or script to assign the custom claim or add the user's UID to the <code className="font-mono bg-gray-100 px-1 rounded">admins/{'{uid}'}</code> document collection:
            </p>
            <pre className="p-3 bg-[#111111] text-[#FFF9F0] rounded-lg font-mono text-[10px] overflow-x-auto">
              {customClaimsScript}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

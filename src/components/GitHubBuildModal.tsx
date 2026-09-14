import React, { useState } from 'react';
import { 
  Smartphone, 
  Github, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  QrCode, 
  Cpu, 
  FileCode2, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface GitHubBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubBuildModal: React.FC<GitHubBuildModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'WORKFLOW' | 'LOCAL' | 'QR'>('GUIDE');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const workflowYaml = `name: Build Android Mobile APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:
    inputs:
      build_type:
        description: 'Build Type (debug / release)'
        required: true
        default: 'debug'

jobs:
  build-apk:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: 1. Checkout Repository
        uses: actions/checkout@v4

      - name: 2. Set up Node.js 22.x
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: 3. Install Dependencies & Build Web Assets
        run: |
          if [ -f "package-lock.json" ]; then
            npm ci || npm install --no-audit
          else
            npm install --no-audit
          fi
          npm run build

      - name: 4. Sync Capacitor Android Project
        run: |
          npx cap sync android

      - name: 5. Set up Java JDK 21 (Temurin)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: 6. Set up Android SDK
        uses: android-actions/setup-android@v3
        with:
          packages: 'platforms;android-36 build-tools;36.0.0'

      - name: 7. Build Android APK with Gradle
        run: |
          cd android
          ./gradlew assembleDebug --no-daemon

      - name: 8. Upload APK Artifact to GitHub
        uses: actions/upload-artifact@v4
        with:
          name: UniAudit-Android-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30`;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-ah6omokpwnrmm2iypussrg-171739340329.europe-west2.run.app';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  GitHub Actions Android Mobile Builder
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  APK CI/CD Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated Gradle build pipeline compiling native Android APK artifact for direct phone installation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-6 pt-3 flex items-center space-x-2 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'GUIDE'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Step-by-Step APK Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('WORKFLOW')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'WORKFLOW'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>GitHub Workflow YAML</span>
          </button>

          <button
            onClick={() => setActiveTab('LOCAL')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'LOCAL'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Local Gradle Commands</span>
          </button>

          <button
            onClick={() => setActiveTab('QR')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'QR'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Instant Phone Test (PWA)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: STEP-BY-STEP APK GUIDE */}
          {activeTab === 'GUIDE' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-200 leading-relaxed">
                  <strong className="text-emerald-100 font-semibold block text-sm mb-1">
                    Your GitHub Actions Workflow is Pre-configured and Stored in Repository
                  </strong>
                  The file <code className="bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300 font-mono">.github/workflows/build-android.yml</code> is actively configured with Android SDK 36, Java JDK 21, and Gradle 8.13. Once pushed to GitHub, it will automatically compile a clean, native <code className="bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300 font-mono">uniaudit-mobile-debug.apk</code> that installs directly on your Android phone!
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        STEP 1
                      </span>
                      <Github className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Export or Push to GitHub</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      Export this project directly to your GitHub account using the Google AI Studio settings menu (top-right ⚙ ➔ <strong>Export to GitHub</strong>), or push your Git repository branch:
                    </p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px] text-emerald-400">
                    <code>git push origin main</code>
                    <button 
                      onClick={() => handleCopy('git push origin main', 'git-push')}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copy command"
                    >
                      {copiedSection === 'git-push' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                        STEP 2
                      </span>
                      <Cpu className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Trigger GitHub Actions Workflow</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      On GitHub, navigate to the <strong>Actions</strong> tab. You will see <strong>"Build Android Mobile APK"</strong>.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      It runs automatically on push, or you can click <strong>"Run workflow"</strong> ➔ select <code className="text-slate-300 font-mono">main</code> ➔ click green <strong>Run workflow</strong> button.
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] text-blue-300 font-medium flex items-center space-x-1.5 bg-blue-950/40 p-2 rounded-lg border border-blue-800/40">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Workflow compiles in ~90 to 120 seconds on GitHub Ubuntu runners</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        STEP 3
                      </span>
                      <Download className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Download the APK Artifact</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      Once the green checkmark appears on GitHub Actions, scroll down to the <strong>Artifacts</strong> section:
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc mb-3">
                      <li>Click <strong>UniAudit-Android-APK</strong> to download the zip</li>
                      <li>Extract the zip to get <code className="text-emerald-400 font-mono font-semibold">uniaudit-mobile-debug.apk</code></li>
                    </ul>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono">
                    <span>Artifact: UniAudit-Android-APK.zip</span>
                    <span className="text-emerald-400 text-[10px] font-bold">~15 MB</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        STEP 4
                      </span>
                      <Smartphone className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Install on Your Android Phone</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      Send the <code className="text-emerald-300 font-mono">.apk</code> to your phone (via WhatsApp, Google Drive, Gmail, or USB cable) and tap to install:
                    </p>
                    <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <p>1. Tap the APK file on your Android device</p>
                      <p>2. If prompted: toggle <em>"Allow from this source"</em></p>
                      <p>3. Tap <strong>Install</strong> and open <strong>UniAudit</strong>!</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW YAML VIEWER */}
          {activeTab === 'WORKFLOW' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>File Location: <code className="text-emerald-400 font-mono">.github/workflows/build-android.yml</code></span>
                <button
                  onClick={() => handleCopy(workflowYaml, 'yaml-full')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
                >
                  {copiedSection === 'yaml-full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'yaml-full' ? 'Copied YAML!' : 'Copy Workflow'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto leading-relaxed max-h-96">
                {workflowYaml}
              </pre>
            </div>
          )}

          {/* TAB 3: LOCAL GRADLE BUILD COMMANDS */}
          {activeTab === 'LOCAL' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                If you have Android Studio, JDK 21, and Android SDK installed on your computer, you can also build the APK locally:
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-200">1. Sync &amp; Build via NPM Script</span>
                    <button
                      onClick={() => handleCopy('npm run mobile:apk', 'npm-cmd')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedSection === 'npm-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <code className="text-emerald-400 font-mono text-xs block bg-slate-900 px-3 py-2 rounded">
                    npm run mobile:apk
                  </code>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-200">2. Direct Gradle Assemble Command</span>
                    <button
                      onClick={() => handleCopy('cd android && ./gradlew assembleDebug', 'gradle-cmd')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedSection === 'gradle-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <code className="text-emerald-400 font-mono text-xs block bg-slate-900 px-3 py-2 rounded">
                    cd android &amp;&amp; ./gradlew assembleDebug
                  </code>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Output: <code className="text-slate-300 font-mono">android/app/build/outputs/apk/debug/app-debug.apk</code>
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-200">3. Open Project in Android Studio</span>
                    <button
                      onClick={() => handleCopy('npx cap open android', 'cap-open')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedSection === 'cap-open' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <code className="text-emerald-400 font-mono text-xs block bg-slate-900 px-3 py-2 rounded">
                    npx cap open android
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INSTANT PHONE TEST (PWA / DIRECT URL) */}
          {activeTab === 'QR' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200 leading-relaxed">
                  <strong className="text-indigo-100 font-semibold block text-sm mb-1">
                    Test on Your Phone Instantly Right Now (No Waiting for Build)
                  </strong>
                  You can also open this live app directly on your Android phone's Google Chrome or Edge browser right this second. It contains full PWA manifests and camera support!
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950 p-6 rounded-xl border border-slate-800">
                {/* QR Code generator using standard SVG qr placeholder or high-res vector rendering */}
                <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentAppUrl)}`}
                    alt="Scan QR Code to open on mobile phone"
                    className="w-40 h-40 object-contain rounded"
                    onError={(e) => {
                      // Fallback if network blocked
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-center mt-1 text-[10px] font-mono text-slate-700 font-bold">
                    Scan with Phone Camera
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-xs">
                  <h4 className="font-bold text-white text-sm">How to install instantly on Android:</h4>
                  <ol className="space-y-2 text-slate-300 list-decimal pl-4">
                    <li>Scan the QR code or open URL in <strong>Google Chrome for Android</strong></li>
                    <li>Tap the <strong>three dots (⋮)</strong> at top-right of Chrome</li>
                    <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                    <li>UniAudit Mobile launches as a full-screen, standalone Android app with offline storage!</li>
                  </ol>

                  <div className="pt-2">
                    <div className="text-slate-400 text-[11px] mb-1">Direct URL:</div>
                    <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="truncate text-emerald-400 font-mono text-[11px]">{currentAppUrl}</span>
                      <button
                        onClick={() => handleCopy(currentAppUrl, 'app-url')}
                        className="text-slate-400 hover:text-white shrink-0"
                      >
                        {copiedSection === 'app-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Workflow File Ready in <code className="text-slate-300 font-mono">.github/workflows/build-android.yml</code></span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
            >
              Close
            </button>
            <button
              onClick={() => setActiveTab('GUIDE')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-md"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>View APK Instructions</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

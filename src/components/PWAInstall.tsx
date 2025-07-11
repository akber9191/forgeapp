
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallBanner(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallBanner(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="forge-card bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">Install Forge</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-primary-foreground/80 hover:text-primary-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-primary-foreground/90 mb-4">
          Install Forge for quick access and offline use! 🚀
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="bg-white text-primary hover:bg-white/90 flex-1"
            size="sm"
          >
            Install App
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="text-primary-foreground hover:bg-white/20"
            size="sm"
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall;

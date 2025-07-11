
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface ServiceWorkerMessage {
  type: string;
  version?: string;
}

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { toast } = useToast();

  // Define handleUpdate function first
  const handleUpdate = async () => {
    if (!swRegistration) {
      console.log('No service worker registration found');
      window.location.reload();
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // If there's a waiting service worker, tell it to skip waiting
      if (swRegistration.waiting) {
        console.log('Telling waiting service worker to skip waiting');
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for the new service worker to take control
        await new Promise<void>((resolve) => {
          const handleControllerChange = () => {
            console.log('Service worker controller changed');
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            resolve();
          };
          navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
          
          // Fallback timeout in case controllerchange doesn't fire
          setTimeout(() => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            resolve();
          }, 5000);
        });
      }
      
      console.log('Reloading page to use new service worker');
      // Reload the page to use the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      toast({
        title: "Update Failed",
        description: "Please try refreshing the page manually.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode || isInWebAppiOS) {
      setIsInstalled(true);
    }

    // Register service worker and setup update detection
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          setSwRegistration(registration);
          
          // Check for updates immediately
          registration.update();
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  toast({
                    title: "Update Available",
                    description: "A new version is ready. Click to refresh.",
                    action: (
                      <Button size="sm" onClick={handleUpdate}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                    ),
                  });
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event: MessageEvent<ServiceWorkerMessage>) => {
            if (event.data.type === 'SW_UPDATED') {
              setUpdateAvailable(true);
              toast({
                title: "App Updated",
                description: `Version ${event.data.version} is now active!`,
                action: (
                  <Button size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                ),
              });
            }
          });

          // Check for waiting service worker
          if (registration.waiting) {
            setUpdateAvailable(true);
          }

        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    };

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      if (!isInStandaloneMode && !isInWebAppiOS) {
        setShowInstallBanner(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallBanner(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    registerServiceWorker();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

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

  const handleDismissUpdate = () => {
    setUpdateAvailable(false);
  };

  // Show update banner if update is available
  if (updateAvailable && !isUpdating) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
        <div className="forge-card bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 shadow-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <h3 className="font-semibold">Update Available</h3>
            </div>
            <button
              onClick={handleDismissUpdate}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-white/90 mb-4">
            A new version is ready with improvements and bug fixes!
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white text-orange-500 hover:bg-white/90 flex-1"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Update Now
                </>
              )}
            </Button>
            <Button
              onClick={handleDismissUpdate}
              variant="ghost"
              className="text-white hover:bg-white/20"
              size="sm"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Don't show install banner if already installed or no prompt available
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

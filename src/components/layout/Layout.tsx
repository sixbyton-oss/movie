import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const WATERMARK_EFFECTS = [
  'animate-wm-wiggle',
  'animate-wm-vibrate',
  'animate-wm-shake',
  'animate-wm-flash',
  'animate-wm-swing',
  'animate-wm-tada',
  'animate-wm-bounce',
];

const ZimDevWatermark: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [effect, setEffect] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const checkLandscape = () => {
      const landscape = window.innerWidth > window.innerHeight && window.innerWidth < 1024;
      setIsLandscape(landscape);
    };

    checkLandscape();
    window.addEventListener('resize', checkLandscape);
    window.addEventListener('orientationchange', checkLandscape);

    const clearAll = () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };

    const runCycle = () => {
      clearAll();
      setVisible(true);
      setEffect('');

      // After 60s visible, trigger random effect for 20s
      const t1 = setTimeout(() => {
        const randomEffect = WATERMARK_EFFECTS[Math.floor(Math.random() * WATERMARK_EFFECTS.length)];
        setEffect(randomEffect);

        // After 20s of effect, hide for 60s
        const t2 = setTimeout(() => {
          setVisible(false);
          setEffect('');

          const t3 = setTimeout(runCycle, 60000);
          timersRef.current.push(t3);
        }, 20000);
        timersRef.current.push(t2);
      }, 60000);
      timersRef.current.push(t1);
    };

    runCycle();

    return () => {
      clearAll();
      window.removeEventListener('resize', checkLandscape);
      window.removeEventListener('orientationchange', checkLandscape);
    };
  }, []);

  if (isLandscape) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 transition-opacity duration-[2000ms] ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className={`watermark-3d text-2xl md:text-4xl font-black tracking-wider ${effect || 'animate-slow-pulse'}`}>
        Created by ZimDev
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <div className="pt-16 lg:pt-0 flex-1">
          {children}
        </div>
      </div>
      <ZimDevWatermark />
    </div>
  );
};

export default Layout;

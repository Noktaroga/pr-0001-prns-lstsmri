import React, { useState, useEffect } from 'react';

interface LiveStatsProps {
  className?: string;
}

interface StatsData {
  currentUsers: number;
  pageViews: number;
  topPages: { page: string; views: number }[];
  countries: { country: string; users: number }[];
}

export const LiveStats: React.FC<LiveStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<StatsData>({
    currentUsers: 0,
    pageViews: 0,
    topPages: [],
    countries: []
  });
  const [isVisible, setIsVisible] = useState(false);

  // Simular datos en tiempo real (esto se conectaría a GA4 Reporting API en producción)
  useEffect(() => {
    const updateStats = () => {
      // Simular datos - en producción usarías GA4 Reporting API
      setStats({
        currentUsers: Math.floor(Math.random() * 100) + 20,
        pageViews: Math.floor(Math.random() * 1000) + 500,
        topPages: [
          { page: '/videos', views: Math.floor(Math.random() * 200) + 100 },
          { page: '/home', views: Math.floor(Math.random() * 150) + 80 },
          { page: '/video-detail', views: Math.floor(Math.random() * 100) + 50 }
        ],
        countries: [
          { country: 'España', users: Math.floor(Math.random() * 30) + 10 },
          { country: 'México', users: Math.floor(Math.random() * 25) + 8 },
          { country: 'Argentina', users: Math.floor(Math.random() * 20) + 5 },
          { country: 'Colombia', users: Math.floor(Math.random() * 15) + 3 }
        ]
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        📊 Stats
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xs z-50 border ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">📊 Live Stats</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>👥 Usuarios activos:</span>
          <span className="font-bold text-green-600">{stats.currentUsers}</span>
        </div>
        
        <div className="flex justify-between">
          <span>📄 Páginas vistas:</span>
          <span className="font-bold">{stats.pageViews}</span>
        </div>
        
        <div>
          <div className="font-semibold mb-1">🌍 Países:</div>
          {stats.countries.slice(0, 3).map((country, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span>{country.country}:</span>
              <span>{country.users}</span>
            </div>
          ))}
        </div>
        
        <div>
          <div className="font-semibold mb-1">📈 Páginas populares:</div>
          {stats.topPages.slice(0, 3).map((page, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span>{page.page}:</span>
              <span>{page.views}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500">
        Actualizado cada 30s
      </div>
    </div>
  );
};
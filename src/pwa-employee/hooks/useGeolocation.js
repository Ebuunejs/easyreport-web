import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation wird von diesem Browser nicht unterstützt.';
        setLocationError(error);
        reject(new Error(error));
        return;
      }

      setIsLoading(true);
      setLocationError(null);

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 Minute Cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };
          
          setLocation(locationData);
          setLocationError(null);
          setIsLoading(false);
          resolve(locationData);
        },
        (error) => {
          let errorMessage = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Standortzugriff wurde verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Standortinformationen sind nicht verfügbar.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Zeitüberschreitung beim Abrufen des Standorts.';
              break;
            default:
              errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
              break;
          }
          
          setLocationError(errorMessage);
          setIsLoading(false);
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Automatisch Standort bei Mount anfordern
  useEffect(() => {
    requestLocation().catch(() => {
      // Fehler wird bereits im State gespeichert
    });
  }, []);

  return {
    location,
    locationError,
    isLoading,
    requestLocation
  };
}; 
import { useState, useEffect } from 'react';
import employeeAPI from '../services/employeeAPI';
import { useAuth } from '../../context/AuthContext';

export const useTimeTracker = () => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Beim Mount prüfen, ob eine aktive Session existiert
  useEffect(() => {
    if (user?.id) {
      checkActiveTracking();
    }
  }, [user?.id]);

  const checkActiveTracking = async () => {
    try {
      setIsLoading(true);
      const activeTracking = await employeeAPI.getActiveTracking(user.id);
      
      if (activeTracking) {
        setCurrentSession({
          id: activeTracking.id,
          project: {
            id: activeTracking.project_id,
            name: activeTracking.project_name || activeTracking.project?.name
          },
          startTime: activeTracking.start_time,
          startLocation: {
            lat: activeTracking.start_latitude,
            lng: activeTracking.start_longitude,
            accuracy: activeTracking.start_accuracy
          }
        });
        setIsTracking(true);
        console.log('Aktive Zeiterfassung gefunden:', activeTracking);
      }
    } catch (error) {
      console.error('Fehler beim Prüfen der aktiven Zeiterfassung:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = async (project, location) => {
    try {
      setIsLoading(true);
      setTrackingError(null);

      if (isTracking) {
        throw new Error('Zeiterfassung läuft bereits.');
      }

      if (!project) {
        throw new Error('Projekt ist erforderlich.');
      }

      if (!location) {
        throw new Error('Standort ist erforderlich.');
      }

      if (!user?.id) {
        throw new Error('Benutzer nicht angemeldet.');
      }

      const response = await employeeAPI.startTimeTracking(
        user.id,
        project.id,
        project.name,
        location
      );

      const session = {
        id: response.data.id,
        project,
        startTime: response.data.start_time,
        startLocation: location
      };

      setCurrentSession(session);
      setIsTracking(true);
      
      console.log('Zeiterfassung gestartet:', response);
      
    } catch (error) {
      setTrackingError(error.message);
      console.error('Fehler beim Starten der Zeiterfassung:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopTracking = async (endLocation) => {
    try {
      setIsLoading(true);
      setTrackingError(null);

      if (!isTracking || !currentSession) {
        throw new Error('Keine aktive Zeiterfassung gefunden.');
      }

      const response = await employeeAPI.stopTimeTracking(
        currentSession.id,
        endLocation
      );

      setCurrentSession(null);
      setIsTracking(false);
      
      console.log('Zeiterfassung beendet:', response);
      return response.data;
      
    } catch (error) {
      setTrackingError(error.message);
      console.error('Fehler beim Beenden der Zeiterfassung:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isTracking,
    currentSession,
    trackingError,
    isLoading,
    startTracking,
    stopTracking,
    checkActiveTracking
  };
}; 
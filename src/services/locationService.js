// import api from './api'; // Wird später für echte API-Integration benötigt

class LocationService {
  // Hole alle Mitarbeiterstandorte (TODO: API-Integration)
  async getEmployeeLocations() {
    try {
      // Placeholder für zukünftige API-Integration
      // const response = await api.get('/locations/employees');
      // return response.data;
      return this.getMockEmployeeLocations();
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiterstandorte:', error);
      throw error;
    }
  }

  // Hole Standorte für einen bestimmten Mitarbeiter (TODO: API-Integration)
  async getEmployeeLocationHistory(employeeId, startDate, endDate) {
    try {
      // Placeholder für zukünftige API-Integration
      // const response = await api.get(`/locations/employee/${employeeId}`, {
      //   params: { startDate, endDate }
      // });
      // return response.data;
      return this.getMockEmployeeLocations().filter(emp => emp.employeeId === employeeId);
    } catch (error) {
      console.error('Fehler beim Laden der Standorthistorie:', error);
      throw error;
    }
  }

  // Hole Firmenstandort und Einstellungen (TODO: API-Integration)
  async getCompanyLocation() {
    try {
      // Placeholder für zukünftige API-Integration
      // const response = await api.get('/locations/company');
      // return response.data;
      return {
        lat: 47.3769,
        lng: 8.5417,
        address: 'Bahnhofstrasse 1, 8001 Zürich',
        radius: 50
      };
    } catch (error) {
      console.error('Fehler beim Laden des Firmenstandorts:', error);
      throw error;
    }
  }

  // Aktualisiere Firmenstandort (TODO: API-Integration)
  async updateCompanyLocation(locationData) {
    try {
      // Placeholder für zukünftige API-Integration
      // const response = await api.put('/locations/company', locationData);
      // return response.data;
      console.log('Firmenstandort würde aktualisiert werden:', locationData);
      return locationData;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Firmenstandorts:', error);
      throw error;
    }
  }

  // Geocoding-Service (Adresse zu Koordinaten)
  async geocodeAddress(address) {
    try {
      // Hier würde normalerweise ein Geocoding-Service wie Google Maps oder Nominatim verwendet
      // Für Demo-Zwecke verwenden wir Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
      
      throw new Error('Adresse nicht gefunden');
    } catch (error) {
      console.error('Fehler beim Geocoding:', error);
      throw error;
    }
  }

  // Berechne Entfernung zwischen zwei Punkten (Haversine-Formel)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Erdradius in Metern
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Entfernung in Metern
  }

  // Prüfe ob ein Punkt innerhalb eines Radius liegt
  isWithinRadius(centerLat, centerLng, pointLat, pointLng, radius) {
    const distance = this.calculateDistance(centerLat, centerLng, pointLat, pointLng);
    return distance <= radius;
  }

  // Mock-Daten für Entwicklung (können später entfernt werden)
  getMockEmployeeLocations() {
    return [
      {
        employeeId: 1,
        name: 'Max Mustermann',
        lat: 47.3769 + (Math.random() - 0.5) * 0.01,
        lng: 8.5417 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date(),
        accuracy: 10
      },
      {
        employeeId: 2,
        name: 'Anna Schmidt',
        lat: 47.3769 + (Math.random() - 0.5) * 0.01,
        lng: 8.5417 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date(),
        accuracy: 15
      },
      {
        employeeId: 3,
        name: 'Peter Weber',
        lat: 47.3769 + (Math.random() - 0.5) * 0.02,
        lng: 8.5417 + (Math.random() - 0.5) * 0.02,
        timestamp: new Date(),
        accuracy: 8
      }
    ];
  }
}

export default new LocationService(); 
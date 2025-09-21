'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CohortLocation {
  id: string;
  name: string;
  cohort: 'senior' | 'adult' | 'teen' | 'chronic';
  latitude: number;
  longitude: number;
  ubzi: number;
  alertCount: number;
}

interface CommunityMapProps {
  locations?: CohortLocation[];
  height?: number;
  className?: string;
}

// Mock locations for demonstration
const mockLocations: CohortLocation[] = [
  {
    id: 'resident-001',
    name: 'Senior Community Center',
    cohort: 'senior',
    latitude: 34.0522,
    longitude: -118.2437,
    ubzi: 68,
    alertCount: 3,
  },
  {
    id: 'resident-002',
    name: 'Family Housing District',
    cohort: 'adult',
    latitude: 34.0422,
    longitude: -118.2337,
    ubzi: 74,
    alertCount: 1,
  },
  {
    id: 'resident-003',
    name: 'Youth Activity Zone',
    cohort: 'teen',
    latitude: 34.0622,
    longitude: -118.2537,
    ubzi: 76,
    alertCount: 0,
  },
  {
    id: 'resident-004',
    name: 'Healthcare Assisted Living',
    cohort: 'chronic',
    latitude: 34.0322,
    longitude: -118.2637,
    ubzi: 65,
    alertCount: 5,
  },
];

const CommunityMap: React.FC<CommunityMapProps> = ({
  locations = mockLocations,
  height = 400,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<CohortLocation | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Simple fallback map without MapLibre for this demo
  // In a real implementation, you would install and configure MapLibre GL JS
  useEffect(() => {
    if (!mapRef.current) return;

    // For demonstration purposes, we'll create a simple interactive map
    // In production, you would use MapLibre GL JS here
    const mapContainer = mapRef.current;

    // Create a simple SVG-based map visualization
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', '0 0 400 300');
    svg.style.background = '#f0f9ff';
    svg.style.border = '1px solid #e5e7eb';
    svg.style.borderRadius = '0.5rem';

    // Add neighborhood boundaries (simplified)
    const neighborhoods = [
      { name: 'Downtown', x: 50, y: 50, width: 100, height: 80 },
      { name: 'Westside', x: 200, y: 40, width: 120, height: 90 },
      { name: 'Eastside', x: 60, y: 160, width: 110, height: 100 },
      { name: 'Northside', x: 220, y: 180, width: 100, height: 80 },
    ];

    neighborhoods.forEach(neighborhood => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', neighborhood.x.toString());
      rect.setAttribute('y', neighborhood.y.toString());
      rect.setAttribute('width', neighborhood.width.toString());
      rect.setAttribute('height', neighborhood.height.toString());
      rect.setAttribute('fill', '#ffffff');
      rect.setAttribute('stroke', '#d1d5db');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('opacity', '0.8');
      svg.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (neighborhood.x + neighborhood.width / 2).toString());
      text.setAttribute('y', (neighborhood.y + neighborhood.height / 2).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', '#6b7280');
      text.textContent = neighborhood.name;
      svg.appendChild(text);
    });

    // Add location markers
    locations.forEach((location, index) => {
      const x = 80 + (index % 2) * 150 + Math.random() * 100;
      const y = 80 + Math.floor(index / 2) * 120 + Math.random() * 60;

      const cohortColors = {
        senior: '#8b5cf6',
        adult: '#3b82f6',
        teen: '#10b981',
        chronic: '#ef4444',
      };

      // Marker circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', cohortColors[location.cohort]);
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      circle.style.transition = 'all 0.2s ease';

      // Alert indicator
      if (location.alertCount > 0) {
        const alertCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        alertCircle.setAttribute('cx', (x + 6).toString());
        alertCircle.setAttribute('cy', (y - 6).toString());
        alertCircle.setAttribute('r', '4');
        alertCircle.setAttribute('fill', '#ef4444');
        alertCircle.setAttribute('stroke', '#ffffff');
        alertCircle.setAttribute('stroke-width', '1');
        svg.appendChild(alertCircle);

        const alertText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        alertText.setAttribute('x', (x + 6).toString());
        alertText.setAttribute('y', (y - 6).toString());
        alertText.setAttribute('text-anchor', 'middle');
        alertText.setAttribute('dominant-baseline', 'middle');
        alertText.setAttribute('font-size', '8');
        alertText.setAttribute('fill', '#ffffff');
        alertText.setAttribute('font-weight', 'bold');
        alertText.textContent = location.alertCount.toString();
        svg.appendChild(alertText);
      }

      // Add interactivity
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '10');
        setSelectedLocation(location);
      });

      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '8');
      });

      circle.addEventListener('click', () => {
        setSelectedLocation(location);
      });

      svg.appendChild(circle);
    });

    mapContainer.appendChild(svg);

    return () => {
      if (mapContainer.contains(svg)) {
        mapContainer.removeChild(svg);
      }
    };
  }, [locations, height]);

  const getCohortIcon = (cohort: string) => {
    switch (cohort) {
      case 'senior': return '👴';
      case 'adult': return '👨';
      case 'teen': return '👦';
      case 'chronic': return '❤️';
      default: return '👤';
    }
  };

  const getCohortLabel = (cohort: string) => {
    switch (cohort) {
      case 'senior': return 'Senior (65+)';
      case 'adult': return 'Adult (25-64)';
      case 'teen': return 'Teen (13-24)';
      case 'chronic': return 'Chronic Conditions';
      default: return 'Unknown';
    }
  };

  const getUBZIColor = (ubzi: number) => {
    if (ubzi >= 80) return 'text-green-600';
    if (ubzi >= 60) return 'text-blue-600';
    if (ubzi >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Community Map</h3>
            <p className="text-sm text-gray-600">
              Cohort distribution and neighborhood overview
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {locations.length} locations
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          style={{ height: `${height}px` }}
          className="w-full"
          role="application"
          aria-label="Interactive community map showing cohort locations"
        />

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border p-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
          {[
            { cohort: 'senior', color: '#8b5cf6', label: 'Seniors' },
            { cohort: 'adult', color: '#3b82f6', label: 'Adults' },
            { cohort: 'teen', color: '#10b981', label: 'Teens' },
            { cohort: 'chronic', color: '#ef4444', label: 'Chronic' },
          ].map(item => (
            <div key={item.cohort} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.label}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500"/>
              <span className="text-gray-600">Active Alerts</span>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border p-4 min-w-64">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getCohortIcon(selectedLocation.cohort)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{selectedLocation.name}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {getCohortLabel(selectedLocation.cohort)}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">UBZI Score:</span>
                    <span className={`font-medium ${getUBZIColor(selectedLocation.ubzi)}`}>
                      {selectedLocation.ubzi}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Alerts:</span>
                    <span className={`font-medium ${selectedLocation.alertCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedLocation.alertCount}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Stats */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Avg UBZI', value: Math.round(locations.reduce((sum, loc) => sum + loc.ubzi, 0) / locations.length) },
            { label: 'Total Alerts', value: locations.reduce((sum, loc) => sum + loc.alertCount, 0) },
            { label: 'Neighborhoods', value: 4 },
            { label: 'Active Locations', value: locations.length },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Error State */}
      {mapError && (
        <div className="p-6 text-center">
          <div className="text-yellow-600 mb-2">⚠️</div>
          <h4 className="font-medium text-gray-900 mb-2">Map Loading Issue</h4>
          <p className="text-sm text-gray-600">{mapError}</p>
        </div>
      )}
    </div>
  );
};

export default CommunityMap;
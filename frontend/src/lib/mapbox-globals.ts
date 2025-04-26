/**
 * This file contains utility functions for Mapbox GL JS to ensure it's only loaded on the client side.
 */

// Custom ambulance icon for Mapbox GL
export function createCustomMarker() {
  // Create a custom marker element
  if (typeof document === 'undefined') return null;
    
  // In a real application, you might want to use a custom SVG or image for the marker
  // For now, we'll create a simple colored div element
  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.style.backgroundColor = 'red';
  el.style.width = '20px';
  el.style.height = '20px';
  el.style.borderRadius = '50%';
  el.style.border = '2px solid white';
  
  return el;
}

// Helper function to get the Mapbox access token
export function getMapboxToken() {
  return process.env.MAPBOX_ACCESS_TOKEN || 'MAPBOX_ACCESS_TOKEN';
}

// Status color mapping function for intersections
export function getStatusColor(status: string): string {
  switch (status) {
    case 'emergency':
      return '#ef4444'; // red
    case 'congested':
      return '#f59e0b'; // amber
    case 'normal':
      return '#22c55e'; // green
    default:
      return '#64748b'; // slate
  }
} 
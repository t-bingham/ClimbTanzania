import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import MarkerClusterGroup from '../custom-modules/react-leaflet-cluster/lib'; // Ensure this path is correct
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import leaflet CSS here if not already imported globally
import Link from 'next/link';
import pinIcon from '../../public/pin1.png'; // Import the custom pin image

const customIcon = L.icon({
  iconUrl: pinIcon.src,
  iconSize: [23, 44],
  iconAnchor: [11.5, 44], // Center the icon horizontally
  popupAnchor: [0, -44], // Popup from the top-center
});

const LeafletMap = ({ pins = [], polygons = [], initialPosition }) => {
  console.log('Polygons passed to LeafletMap:', polygons);
  return (
    <MapContainer center={initialPosition || [-2.031246, 33.496643]} zoom={8} style={{ height: '500px', width: '75vw' }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a> contributors'
      />
      <MarkerClusterGroup maxClusterRadius={10}>
        {pins.map((pin, index) => (
          <Marker key={index} position={pin.position} icon={customIcon}>
            <Popup>
              <Link href={`/node/${pin.id}`} legacyBehavior>
                <a>{pin.name}</a>
              </Link>
              <span> - {pin.grade}</span>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* Render dynamic polygons */}
      {polygons.map((polygon, idx) => (
        <Polygon key={idx} positions={polygon.path} color={polygon.color}>
          <Popup>{polygon.name}</Popup>
        </Polygon>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;

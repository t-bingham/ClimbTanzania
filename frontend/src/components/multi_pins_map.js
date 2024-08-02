import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import pinIcon from '../../public/pin1.png'; // Import the custom pin image

const LeafletMap = ({ pins = [], initialPosition }) => {
  const customIcon = L.icon({
    iconUrl: pinIcon.src,
    iconSize: [23, 44],
    iconAnchor: [11.5, 44], // Center the icon horizontally
    popupAnchor: [0, -44], // Popup from the top-center
  });

  return (
    <MapContainer center={initialPosition || [-2.031246, 33.496643]} zoom={8} style={{ height: '500px', width: '75vw' }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a> contributors'
      />
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
    </MapContainer>
  );
};

export default LeafletMap;

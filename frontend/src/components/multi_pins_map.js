import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import pinIcon from '../../public/pin1.png'; // Import the custom pin image

const LeafletMap = ({ pins = [], initialPosition, isEditable = true, canDropPin, togglePinDropping, setPinCoordinates }) => {
  const customIcon = L.icon({
    iconUrl: pinIcon.src,
    iconSize: [23, 44],
    iconAnchor: [11.5, 44], // Center the icon horizontally
    popupAnchor: [0, -44], // Popup from the top-center
  });

  const PinControl = () => {
    const map = useMap();

    useEffect(() => {
      if (!isEditable) return;

      const control = L.control({ position: 'bottomleft' });

      control.onAdd = function () {
        const button = L.DomUtil.create('button', 'leaflet-bar');
        button.innerHTML = 'Pin';
        button.style.padding = '5px';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = canDropPin ? 'grey' : 'white'; // Conditional styling

        button.onmouseenter = () => {
          button.style.backgroundColor = canDropPin ? 'lightgrey' : '#f0f0f0'; // Lighter grey on hover
        };

        button.onmouseleave = () => {
          button.style.backgroundColor = canDropPin ? 'grey' : 'white';
        };

        button.onclick = (e) => {
          e.stopPropagation(); // Prevent the click event from propagating to the map
          togglePinDropping();
        };

        return button;
      };

      control.addTo(map);

      return () => {
        map.removeControl(control);
      };
    }, [map, canDropPin, isEditable]);

    return null;
  };

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
      {isEditable && <PinControl />}
    </MapContainer>
  );
};

export default LeafletMap;

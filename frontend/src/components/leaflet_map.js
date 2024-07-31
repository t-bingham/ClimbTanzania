import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import pinIcon from '../../public/pin1.png'; // Import the custom pin image

const LeafletMap = ({ canDropPin, togglePinDropping, setPinCoordinates, initialPosition, isEditable = true }) => {
  const [position, setPosition] = useState(initialPosition || null);
  const markerRef = useRef(null);

  // Create a custom icon
  const customIcon = L.icon({
    iconUrl: pinIcon.src,
    iconSize: [23, 44], // Size of the icon
    iconAnchor: [18, 44], // Point of the icon which will correspond to marker's location
    popupAnchor: [-18, 0] // Point from which the popup should open relative to the iconAnchor
  });

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        if (isEditable && canDropPin) {
          const newPosition = e.latlng;
          setPosition(newPosition);
          setPinCoordinates(newPosition); // Pass coordinates to parent component
          togglePinDropping(); // Disable pin dropping after adding a pin
        }
      },
    });

    const eventHandlers = {
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPosition = marker.getLatLng();
          setPosition(newPosition);
          setPinCoordinates(newPosition); // Pass coordinates to parent component
        }
      },
    };

    return position === null ? null : (
      <Marker
        position={position}
        icon={customIcon}
        draggable={isEditable}
        eventHandlers={isEditable ? eventHandlers : {}}
        ref={markerRef}
      >
        <Popup>
          Coordinates: {position.lat.toFixed(8)}, {position.lng.toFixed(8)}
        </Popup>
      </Marker>
    );
  };

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
    <MapContainer center={position || [-2.031246, 33.496643]} zoom={8} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a> contributors'
      />
      <LocationMarker />
      {isEditable && <PinControl />}
    </MapContainer>
  );
};

export default LeafletMap;

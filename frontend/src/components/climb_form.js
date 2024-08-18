import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import debounce from 'lodash.debounce'; // Import lodash.debounce

const ClimbForm = ({ pinCoordinates, updatePinCoordinates }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    name: '',
    type: '',
    grade: '',
    quality: '',
    first_ascensionist: '',
    first_ascent_date: new Date().toISOString().slice(0, 10),
    description: '',
    tags: '',
  });

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (pinCoordinates) {
      setFormData({
        ...formData,
        latitude: pinCoordinates.lat.toFixed(8),
        longitude: pinCoordinates.lng.toFixed(8),
        first_ascent_date: formData.first_ascent_date, // Should be in ISO format string
      });
      setIsConfirmed(true); // Automatically confirm when pin is dropped
    }
  }, [pinCoordinates]);

  useEffect(() => {
    // Check if all required fields are filled out and coordinates are confirmed
    const requiredFields = [
      formData.latitude,
      formData.longitude,
      formData.name,
      formData.type,
      formData.grade,
      formData.quality,
      formData.first_ascensionist,
      formData.first_ascent_date,
    ];
    setIsFormValid(requiredFields.every((field) => field !== '') && isConfirmed);
  }, [formData, isConfirmed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData); // Log form data
    try {
      const response = await axios.post('http://localhost:8000/climbs/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Climb added successfully:', response.data);
      // Redirect to the new climb's page
      router.push(`/node/${response.data.id}`);
    } catch (error) {
      console.error('Error adding climb:', error);
    }
  };

  const handleConfirmCoordinates = () => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      updatePinCoordinates({ lat, lng });
      setIsConfirmed(true);
    }
  };

  const handleEditCoordinates = () => {
    setIsConfirmed(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData({
            ...formData,
            latitude: latitude.toFixed(8),
            longitude: longitude.toFixed(8),
          });
          updatePinCoordinates({ lat: latitude, lng: longitude });
          setIsConfirmed(true);
        },
        (error) => {
          console.error('Error retrieving location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const searchUsers = debounce(async (query) => {
    if (query.length < 3) {
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8000/users?search=${query}`);
      setUserSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  }, 300); // Delay search by 300ms

  const handleUserInputChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, first_ascensionist: value });
    searchUsers(value);
  };

  const handleUserSelect = (user) => {
    setFormData({ ...formData, first_ascensionist: user.username });
    setShowSuggestions(false);
  };

  const gradeOptions = {
    Boulder: ['V0-', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'],
    Sport: ['4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'],
    Trad: ['4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'],
  };

  const inputStyle = {
    borderRadius: '5px',
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '10px',
  };

  const labelStyle = {
    display: 'block',
    marginTop: '5px',
    fontWeight: 'bold',
  };

  const requiredLabelStyle = {
    ...labelStyle,
    color: 'black',
  };

  const requiredStarStyle = {
    color: 'red',
  };

  const buttonStyle = {
    backgroundColor: 'black',
    color: 'white',
    borderRadius: '5px',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
  };

  return (
    <form style={{ marginTop: '20px' }} onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '45%' }}>
          <label style={labelStyle}>Latitude:</label>
          <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} readOnly={isConfirmed} style={inputStyle} />
        </div>
        <div style={{ width: '45%' }}>
          <label style={labelStyle}>Longitude:</label>
          <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} readOnly={isConfirmed} style={inputStyle} />
        </div>
        <div style={{ width: '10%' }}>
          {isConfirmed ? (
            <button type="button" onClick={handleEditCoordinates} style={buttonStyle}>Edit</button>
          ) : (
            <button type="button" onClick={handleConfirmCoordinates} style={buttonStyle}>Confirm</button>
          )}
        </div>
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button type="button" onClick={handleUseCurrentLocation} style={buttonStyle}>Use Current Location</button>
      </div>
      <div>
        <label style={requiredLabelStyle}><span style={requiredStarStyle}>*</span> Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
      </div>
      <div>
        <label style={requiredLabelStyle}><span style={requiredStarStyle}>*</span> Type:</label>
        <select name="type" value={formData.type} onChange={handleChange} required style={inputStyle}>
          <option value="">Select Type</option>
          <option value="Boulder">Boulder</option>
          <option value="Sport">Sport</option>
          <option value="Trad">Trad</option>
        </select>
      </div>
      {formData.type && (
        <div>
          <label style={requiredLabelStyle}><span style={requiredStarStyle}>*</span> Grade:</label>
          <select name="grade" value={formData.grade} onChange={handleChange} required style={inputStyle}>
            <option value="">Select Grade</option>
            {gradeOptions[formData.type].map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label style={requiredLabelStyle}><span style={requiredStarStyle}>*</span> Quality:</label>
        <select name="quality" value={formData.quality} onChange={handleChange} required style={inputStyle}>
          <option value="">Select Quality</option>
          {[0, 1, 2, 3, 4, 5].map((star) => (
            <option key={star} value={star}>{`${star} Star${star !== 1 ? 's' : ''}`}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={requiredLabelStyle}><span style={requiredStarStyle}>*</span> First Ascensionist:</label>
        <input
          type="text"
          name="first_ascensionist"
          value={formData.first_ascensionist}
          onChange={handleUserInputChange}
          required
          style={inputStyle}
          autoComplete="off"
        />
        {showSuggestions && (
          <ul style={{ border: '1px solid #ccc', marginTop: '5px', listStyleType: 'none', padding: '0', maxHeight: '100px', overflowY: 'auto' }}>
            {userSuggestions.map((user) => (
              <li key={user.id} onClick={() => handleUserSelect(user)} style={{ padding: '5px', cursor: 'pointer' }}>
                {user.username}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <label style={requiredLabelStyle}><span style={requiredStarStyle}>*</span> First Ascent Date:</label>
        <input type="date" name="first_ascent_date" value={formData.first_ascent_date} onChange={handleChange} required style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Description:</label>
        <textarea name="description" value={formData.description} onChange={handleChange} style={inputStyle}></textarea>
      </div>
      <div>
        <label style={labelStyle}>Tags:</label>
        <input type="text" name="tags" value={formData.tags} onChange={handleChange} style={inputStyle} />
        <p>Separate tags by commas</p>
      </div>
      <button type="submit" style={{ ...buttonStyle, display: isFormValid ? 'block' : 'none' }}>Submit</button>
    </form>
  );
};

export default ClimbForm;

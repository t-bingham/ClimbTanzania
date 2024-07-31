import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const ClimbForm = ({ pinCoordinates }) => {
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
    area: '',
    description: '',
    tags: '',
  });

  useEffect(() => {
    if (pinCoordinates) {
      setFormData({
        ...formData,
        latitude: pinCoordinates.lat.toFixed(8),
        longitude: pinCoordinates.lng.toFixed(8)
      });
    }
  }, [pinCoordinates]);

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
          'Content-Type': 'application/json'
        }
      });
      console.log('Climb added successfully:', response.data);
      router.push(`/node/${response.data.id}`);
    } catch (error) {
      console.error('Error adding climb:', error);
    }
  };

  const gradeOptions = {
    Boulder: ['V0-', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'],
    Sport: ['4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'],
    Trad: ['4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c']
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
    fontWeight: 'bold'
  };

  const requiredLabelStyle = {
    ...labelStyle,
    color: 'black'
  };

  const requiredStarStyle = {
    color: 'red'
  };

  const buttonStyle = {
    backgroundColor: 'black',
    color: 'white',
    borderRadius: '5px',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px'
  };

  return (
    <form style={{ marginTop: '20px' }} onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '48%' }}>
          <label style={labelStyle}>Latitude:</label>
          <input type="text" name="latitude" value={formData.latitude} readOnly style={inputStyle} />
        </div>
        <div style={{ width: '48%' }}>
          <label style={labelStyle}>Longitude:</label>
          <input type="text" name="longitude" value={formData.longitude} readOnly style={inputStyle} />
        </div>
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
        <input type="number" name="quality" value={formData.quality} onChange={handleChange} min="0" max="5" required style={inputStyle} />
        <p>
          The star-rating system we use is based on an objective system brought to us by Brian Capps (see article on B3bouldering for explanation of origin). Climbs are given stars based on these criteria: Presence and purity of line, Obvious start, Sharpness / rock quality, Landing, History, Location. Most climbs in the world would be 0 - 2 stars. Only the best of the best are 4 stars, and 5 stars is reserved for the (theoretical) perfect problem, one that is flawless. A three-star problem is worth spending a year training for and travelling overseas to send. Anything higher is an absolute must-do. This is not to in any way demerit low or zero-star problems but to help us objectively rate problems without too much hype.
        </p>
      </div>
      <div>
        <label style={requiredLabelStyle}><span style={requiredStarStyle}>*</span> First Ascensionist:</label>
        <input type="text" name="first_ascensionist" value={formData.first_ascensionist} onChange={handleChange} required style={inputStyle} />
      </div>
      <div>
        <label style={requiredLabelStyle}><span style={requiredStarStyle}>*</span> First Ascent Date:</label>
        <input type="date" name="first_ascent_date" value={formData.first_ascent_date} onChange={handleChange} required style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Area:</label>
        <input type="text" name="area" value={formData.area} onChange={handleChange} style={inputStyle} />
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
      <button type="submit" style={buttonStyle}>Submit</button>
    </form>
  );
};

export default ClimbForm;

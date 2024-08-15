//ClimbTanzania/frontend/src/pages/add_area.js
import React, { useState } from 'react';
import axios from 'axios';
import withAuth from '../hoc/withAuth';

const AddArea = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please select a KML file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload_kml', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(`File uploaded successfully: ${response.data.filename}`);
    } catch (error) {
      setMessage(`Error uploading file: ${error.response ? error.response.data.detail : error.message}`);
    }
  };

  return (
    <div>
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={styles.title}>Add Area</h1>
        <section style={{ marginBottom: '20px' }}>
          <h2 style={styles.title2}>How to Create an Area KML File from Google Maps</h2>
          <ol>
            <li>Open your web browser and go to <a href="https://www.google.com/mymaps" target="_blank" rel="noopener noreferrer" style={styles.link}>Google My Maps</a>.</li>
            <li>Sign in with your Google account if you haven't already.</li>
            <li>Click on the <strong>"Create a new map"</strong> button.</li>
            <li>Use the search bar to locate the area you want to define.</li>
            <li>Use the <strong>Drawing tools</strong> (located below the search bar) to create a new polygon:
              <ul>
                <li>Click on the <strong>Draw a line</strong> tool.</li>
                <li>Select <strong>Add line or shape</strong> from the dropdown menu.</li>
                <li>Click on the map to start drawing your polygon. Click to add each point of the polygon. To complete the polygon, click on the first point again.</li>
              </ul>
            </li>
            <li>A dialog will appear where you can name your shape. Enter a name and optional description.</li>
            <li>Click on the three vertical dots next to the map name in the left-hand panel.</li>
            <li>Select <strong>"Export to KML/KMZ"</strong>.</li>
            <li>In the dialog that appears, ensure the correct layer or the entire map is selected.</li>
            <li>Click the <strong>"Download"</strong> button.</li>
          </ol>
          <p>Your KML file will be downloaded to your computer. You can now use this file to upload it using the form below.</p>
        </section>
        <form onSubmit={handleSubmit}>
          <input type="file" accept=".kml" onChange={handleFileChange} style={styles.fileInput} />
          <button type="submit" style={styles.button}>Upload KML</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '32px',
    paddingBottom: '10px',
  },
  title2: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
    paddingBottom: '10px',
  },
  link: {
    textDecoration: 'underline',
    color: 'blue',
  },
  buttonContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'black',
    color: 'white',
  },
  fileInput: {
    display: 'block',
    marginBottom: '20px',
  },
};

export default withAuth(AddArea);

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const LogPage = ({ climb }) => {
  const router = useRouter();
  const [logData, setLogData] = useState({
    date: new Date().toISOString().split('T')[0], // Set today's date
    grade: climb.grade,
    comment: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/logs/add`,
        {
          climb_id: climb.id,
          ...logData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push(`/node/${climb.id}`); // Redirect back to the climb page
    } catch (error) {
      console.error('Error logging the climb:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogData({
      ...logData,
      [name]: value,
    });
  };

  return (
    <div style={styles.container}>
      <h1>Log Climb</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Date:</label>
        <input
          type="date"
          name="date"
          value={logData.date}
          onChange={handleChange}
          style={styles.input}
        />

        <label style={styles.label}>Grade:</label>
        <select
          name="grade"
          value={logData.grade}
          onChange={handleChange}
          style={styles.input}
        >
          {/* Populate options based on available grades */}
          {[
            'V0-', 'V0', 'V0+', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
            '4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'
          ].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <label style={styles.label}>Comment:</label>
        <textarea
          name="comment"
          value={logData.comment}
          onChange={handleChange}
          maxLength="200"
          style={styles.textarea}
        />

        <button type="submit" style={styles.button}>Submit Log</button>
      </form>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/climbs/${id}`);
    return {
      props: {
        climb: response.data,
      },
    };
  } catch (error) {
    console.error('Error fetching climb:', error.response ? error.response.data : error.message);
    return {
      notFound: true,
    };
  }
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: '20px',
    padding: '10px',
    fontSize: '16px',
  },
  textarea: {
    marginBottom: '20px',
    padding: '10px',
    fontSize: '16px',
    minHeight: '100px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#050505',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default LogPage;

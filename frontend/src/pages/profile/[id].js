import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../../styles/climbs.module.css';

const ProfilePage = ({ user, initialClimbs, initialFirstAscents }) => {
  const [activeTab, setActiveTab] = useState('ticks');
  const router = useRouter();

  if (!user) {
    return <div>User not found</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ticks':
        return (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.wideColumn}>Name</th>
                  <th className={styles.narrowColumn}>Grade</th>
                  <th className={styles.wideColumn}>Area</th>
                  <th className={styles.narrowColumn}>First Ascent Year</th>
                </tr>
              </thead>
              <tbody>
                {initialClimbs.map(climb => (
                  <tr key={climb.id}>
                    <td className={styles.wideColumn}>{climb.name}</td>
                    <td className={styles.narrowColumn}>{climb.grade || 'N/A'}</td>
                    <td className={styles.wideColumn}>{climb.area || 'N/A'}</td>
                    <td className={styles.narrowColumn}>{climb.first_ascent_date ? new Date(climb.first_ascent_date).getFullYear() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'firstAscents':
        return (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.wideColumn}>Name</th>
                  <th className={styles.narrowColumn}>Grade</th>
                  <th className={styles.wideColumn}>Area</th>
                  <th className={styles.narrowColumn}>First Ascent Year</th>
                </tr>
              </thead>
              <tbody>
                {initialFirstAscents.map(climb => (
                  <tr key={climb.id}>
                    <td className={styles.wideColumn}>{climb.name}</td>
                    <td className={styles.narrowColumn}>{climb.grade || 'N/A'}</td>
                    <td className={styles.wideColumn}>{climb.area || 'N/A'}</td>
                    <td className={styles.narrowColumn}>{climb.first_ascent_date ? new Date(climb.first_ascent_date).getFullYear() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile of {user.username}</h1>
      <div className={styles.tabs}>
        <button onClick={() => setActiveTab('ticks')} className={activeTab === 'ticks' ? styles.activeTab : ''}>My Ticks</button>
        <button onClick={() => setActiveTab('firstAscents')} className={activeTab === 'firstAscents' ? styles.activeTab : ''}>My First Ascents</button>
        {/* Add more tabs as needed */}
      </div>
      {renderTabContent()}
    </div>
  );
};


export async function getServerSideProps({ params }) {
  try {
    const userResponse = await axios.get(`http://localhost:8000/users/${params.id}`);
    const ticksResponse = await axios.get(`http://localhost:8000/users/${params.id}/ticks`);
    const firstAscentsResponse = await axios.get(`http://localhost:8000/climbs/?first_ascensionist=${userResponse.data.username}`);

    return {
      props: {
        user: userResponse.data,
        initialClimbs: ticksResponse.data,
        initialFirstAscents: firstAscentsResponse.data,
      },
    };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return {
      notFound: true, // This will trigger a 404 page if the user is not found or there's an error
    };
  }
}

export default ProfilePage;

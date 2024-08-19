import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddToHitlistButton = ({ climbId }) => {
  const [isOnHitlist, setIsOnHitlist] = useState(false);

  useEffect(() => {
    const checkHitlistStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('${process.env.NEXT_PUBLIC_API_URL}/hitlist/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const hitlist = response.data.map(climb => climb.id);
        setIsOnHitlist(hitlist.includes(climbId));
      } catch (error) {
        console.error('Error checking hitlist status:', error);
      }
    };

    checkHitlistStatus();
  }, [climbId]);

  const toggleHitlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to manage your hitlist.');
        return;
      }

      const url = isOnHitlist
        ? `${process.env.NEXT_PUBLIC_API_URL}/hitlist/remove/`
        : `${process.env.NEXT_PUBLIC_API_URL}/hitlist/`;

      await axios.post(
        url,
        null,
        {
          params: { climb_id: climbId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsOnHitlist(!isOnHitlist);
      alert(`Climb ${isOnHitlist ? 'removed from' : 'added to'} hitlist!`);
    } catch (error) {
      console.error(`Error ${isOnHitlist ? 'removing from' : 'adding to'} hitlist:`, error);
      alert(`Failed to ${isOnHitlist ? 'remove from' : 'add to'} hitlist.`);
    }
  };

  return (
    <button
      onClick={toggleHitlist}
      className="hitlist-button"
      style={{ backgroundColor: 'black', color: 'white' }}
    >
      {isOnHitlist ? 'Remove from Hitlist' : 'Add to Hitlist'}
    </button>
  );
};

export default AddToHitlistButton;

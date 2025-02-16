import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function StartChat() {
  const [roundtables, setRoundtables] = useState([]);
  const router = useRouter();

  // Fetch existing roundtables from the backend
  useEffect(() => {
    fetchRoundtables();
  }, []);

  const fetchRoundtables = async () => {
    try {
      // Assume your API name is "RoundtableAPI" and roundtables are served at "/roundtables"
      const rt = await API.get('RoundtableAPI', '/roundtables');
      setRoundtables(rt);
    } catch (error) {
      console.error("Error fetching roundtables:", error);
    }
  };

  // When a roundtable is selected, store its info and navigate to the chat page
  const startChat = (roundtable) => {
    localStorage.setItem('currentRoundtable', JSON.stringify(roundtable));
    router.push('/chat');
  };

  return (
    <div className="container">
      <h1>Select a Roundtable to Start Chatting</h1>
      {roundtables.length === 0 ? (
        <p>No roundtables found. Please create one from the dashboard.</p>
      ) : (
        <div className="list-group">
          {roundtables.map((rt) => (
            <button
              key={rt.roundtableId}
              className="list-group-item list-group-item-action"
              onClick={() => startChat(rt)}
            >
              {rt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
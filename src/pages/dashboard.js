import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Dashboard() {
  // --- Profile State & Functions ---
  const [profile, setProfile] = useState({ userId: '', name: '', openAIApiKey: '' });
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // Assume the API returns an object with user profile info
      const result = await API.get('RoundtableAPI', '/profile');
      setProfile(result);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await API.put('RoundtableAPI', '/profile', { body: profile });
      alert('Profile updated successfully');
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // --- GPT Configurations State & Functions ---
  const [gptConfigs, setGptConfigs] = useState([]);
  const [newConfig, setNewConfig] = useState({ configId: '', name: '', description: '' });
  const [editingConfig, setEditingConfig] = useState(null);

  const fetchGptConfigs = async () => {
    try {
      const configs = await API.get('RoundtableAPI', '/gpt-configs');
      setGptConfigs(configs);
    } catch (error) {
      console.error("Error fetching GPT configs:", error);
    }
  };

  const addGptConfig = async () => {
    try {
      // Simple unique ID generation; in production consider a UUID
      const configToAdd = { ...newConfig, configId: newConfig.configId || Date.now().toString() };
      await API.post('RoundtableAPI', '/gpt-configs', { body: configToAdd });
      setNewConfig({ configId: '', name: '', description: '' });
      fetchGptConfigs();
    } catch (error) {
      console.error("Error adding GPT config:", error);
    }
  };

  const updateGptConfig = async () => {
    try {
      await API.put('RoundtableAPI', '/gpt-configs', { body: editingConfig });
      setEditingConfig(null);
      fetchGptConfigs();
    } catch (error) {
      console.error("Error updating GPT config:", error);
    }
  };

  const deleteGptConfig = async (configId) => {
    try {
      await API.del('RoundtableAPI', `/gpt-configs?id=${configId}`);
      fetchGptConfigs();
    } catch (error) {
      console.error("Error deleting GPT config:", error);
    }
  };

  // --- Roundtables State & Functions ---
  const [roundtableName, setRoundtableName] = useState('');
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [roundtables, setRoundtables] = useState([]);

  const fetchRoundtables = async () => {
    try {
      const rt = await API.get('RoundtableAPI', '/roundtables');
      setRoundtables(rt);
    } catch (error) {
      console.error("Error fetching roundtables:", error);
    }
  };

  const createRoundtable = async () => {
    try {
      const roundtableId = Date.now().toString();
      const roundtable = {
        roundtableId,
        name: roundtableName,
        gptConfigs: selectedConfigs, // Array of selected configIds
      };
      await API.post('RoundtableAPI', '/roundtables', { body: roundtable });
      setRoundtableName('');
      setSelectedConfigs([]);
      fetchRoundtables();
      alert('Roundtable created successfully!');
    } catch (error) {
      console.error("Error creating roundtable:", error);
    }
  };

  // --- useEffect to fetch data on mount ---
  useEffect(() => {
    fetchProfile();
    fetchGptConfigs();
    fetchRoundtables();
  }, []);

  return (
    <div className="container">
      <h1>Dashboard</h1>

      {/* User Profile Section */}
      <div className="card p-3 mb-3">
        <h3>User Profile</h3>
        {profileLoading ? (
          <p>Loading profile...</p>
        ) : (
          <>
            <div className="form-group mb-2">
              <label>Name:</label>
              <input
                type="text"
                className="form-control"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="form-group mb-2">
              <label>OpenAI API Key:</label>
              <input
                type="text"
                className="form-control"
                value={profile.openAIApiKey}
                onChange={(e) => setProfile({ ...profile, openAIApiKey: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" onClick={updateProfile}>Update Profile</button>
          </>
        )}
      </div>

      {/* GPT Configurations Section */}
      <div className="card p-3 mb-3">
        <h3>GPT Configurations</h3>
        <div className="form-group mb-2">
          <label>Name:</label>
          <input
            type="text"
            className="form-control"
            value={newConfig.name}
            onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
          />
        </div>
        <div className="form-group mb-2">
          <label>Description:</label>
          <input
            type="text"
            className="form-control"
            value={newConfig.description}
            onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" onClick={addGptConfig}>Add GPT Config</button>

        <h4 className="mt-3">Existing Configurations</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Config ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gptConfigs.map((config) => (
              <tr key={config.configId}>
                <td>{config.configId}</td>
                <td>
                  {editingConfig && editingConfig.configId === config.configId ? (
                    <input
                      type="text"
                      value={editingConfig.name}
                      onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                    />
                  ) : (
                    config.name
                  )}
                </td>
                <td>
                  {editingConfig && editingConfig.configId === config.configId ? (
                    <input
                      type="text"
                      value={editingConfig.description}
                      onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })}
                    />
                  ) : (
                    config.description
                  )}
                </td>
                <td>
                  {editingConfig && editingConfig.configId === config.configId ? (
                    <>
                      <button className="btn btn-success btn-sm me-2" onClick={updateGptConfig}>Save</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingConfig(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-sm me-2" onClick={() => setEditingConfig(config)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteGptConfig(config.configId)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roundtable Section */}
      <div className="card p-3 mb-3">
        <h3>Create Roundtable</h3>
        <div className="form-group mb-2">
          <label>Roundtable Name:</label>
          <input
            type="text"
            className="form-control"
            value={roundtableName}
            onChange={(e) => setRoundtableName(e.target.value)}
          />
        </div>
        <div className="form-group mb-2">
          <label>Select GPT Configurations:</label>
          <select
            multiple
            className="form-control"
            value={selectedConfigs}
            onChange={(e) => {
              const options = e.target.options;
              const values = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  values.push(options[i].value);
                }
              }
              setSelectedConfigs(values);
            }}
          >
            {gptConfigs.map((config) => (
              <option key={config.configId} value={config.configId}>
                {config.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={createRoundtable}>Create Roundtable</button>

        <h4 className="mt-3">Existing Roundtables</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Roundtable ID</th>
              <th>Name</th>
              <th>GPT Configurations</th>
            </tr>
          </thead>
          <tbody>
            {roundtables.map((rt) => (
              <tr key={rt.roundtableId}>
                <td>{rt.roundtableId}</td>
                <td>{rt.name}</td>
                <td>{(rt.gptConfigs || []).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
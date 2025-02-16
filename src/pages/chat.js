import React, { useState, useEffect, useRef } from 'react';
import { API } from 'aws-amplify';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [roundtable, setRoundtable] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const chatWindowRef = useRef(null);

  // Load the selected roundtable info (for this example, stored in localStorage)
  useEffect(() => {
    const roundtableInfo = JSON.parse(localStorage.getItem('currentRoundtable'));
    setRoundtable(roundtableInfo);
  }, []);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to send a message
  const sendMessage = async () => {
    if (!input || !roundtable) return;

    setIsSending(true);

    // Append user's message to the chat window
    const userMsg = { sender: 'User', text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Call the chat endpoint; this sends the user's message along with the roundtable configuration.
      const response = await API.post('RoundtableAPI', '/chat', {
        body: { message: input, roundtable },
      });
      const { gptResponses } = response;

      // Append each GPT response in sequence to simulate turn-taking
      gptResponses.forEach((res) => {
        setMessages((prev) => [...prev, { sender: res.sender, text: res.text }]);
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: 'System', text: 'Error processing your message. Please try again.' },
      ]);
    }

    setInput('');
    setIsSending(false);
  };

  return (
    <div className="container">
      <h1>Roundtable Chat</h1>
      <div
        className="border p-3 mb-3"
        style={{ height: '400px', overflowY: 'scroll' }}
        ref={chatWindowRef}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === 'User' ? 'text-end mb-2' : 'text-start mb-2'}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isSending && sendMessage()}
          disabled={isSending}
        />
        <button className="btn btn-primary" onClick={sendMessage} disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
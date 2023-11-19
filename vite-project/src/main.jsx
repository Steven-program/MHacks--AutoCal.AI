import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import reportWebVitals from './reportWebVitals';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const supabase = createClient(
  "https://txkxlkvtyvhsjhasudzj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4a3hsa3Z0eXZoc2poYXN1ZHpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAzNjQwOTcsImV4cCI6MjAxNTk0MDA5N30.eR70o8aA-C7jZdzks1LVyfJH781k-Fuyk9h99aP-lDI"
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);

reportWebVitals();
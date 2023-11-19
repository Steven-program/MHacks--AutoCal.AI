import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { CiMicrophoneOn } from "react-icons/ci";
import OpenAI from "openai";
import "./App.css";
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-US"; // Default language

const VITE_OPENAI_API_KEY = "YOUR API KEY";
const whisperModel = "YOUR MODEL ";
const gptModel = "YOUR MODEL";
const openai = new OpenAI({
  apiKey: "YOUR API KEY",
  dangerouslyAllowBrowser: true,
});

function convertToDate(dateString) {
  // Split the string into parts
  const parts = dateString.split('-');

  // Extract year, day, and month
  const year = parts[0];
  const day = parts[1];
  const month = parts[2];

  return new Date(year, month - 1, day);
}

const Example = () => {
  const recorderRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [whisperResponse, setWhisperResponse] = useState(null);
  const [completionResponse, setCompletionResponse] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("zh-CN");

  useEffect(() => {
    handleListen();
  }, [isListening]);

  const handleListen = () => {
    if (isListening) {
      mic.start();
      mic.onend = () => {
        console.log("continue..");
        mic.start();
      };
    } else {
      mic.stop();
      mic.onend = () => {
        console.log("Stopped Mic on Click");
        runCompletion(note);
      };
    }
    mic.onstart = () => {
      console.log("Mics on");
    };

    mic.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setNote(transcript);
      mic.onerror = (event) => {
        console.log(event.error);
      };
    };
  };

  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  /*
    const { isLoading } = useSessionContext();
  
  if(isLoading) {
    return <></>
  }
  */


  const [WEEKDAY, setWeekday] = useState(true);
  const [MAX_HOURS, setMaxHours] = useState(10);
  const [PROCRASTINATE, setProcrastinate] = useState(false);
  // JSON array of assignments
  const a_test = [
    {
      "due_date": "2023-19-11",
      "time_for_completion": 10,
      "title": "EECS281 Project 4",
    },
    {
      "due_date": "2023-05-12",
      "time_for_completion": 10,
      "title": "Math homework",
    },
    {
      "due_date": "2023-15-12",
      "time_for_completion": 4,
      "title": "stalk linkedin",
    },

    // Add more assignments here
  ];

  function convertToDate(dateString) {
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Months are zero-based in JavaScript
    const day = parseInt(parts[2]);

    return new Date(year, month, day);
  }

  function createWorkSchedule(assignments) {
    console.log(assignments);
    let schedule = [];
    const currentDate = new Date();
    let availableDays = [];
    assignments.forEach(assignment => {
      const dueDate = convertToDate(assignment.due_date);
      const totalHours = assignment.time_required;
      console.log(totalHours);
      // our code does not account for the actual time 
      // Iterate through dates
      for (let date = new Date(currentDate); date <= dueDate || date.toISOString().split('T')[0] === dueDate.toISOString().split('T')[0]; date.setDate(date.getDate() + 1)) {
        if ((date.getDay() === 0 || date.getDay() === 6)) continue; // Skip weekends
        availableDays.push(new Date(date));
      }

      const dailyHours = PROCRASTINATE ?
        calculateHoursProcrastinate(totalHours, availableDays.length) :
        Array(availableDays.length).fill(Math.min(MAX_HOURS, totalHours / availableDays.length));
      console.log(dailyHours);
      availableDays.forEach((date, i) => {
        const dateString = date.toISOString().split('T')[0];
        if (dailyHours[i] > 0) {
          schedule.push({
            "due_date": dateString,
            "title": assignment.title,
            "hours": dailyHours[i]
          });
        }
      });
    });

    console.log(schedule);
    return schedule;
  }

  function calculateHoursProcrastinate(totalHours, availableDays) {
    const hours = Array(availableDays).fill(0);
    let remainingHours = totalHours;
    for (let i = availableDays - 1; i >= 0 && remainingHours > 0; i--) {
      const hoursForDay = Math.min(remainingHours, MAX_HOURS);
      hours[i] = hoursForDay;
      remainingHours -= hoursForDay;
    }
    return hours;
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent(title, start_date, time_spent) {
    console.log("Creating calendar event");
    const for_string = `Work on "${title}" for ${Math.ceil(time_spent)} hours.`;
    const event = {
      'summary': for_string,
      'start': {
        'date': start_date,
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      },
      'end': {
        'date': start_date, // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      }
    }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + session.provider_token // Access token for google
      },
      body: JSON.stringify(event)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
    });
  }

  const runCompletion = async (whisperResponse) => {

    try {
      setLoading(true);
      // Using OpenAI Chat API to generate completion based on the entire whisperResponse
      const completion = await openai.chat.completions.create({
        messages: [
          {
            "role": "system", "content": "Make the next prompt into a json object of a list of objects with parameters (due_date - 'YYYY-MM-DD', time_required - (integer), title - (string)). Cut out anything else. Today is '2023-11-19'. Your ouptut should start with [ and end with ]. Approximate the time required if not said."
          },
          { "role": "user", "content": whisperResponse }
        ],
        model: gptModel,
      });

      const tasksResponse = JSON.parse(completion.choices[0].message.content);
      console.log(tasksResponse);
      const workSchedule = createWorkSchedule(tasksResponse);
      console.log(JSON.stringify(workSchedule));
      // Check if tasksResponse is an array and iterate
      if (Array.isArray(workSchedule)) {
        workSchedule.forEach(task => {
          createCalendarEvent(task.title, task.due_date, task.hours)
          console.log('Due Date:', task.due_date);
          console.log('How long to work on today:', task.hours);
          console.log('Title:', task.title);
          console.log('---------------------');
        })
        alert("Event created, check your Google Calendar!");

      } else {
        console.log('Tasks response is not in the expected format:');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    mic.lang = newLanguage;
  };



  // ... rest of your component code ...

  // Checkbox change handlers
  const handleWeekdayChange = (event) => {
    setWeekday(event.target.checked);
  };

  const handleMaxHoursChange = (event) => {
    setMaxHours(event.target.value);
  };

  const handleProcrastinateChange = (event) => {
    setProcrastinate(event.target.checked);
  };
  return (
    <div className="HomePage">
      <img src="/public/autocal logo transparent.png" className="logo" alt="logo"></img>
      <h1>Let's Get Things Done!</h1>

      <div className="flex-row">
        <div>
          <input
            type="checkbox"
            id="weekdayCheckbox"
            checked={WEEKDAY}
            onChange={handleWeekdayChange}
          />
          <label htmlFor="weekdayCheckbox">Weekdays only?</label>
        </div>

        <div>
          <label htmlFor="maxHoursInput">Max Hours: </label>
          <input
            type="number"
            id="maxHoursInput"
            value={MAX_HOURS}
            onChange={handleMaxHoursChange}
            min="0"
          />
        </div>

        <div>
          <input
            type="checkbox"
            id="procrastinateCheckbox"
            checked={PROCRASTINATE}
            onChange={handleProcrastinateChange}
          />
          <label htmlFor="procrastinateCheckbox">Procrastinate</label>
        </div>
      </div>

      {loading ?
        <div className="spinner-container">
          <div className="loading-spinner">
          </div>
        </div> :
        <div>
          <p>{isListening ? "Recording..." : "Click the microphone to begin recording."}</p>
          <div className={`microphoneLabel${isListening ? ' recording' : ''}`} onClick={() => setIsListening((prevState) => !prevState)}>
            <CiMicrophoneOn />
          </div>
        </div>
      }


      <div className="search-container">
        {/* <input
          className="styled-input"
          type="text"
          placeholder="Language?"
          onChange={handleLanguageChange}
        /> */}
        Language: {" "}
        <select className="styled-input" onChange={handleLanguageChange}>
          <option>en-US</option>
          <option>zh-CN</option>
        </select>

      </div>


      <p className="para">{note}</p>

     
      {session ?
        <button className="margin-up" onClick={() => signOut()}>Sign Out</button>
        :
        <button className="margin-up" onClick={() => googleSignIn()}>Sign In With Google</button>

      }
    </div>
  );
};

export default Example;

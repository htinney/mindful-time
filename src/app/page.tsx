"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [birthday, setBirthday] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('birthday') || '';
    }
    return '';
  });
  const [dayStartTime, setDayStartTime] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dayStartTime') || '22:00';
    }
    return '22:00';
  });
  const [mindfulTime, setMindfulTime] = useState({ year: 0, chapter: 0, arc: 0, episode: 0 });

  useEffect(() => {
    // Save values to localStorage when they change
    localStorage.setItem('birthday', birthday);
    localStorage.setItem('dayStartTime', dayStartTime);

    // Calculate mindful time
    if (birthday) {
      const birthdayDate = new Date(birthday);
      const now = new Date();
      const startTime = new Date(now.toDateString() + ' ' + dayStartTime);
      
      if (now < startTime) {
        now.setDate(now.getDate() - 1);
      }

      const year = now.getFullYear() - birthdayDate.getFullYear();
      
      // Calculate the most recent birthday in the current year
      const currentYearBirthday = new Date(now.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
      if (currentYearBirthday > now) {
        currentYearBirthday.setFullYear(currentYearBirthday.getFullYear() - 1);
      }

      const daysSinceBirthday = Math.floor((now.getTime() - currentYearBirthday.getTime()) / (1000 * 60 * 60 * 24));
      
      const chapter = Math.floor(daysSinceBirthday / 28) + 1;
      const arc = Math.floor((daysSinceBirthday % 28) / 7) + 1;
      const episode = (daysSinceBirthday % 7) + 1;

      setMindfulTime({ year, chapter, arc, episode });
    }
  }, [birthday, dayStartTime]);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800 text-black dark:text-white">
      <h1 className="text-4xl font-bold mb-8">Mindful Time</h1>
      
      <div className="mb-4">
        <label htmlFor="birthday" className="block mb-2">Birthday:</label>
        <input
          type="date"
          id="birthday"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="border p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
      </div>

      <div className="mb-8">
        <label htmlFor="dayStartTime" className="block mb-2">Day Start Time:</label>
        <input
          type="time"
          id="dayStartTime"
          value={dayStartTime}
          onChange={(e) => setDayStartTime(e.target.value)}
          className="border p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
      </div>

      <div className="text-xl">
        <p>Year: {mindfulTime.year}</p>
        <p>Chapter: {mindfulTime.chapter}</p>
        <p>Arc: {mindfulTime.arc}</p>
        <p>Episode: {mindfulTime.episode}</p>
      </div>
    </div>
  );
}

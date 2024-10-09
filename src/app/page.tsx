"use client";

import { useState, useEffect } from 'react';

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

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
  const [decimalTime, setDecimalTime] = useState({ episode: 0, quest: 0, moment: 0, beat: 0 });

  useEffect(() => {
    localStorage.setItem('birthday', birthday);
    localStorage.setItem('dayStartTime', dayStartTime);

    if (birthday) {
      const birthdayDate = new Date(birthday);
      const now = new Date();
      const [startHour, startMinute] = dayStartTime.split(':').map(Number);
      
      // Calculate time difference from midnight
      const midnightDiff = startHour * 60 + startMinute;
      const adjustedNow = new Date(now.getTime() + midnightDiff * 60000);

      // Calculate the most recent birthday in the current year
      let currentYearBirthday = new Date(adjustedNow.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
      currentYearBirthday.setHours(startHour, startMinute, 0, 0);
      
      if (currentYearBirthday > adjustedNow) {
        currentYearBirthday.setFullYear(currentYearBirthday.getFullYear() - 1);
      }

      let daysSinceBirthday = Math.floor((adjustedNow.getTime() - currentYearBirthday.getTime()) / (1000 * 60 * 60 * 24));

      // Adjust for IFC leap day
      const birthdayDayOfYear = getDayOfYear(currentYearBirthday);
      const nowDayOfYear = getDayOfYear(adjustedNow);
      if (isLeapYear(adjustedNow.getFullYear()) && birthdayDayOfYear <= 177 && nowDayOfYear > 177) {
        daysSinceBirthday -= 1;
      }

      const year = adjustedNow.getFullYear() - birthdayDate.getFullYear();
      let chapter = Math.floor(daysSinceBirthday / 28) + 1;
      let arc = Math.floor((daysSinceBirthday % 28) / 7) + 1;
      let episode = (daysSinceBirthday % 28) + 1;

      // Handle Year Day and Leap Day
      if (daysSinceBirthday >= 364) {
        chapter = 0;
        arc = 1;
        episode = daysSinceBirthday - 363; // 1 for Year Day, 2 for Leap Day
      } else if (isLeapYear(adjustedNow.getFullYear()) && nowDayOfYear === 177) {
        chapter = 6;
        arc = 4;
        episode = 29; // Leap Day
      }

      // Calculate adjusted time for today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
      const adjustedMinutes = (now.getTime() - todayStart.getTime()) / 60000;
      const adjustedEpisode = episode + (adjustedMinutes / (24 * 60));

      setMindfulTime({ year, chapter, arc, episode: Math.floor(adjustedEpisode) });

    }

    // New decimal time calculation
    const updateDecimalTime = () => {
      const now = new Date();
      const [startHour, startMinute] = dayStartTime.split(':').map(Number);
      
      // Calculate the start of the day
      const dayStart = new Date(now);
      dayStart.setHours(startHour, startMinute, 0, 0);
      
      // If current time is before day start, adjust to previous day
      if (now < dayStart) {
        dayStart.setDate(dayStart.getDate() - 1);
      }

      // Calculate milliseconds since day start
      const msSinceDayStart = now.getTime() - dayStart.getTime();
      
      // Convert to total beats (1 day = 100,000 beats)
      const totalBeats = Math.floor((msSinceDayStart / 86400000) * 100000);

      const episode = Math.floor(totalBeats / 100000);
      const quest = Math.floor((totalBeats % 100000) / 10000);
      const moment = Math.floor((totalBeats % 10000) / 100);
      const beat = totalBeats % 100;

      setDecimalTime({ episode, quest, moment, beat });
    };

    // Update immediately and then every 864 milliseconds (1 beat)
    updateDecimalTime();
    const intervalId = setInterval(updateDecimalTime, 864);

    return () => clearInterval(intervalId);
  }, [birthday, dayStartTime]);

  const combinedDecimalTime = decimalTime.quest * 1000000 + decimalTime.moment * 10000 + decimalTime.beat * 100;
  const decimalTimeString = combinedDecimalTime.toString().padStart(7, '0');

  const calculateProgress = (current: number, total: number) => {
    const percentage = Math.floor((current / total) * 100);
    return {
      percentage: Math.min(100, Math.max(0, percentage)),
      width: `${Math.min(100, Math.max(0, percentage))}%`
    };
  };

  const yearProgress = calculateProgress(mindfulTime.chapter * 28 + mindfulTime.arc * 7 + mindfulTime.episode, 364);
  const chapterProgress = calculateProgress((mindfulTime.arc - 1) * 7 + mindfulTime.episode, 28);
  
  // New arc progress calculation
  const episodeCompletion = (decimalTime.quest * 10000 + decimalTime.moment * 100 + decimalTime.beat) / 100000;
  const arcProgress = calculateProgress(
    ((mindfulTime.episode - 1) % 7) + episodeCompletion,
    7
  );
  
  const episodeProgress = calculateProgress(decimalTime.quest * 10000 + decimalTime.moment * 100 + decimalTime.beat, 100000);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800 text-black dark:text-white">
      <h1 className="text-4xl font-bold mb-8">Mindful Time</h1>
      
      <div className="mb-8 flex gap-4">
        <div>
          <label htmlFor="birthday" className="block mb-2">Birthday:</label>
          <input
            type="date"
            id="birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="border p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="dayStartTime" className="block mb-2">Day Start Time:</label>
          <input
            type="time"
            id="dayStartTime"
            value={dayStartTime}
            onChange={(e) => setDayStartTime(e.target.value)}
            className="border p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          />
        </div>
      </div>

      <div className="text-xl mb-4 w-full max-w-md">
        <h2 className="text-center text-sm mb-1">Quest / Moment / Beat</h2>
        <p className="text-6xl font-bold text-center mb-4">
          {decimalTime.quest}:{decimalTime.moment}:{decimalTime.beat < 10 ? `0${decimalTime.beat}` : decimalTime.beat}
        </p>
        
        <div className="mb-2">
          <p>Episode: {mindfulTime.episode}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-red-600 h-2.5 rounded-full" style={{ width: episodeProgress.width }}></div>
          </div>
          <p className="text-sm text-right">{episodeProgress.percentage}%</p>
        </div>
        <div className="mb-2">
          <p>Arc: {mindfulTime.arc}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: arcProgress.width }}></div>
          </div>
          <p className="text-sm text-right">{arcProgress.percentage}%</p>
        </div>
        <div className="mb-2">
          <p>Chapter: {mindfulTime.chapter}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: chapterProgress.width }}></div>
          </div>
          <p className="text-sm text-right">{chapterProgress.percentage}%</p>
        </div>
        <div className="mb-2">
          <p>Year: {mindfulTime.year}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: yearProgress.width }}></div>
          </div>
          <p className="text-sm text-right">{yearProgress.percentage}%</p>
        </div>
        <p>Decimal Time: 0.{decimalTimeString}</p>
      </div>

    </div>
  );
}
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Context } from '../context/Context'
import { useNavigate } from 'react-router-dom';
import download from '../assets/download.gif';
import download2 from '../assets/download1.gif';


function Home() {


  const { userdata, logout, loading, geminiresponse } = useContext(Context);
  const navigate = useNavigate();

const recognitionRef=useRef(null);
const isRecognizingRef = useRef(false);
const [isRecognizing, setIsRecognizing] = useState(false);
const [listening,setlistening]=useState(false);
    // Speak text with a kinder voice: cancel ongoing speech, pick a soft voice,
    // slow down rate slightly, and split long text into sentence chunks.
    const splitTextIntoChunks = (text, maxChars = 250) => {
      // split by sentence boundaries where possible
      const sentences = text.match(/[^.!?]+[.!?\u2026]?|[^.!?]+$/g) || [text];
      const chunks = [];
      let cur = '';
      for (const s of sentences) {
        if ((cur + ' ' + s).trim().length <= maxChars) {
          cur = (cur + ' ' + s).trim();
        } else {
          if (cur) chunks.push(cur);
          cur = s.trim();
        }
      }
      if (cur) chunks.push(cur.trim());
      return chunks;
    };

    const getPreferredVoice = () => {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices ? synth.getVoices() : [];
      if (!voices || !voices.length) return null;
      // prefer non-robotic, natural-sounding voices; prefer English
      const prefs = ['Samantha','Google UK Female','Google US English','en-US','en-GB','Female','female','Amy','Alloy'];
      for (const p of prefs) {
        const v = voices.find(v => (v.name && v.name.includes(p)) || (v.lang && v.lang.includes(p)));
        if (v) return v;
      }
      // fallback: prefer voices with 'female' in name or lang en
      let v = voices.find(v => /female/i.test(v.name || '')) || voices.find(v => /en(-|_)?/i.test(v.lang || ''));
      return v || voices[0];
    };

    const speak = (text) => {
      if (!text) return;
      const synth = window.speechSynthesis;
      if (!synth) {
        console.warn('SpeechSynthesis not supported');
        return;
      }

      // Cancel any ongoing speech to make the assistant more responsive and polite
      try {
        if (synth.speaking || synth.pending) synth.cancel();
      } catch (e) {
        console.warn('Failed to cancel existing speech', e);
      }

      // ensure voices are loaded (some browsers load asynchronously)
      let voice = getPreferredVoice();
      if (!voice) {
        // try to wait briefly for voices to load
        const waitUntilVoices = new Promise((resolve) => {
          let loaded = false;
          const onVoicesChanged = () => {
            if (loaded) return;
            loaded = true;
            synth.removeEventListener('voiceschanged', onVoicesChanged);
            resolve(getPreferredVoice());
          };
          synth.addEventListener('voiceschanged', onVoicesChanged);
          // timeout in 250ms
          setTimeout(() => {
            if (!loaded) {
              synth.removeEventListener('voiceschanged', onVoicesChanged);
              resolve(getPreferredVoice());
            }
          }, 250);
        });
        // eslint-disable-next-line no-await-in-loop
        // synchronously block until promise resolves by using then (we don't await here to keep API sync)
        // but assign voice when resolved
        waitUntilVoices.then(v => { voice = v; });
      }

      const chunks = splitTextIntoChunks(String(text));
      // speak chunks sequentially
      const speakChunk = (idx) => {
        if (idx >= chunks.length) return;
        const u = new SpeechSynthesisUtterance(chunks[idx]);
        if (voice) u.voice = voice;
        u.rate = 0.95; // slightly slower for kinder tone
        u.pitch = 0.95;
        u.volume = 1;
        u.lang = (voice && voice.lang) ? voice.lang : 'en-US';
        u.onend = () => {
          // slight delay between chunks for natural pacing
          setTimeout(() => speakChunk(idx + 1), 120);
        };
        // ignore harmless 'interrupted' errors which happen when we cancel previous utterances
        u.onerror = (e) => {
          try {
            const err = e && e.error ? e.error : (e && e.message ? e.message : null);
            if (err === 'interrupted') return;
          } catch (ee) {}
          console.warn('Speech error', e);
        };
        // defensive no-ops for other events
        u.onpause = () => {};
        u.onresume = () => {};
        u.onmark = () => {};
        // small timeout after cancel to reduce race with previous utterance error events
        setTimeout(() => {
          try { synth.speak(u); } catch (e) { console.warn('speak failed', e); }
        }, 30);
      };

      // start speaking first chunk
      speakChunk(0);
    };
    // refs and state for timers, alarms, notes and audio
    const timersRef = useRef({});
    const alarmsRef = useRef({});
    const remindersRef = useRef({});
    const audioRef = useRef(new Audio());
    const [playlist, setPlaylist] = useState([]); // optional playlist URLs
    const [currentIndex, setCurrentIndex] = useState(0);
    const [notes, setNotes] = useState(() => {
      try {
        const raw = localStorage.getItem('assistant_notes');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    });

    useEffect(() => {
      try { localStorage.setItem('assistant_notes', JSON.stringify(notes)); } catch (e) {}
    }, [notes]);

    const saveNote = (text) => {
      if (!text) return;
      const newNotes = [{ id: Date.now(), text }, ...notes];
      setNotes(newNotes);
      speak('Note saved.');
    }

    const readNotes = () => {
      if (!notes.length) {
        speak('You have no notes.');
        return;
      }
      const combined = notes.slice(0,5).map((n, i) => `Note ${i+1}: ${n.text}`).join('. ');
      speak(combined);
    }

    const openUrl = (url) => {
      try { window.open(url, '_blank'); } catch (e) { console.warn(e); }
    }

    const scheduleTimer = (id, ms, label) => {
      if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
      const tid = setTimeout(() => {
        speak(label || 'Timer finished');
        delete timersRef.current[id];
      }, ms);
      timersRef.current[id] = tid;
      speak(`Timer set for ${Math.round(ms/1000)} seconds`);
    }

    const cancelTimer = (id) => {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
        speak('Timer cancelled');
      } else speak('No such timer');
    }

    const scheduleAlarm = (id, whenMs, label) => {
      const now = Date.now();
      let ms = whenMs - now;
      if (ms < 0) ms += 24 * 60 * 60 * 1000; // schedule next day if past
      if (alarmsRef.current[id]) clearTimeout(alarmsRef.current[id]);
      const aid = setTimeout(() => {
        speak(label || 'Alarm ringing');
        delete alarmsRef.current[id];
      }, ms);
      alarmsRef.current[id] = aid;
      speak('Alarm scheduled');
    }

    const handlecommand=async(command)=>{
      if (!command) return;
      const {type, userInput, response} = command;
      // always speak assistant natural response when provided
      if (response) speak(response);

      const q = (userInput || '').trim();

      switch (type) {
      

        case 'google_search':
          openUrl(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
          break;

        case 'youtube_search':
        case 'youtube_play':
          // open YouTube search; playing a specific video requires a URL
          openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
          break;

        case 'calculator_open':
          openUrl('https://www.google.com/search?q=calculator');
          break;

        case 'instagram_open':
          openUrl('https://www.instagram.com');
          break;

        case 'facebook_open':
          openUrl('https://www.facebook.com');
          break;

        case 'weather_show': {
          const loc = q || '';
          openUrl(`https://www.google.com/search?q=weather+${encodeURIComponent(loc)}`);
          break;
        }

        case 'set_alarm': {
          // expect userInput to contain a time like HH:MM or natural language
          // naive parse: look for HH:MM
          const timeMatch = q.match(/(\d{1,2}):(\d{2})/);
          let when = Date.now();
          if (timeMatch) {
            let hh = parseInt(timeMatch[1], 10);
            const mm = parseInt(timeMatch[2], 10);
            const now = new Date();
            const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
            when = target.getTime();
          } else {
            // fallback: try to parse a Date
            const parsed = Date.parse(q);
            if (!isNaN(parsed)) when = parsed;
            else when = Date.now() + 60 * 1000; // 1 minute
          }
          scheduleAlarm('alarm_' + Date.now(), when, q);
          break;
        }

        case 'set_reminder': {
          // similar to alarm but include message
          const id = 'reminder_' + Date.now();
          const parsed = Date.parse(q);
          const when = isNaN(parsed) ? Date.now() + 60000 : parsed;
          const msg = q || 'Reminder';
          const rid = setTimeout(() => {
            speak(msg);
            delete remindersRef.current[id];
          }, when - Date.now());
          remindersRef.current[id] = rid;
          speak('Reminder set');
          break;
        }

        case 'open_maps':
          openUrl(`https://www.google.com/maps/search/${encodeURIComponent(q)}`);
          break;

        case 'get_directions':
          // expects userInput like 'from A to B' or destination only
          openUrl(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`);
          break;

        case 'news_show':
          openUrl(`https://news.google.com/search?q=${encodeURIComponent(q)}`);
          break;

        case 'play_music': {
          if (q.startsWith('http')) {
            audioRef.current.src = q;
            audioRef.current.play().catch(() => {});
          } else {
            openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
          }
          break;
        }

        case 'pause_music':
          audioRef.current.pause();
          break;

        case 'next_song': {
          const next = Math.min(currentIndex + 1, playlist.length - 1);
          setCurrentIndex(next);
          if (playlist[next]) { audioRef.current.src = playlist[next]; audioRef.current.play().catch(()=>{}); }
          break;
        }

        case 'previous_song': {
          const prev = Math.max(currentIndex - 1, 0);
          setCurrentIndex(prev);
          if (playlist[prev]) { audioRef.current.src = playlist[prev]; audioRef.current.play().catch(()=>{}); }
          break;
        }

        case 'open_whatsapp':
          // open WhatsApp web/mobile with optional prefilled text
          if (q) openUrl(`https://wa.me/?text=${encodeURIComponent(q)}`);
          else openUrl('https://web.whatsapp.com');
          break;

        case 'send_message':
          // open WhatsApp or SMS depending on content
          openUrl(`https://wa.me/?text=${encodeURIComponent(q)}`);
          break;

        case 'make_call':
          // opens dialer
          openUrl(`tel:${encodeURIComponent(q)}`);
          break;

        case 'translation':
          // open Google Translate with text
          openUrl(`https://translate.google.com/?text=${encodeURIComponent(q)}`);
          break;

        case 'smart_home_control':
          // placeholder: in real app you'd call smart-home API
          speak('Smart home control executed');
          break;

        case 'notes_create':
          saveNote(q);
          break;

        case 'notes_read':
          readNotes();
          break;

        case 'calendar_event': {
          // open Google Calendar event creation with title/body if possible
          const title = encodeURIComponent(q || 'Event');
          openUrl(`https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}`);
          break;
        }

        case 'timer_set': {
          // parse seconds from userInput; expect like '5 minutes' or '30 seconds'
          const m = q.match(/(\d+)\s*(second|minute|hour)/i);
          let ms = 60000; // default 1 minute
          if (m) {
            const n = parseInt(m[1], 10);
            const unit = m[2].toLowerCase();
            if (unit.startsWith('second')) ms = n * 1000;
            else if (unit.startsWith('minute')) ms = n * 60 * 1000;
            else if (unit.startsWith('hour')) ms = n * 60 * 60 * 1000;
          }
          scheduleTimer('timer_' + Date.now(), ms, q);
          break;
        }

        case 'timer_cancel':
          // try cancel last timer
          const keys = Object.keys(timersRef.current);
          if (keys.length) cancelTimer(keys[keys.length-1]);
          else speak('No active timers');
          break;

        case 'email_send': {
          // Try to extract recipient, subject and body from userInput with simple heuristics.
          // Supported mini-syntax (not strict): "to: alice@example.com; subject: Hello; body: Message here"
          let to = '';
          let subject = '';
          let body = '';

          // detect email-like token
          const emailMatch = q.match(/([\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})/);
          if (emailMatch) to = emailMatch[1];

          const subjMatch = q.match(/subject\s*[:\-]\s*([^;]+)/i);
          if (subjMatch) subject = subjMatch[1].trim();

          const bodyMatch = q.match(/body\s*[:\-]\s*([^;]+)/i);
          if (bodyMatch) body = bodyMatch[1].trim();

          // If body not explicitly provided, use the remainder of the text (excluding 'to' and 'subject' parts)
          if (!body) {
            // remove detected parts
            let remainder = q.replace(/([\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})/, '');
            remainder = remainder.replace(/subject\s*[:\-]\s*([^;]+)/i, '');
            remainder = remainder.replace(/body\s*[:\-]\s*([^;]+)/i, '');
            body = remainder.trim();
          }

          const params = [];
          if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
          if (body) params.push(`body=${encodeURIComponent(body)}`);
          const paramStr = params.length ? `?${params.join('&')}` : '';

          const mailto = `mailto:${encodeURIComponent(to)}${paramStr}`;
          openUrl(mailto);
          break;
        }

        default:
          // unknown type - fallback to opening a web search
           
          break;
      }
    }
  



  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current=recognition;

  const safeStartRecognition = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isRecognizingRef.current) return; // already recognizing
    try {
      rec.start();
      isRecognizingRef.current = true;
      setIsRecognizing(true);
      console.log('Safely started recognition');
    } catch (error) {
      console.warn('safeStartRecognition failed', error);
    }
  };

  const safeStopRecognition = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch (e) {}
    isRecognizingRef.current = false;
    setIsRecognizing(false);
    console.log('Safely stopped recognition');
  };

    

    recognition.onresult = async (e) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript.trim();
      console.log('Speech recognized:', text);
     if (text) {
       setIsRecognizing(false);
     }

      if (text.toLowerCase().includes(userdata?.assistantName?.toLowerCase())) {
        const data = await geminiresponse(text);
        console.log('gemini response:', data);
        // Handle error shapes returned by Context.geminiresponse
        if (!data) {
          speak('Sorry, I did not get a response from the assistant.');
          return;
        }
        if (data.err) {
          console.warn('Gemini request error:', data.err);
          speak('Sorry, I could not reach the assistant. Please try again.');
          return;
        }
        // Backend may return an error object with message
        if (data.message && !data.type) {
          console.warn('Assistant backend message:', data.message);
          speak(data.message || 'Sorry, something went wrong.');
          return;
        }
        // If the response doesn't include a type, let the user know
        if (!data.type) {
          console.warn('Assistant returned no type:', data);
          speak('I received an unexpected response from the assistant.');
          return;
        }
        // Otherwise handle the command
        handlecommand(data);
      }
      // TODO: handle recognized text (e.g., send to assistant)
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error', event && event.error);
      // mark not recognizing so safe start can retry
      isRecognizingRef.current = false;
      setIsRecognizing(false);
      // try to restart after a small delay
      setTimeout(() => safeStartRecognition(), 300);
    };

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setIsRecognizing(true);
      console.log('recognition.onstart');
    };

    recognition.onend = () => {
      // mark stopped and try to restart safely after brief delay
      isRecognizingRef.current = false;
      setIsRecognizing(false);
      console.log('recognition.onend — attempting restart');
      setTimeout(() => safeStartRecognition(), 300);
    };

    try {
      // start via safe starter
      recognitionRef.current = recognition;
      safeStartRecognition();
    } catch (e) {
      console.warn('Speech recognition start failed', e);
    }

    return () => {
      try {
        if (recognition) {
          recognition.onend = null;
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onstart = null;
          try { recognition.stop(); } catch (e) {}
        }
      } catch (err) {}
      recognitionRef.current = null;
      isRecognizingRef.current = false;
    };
  }, []);


  const handlelogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-t from-black to-[#030353]">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userdata) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-t from-black to-[#030353]">
        <h1 className="text-amber-50 text-2xl">Loading your assistant...</h1>
      </div>
    );
  }


 

  return (
    <>
      <div className='min-h-screen w-full bg-gradient-to-t from-black to-[#030353] flex items-center justify-center p-6 flex-col gap-[15px]'>
        <button className='absolute top-[20px] right-[30px] w-[170px] h-[50px] mt-5 bg-sky-200 hover:bg-amber-50 text-black font-semibold rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-sky-500/25 flex items-center justify-center' onClick={() => {
          navigate("/customize")
        }}>Customize Assistant</button>
        <button className='absolute top-[80px] right-[30px] w-[170px] h-[50px] mt-5 bg-sky-200 hover:bg-amber-50 text-black font-semibold rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-sky-500/25 flex items-center justify-center' onClick={handlelogout}>Logout</button>

        <div className='h-[300px] w-[200px] flex justify-center items-center overflow-hidden rounded-4xl border-[2px] border-amber-50'>
          {userdata?.assistantImage ? (
            <img src={userdata.assistantImage} alt={userdata.assistantName || 'Assistant'} className='h-[300px] w-[200px] object-cover' />
          ) : (
            <div className='h-[300px] w-[200px] flex items-center justify-center bg-gray-200 text-gray-600'>
              No Image
            </div>
          )}
        </div>

        <h1 className=' text-amber-50'>{`I am ${userdata?.assistantName || 'your assistant'}`}</h1>

        <div className=' mt-6 w-[300px] h-[200px] rounded-full flex justify-center overflow-hidden bg-transparent '>
          {isRecognizing ? (
            <img src={download} alt="listening" className='bg-transparent' />
          ) : (
            <img src={download2} alt="idle" className='bg-transparent' />
          )}
        </div>

      </div>
    </>
  );
}

export default Home

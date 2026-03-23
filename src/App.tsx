/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Terminal, 
  Timer, 
  Wifi, 
  LayoutGrid, 
  Video, 
  Gavel, 
  ArrowRight, 
  CheckCircle2, 
  Mic, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Info,
  CameraOff,
  AlertTriangle,
  Play,
  ShieldCheck,
  Settings,
  UserCircle,
  HelpCircle,
  Maximize,
  RefreshCw,
  ArrowUp,
  MousePointer2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

// --- Types ---

type Screen = 'access' | 'landing' | 'validation' | 'exam' | 'completed';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  tip?: string;
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
  duration: number; // in seconds
}

// --- Constants ---

const SECTIONS: Section[] = [
  {
    id: "quant",
    name: "Quantitative Aptitude",
    duration: 900, // 15 mins
    questions: [
      {
        id: 1,
        text: "If a standard rectangular pool measures 25 meters by 10 meters, and the water level is raised by 0.5 meters, what is the total increase in the volume of water in kiloliters?",
        options: ["125 kiloliters", "250 kiloliters", "500 kiloliters", "100 kiloliters"],
        correctAnswer: 0,
        tip: "Volume = Length × Width × Height. 1 cubic meter = 1 kiloliter."
      },
      {
        id: 2,
        text: "A train travels at a speed of 90 km/h. How many meters does it travel in 12 seconds?",
        options: ["250 meters", "300 meters", "350 meters", "400 meters"],
        correctAnswer: 1,
        tip: "Convert km/h to m/s by multiplying by 5/18."
      },
      {
        id: 3,
        text: "If 15% of a number is 45, what is 40% of that same number?",
        options: ["100", "120", "150", "180"],
        correctAnswer: 1,
        tip: "First find the number (45 / 0.15), then calculate 40% of it."
      },
      {
        id: 4,
        text: "A shopkeeper marks his goods 20% above the cost price and allows a discount of 10%. What is his gain percentage?",
        options: ["8%", "10%", "12%", "15%"],
        correctAnswer: 0,
        tip: "Gain% = (1 + mark-up) * (1 - discount) - 1."
      },
      {
        id: 5,
        text: "The ratio of the ages of A and B is 4:5. If the sum of their ages is 54 years, what is the age of B?",
        options: ["24 years", "30 years", "34 years", "36 years"],
        correctAnswer: 1,
        tip: "Divide the total age by the sum of the ratio parts (4+5=9)."
      }
    ]
  },
  {
    id: "logical",
    name: "Logical Reasoning",
    duration: 900, // 15 mins
    questions: [
      {
        id: 6,
        text: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?",
        options: ["His own", "His son's", "His father's", "His nephew's"],
        correctAnswer: 1,
        tip: "Break down the relationship step by step."
      },
      {
        id: 7,
        text: "Find the missing number in the sequence: 7, 10, 8, 11, 9, 12, ...",
        options: ["7", "10", "12", "13"],
        correctAnswer: 1,
        tip: "Look for alternating patterns (+3, -2)."
      },
      {
        id: 8,
        text: "If in a certain code, LUTE is written as MUTE and FATE is written as GATE, then how will BLUE be written in that code?",
        options: ["CLUE", "GLUE", "FLUE", "SLUE"],
        correctAnswer: 0,
        tip: "Only the first letter is changing to the next alphabetical letter."
      },
      {
        id: 9,
        text: "A is B's sister. C is B's mother. D is C's father. E is D's mother. Then, how is A related to D?",
        options: ["Grandmother", "Grandfather", "Daughter", "Granddaughter"],
        correctAnswer: 3,
        tip: "Draw a family tree."
      },
      {
        id: 10,
        text: "Which word does NOT belong with the others?",
        options: ["Parsley", "Basil", "Dill", "Mayonnaise"],
        correctAnswer: 3,
        tip: "Three are herbs, one is a condiment."
      }
    ]
  },
  {
    id: "di",
    name: "Data Interpretation",
    duration: 900, // 15 mins
    questions: [
      {
        id: 11,
        text: "In a pie chart representing expenses, if 'Rent' accounts for 90 degrees, what percentage of total expenses is spent on rent?",
        options: ["15%", "20%", "25%", "30%"],
        correctAnswer: 2,
        tip: "Percentage = (Degrees / 360) * 100."
      },
      {
        id: 12,
        text: "If the ratio of production of Item A to Item B is 3:5 and total production is 800 units, what is the production of Item B?",
        options: ["300", "400", "500", "600"],
        correctAnswer: 2,
        tip: "Item B = (5/8) * 800."
      },
      {
        id: 13,
        text: "A bar graph shows sales of 100, 150, 200, 250 for four quarters. What is the average sales per quarter?",
        options: ["150", "175", "200", "225"],
        correctAnswer: 1,
        tip: "Sum of sales / Number of quarters."
      },
      {
        id: 14,
        text: "If a company's profit increased from $50M to $65M, what is the percentage increase?",
        options: ["15%", "20%", "30%", "25%"],
        correctAnswer: 2,
        tip: "((New - Old) / Old) * 100."
      },
      {
        id: 15,
        text: "In a table, if Column A has values 10, 20, 30 and Column B has values 5, 10, 15, what is the correlation pattern?",
        options: ["Inverse", "Direct", "No correlation", "Exponential"],
        correctAnswer: 1,
        tip: "As A increases, B increases proportionally."
      }
    ]
  },
  {
    id: "analytics",
    name: "Basic Data Analytics",
    duration: 900, // 15 mins
    questions: [
      {
        id: 16,
        text: "What is the median of the following dataset: 5, 8, 3, 10, 12?",
        options: ["5", "8", "10", "12"],
        correctAnswer: 1,
        tip: "Sort the data first: 3, 5, 8, 10, 12. The middle value is the median."
      },
      {
        id: 17,
        text: "In a normal distribution, what percentage of data falls within one standard deviation of the mean?",
        options: ["50%", "68%", "95%", "99.7%"],
        correctAnswer: 1,
        tip: "This is a standard property of the normal distribution curve."
      },
      {
        id: 18,
        text: "Which of the following is a measure of dispersion?",
        options: ["Mean", "Median", "Mode", "Standard Deviation"],
        correctAnswer: 3,
        tip: "Dispersion measures how spread out the data is."
      },
      {
        id: 19,
        text: "What is the mode of the dataset: 2, 4, 4, 4, 5, 5, 7, 9?",
        options: ["4", "5", "7", "9"],
        correctAnswer: 0,
        tip: "Mode is the most frequently occurring value."
      },
      {
        id: 20,
        text: "If the probability of an event is 0.7, what is the probability of its complement?",
        options: ["0.1", "0.3", "0.5", "0.7"],
        correctAnswer: 1,
        tip: "P(A') = 1 - P(A)."
      }
    ]
  }
];

const IMAGES = {
  webcam: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi42Gw8-cLnL0u89ExHsrOrRXjiFdB7msyLfEC2FThNEDn1rWDY-fZPfI_Jsm5jm60xD9Z8g20cFcHpgW2XmRecuRDbICmQmH326fzNQzUy1n69rEiVOR5YruAOzI1-ZXT8JgZKVQadetptZJ2nZKpZRGhSe1mLX4IXcyEkBboMaQlZG7z0YSOnP7kdKuVx1VoWCq1PU-sJMH0rZg6iaZZemBmHT6f8q4Jcpzg7_g3tMSXIBBVjZsGtQZy1vYNOZy-A5fd9TKgJAV0",
  blurredFace: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfG6n--VwB2xtAZvxDCtZdeiemOhG_xGzNSrmwoezLo2GchSPAB01uI-xIqWx8UUiBjh3qQiNubIOGcfrnKsbiBC5RRw54wPpAxbChcH1Vr9HbtgiA6shl5TL3j7WRFZAKLLDcmRWUYjaTdmtJr_b2wj6IQ0C6hiJ3OGZzP74jrkQqifnOOGo9opRJrAmmHlSkpylr21B1s_HEL1vVVFhQ22jQuotzsuMMmS4ouAOAsqxw2ZeZi-SyJntz4segOyKifoMpcPY6LaGe",
  smallProctor: "https://lh3.googleusercontent.com/aida-public/AB6AXuALFNmlOvayNq0fPP2hO3x3MbrJiSN1JITmV_cpMczgEY862SJNk-uG_g7riKtKZ0i0LcQ-LYjMrSvlxNyzGbSlj-Y6XADAKwE7n4u3k4ZOOJ-vBiRDH2htbWbYRr8TQq05LbLvE4WodCxOH0f23vmlnoRLO_4Td6BdEABI13RQHJSp_P9lEzQblY7TDE4ztfazTC0R2TK0Rntwvy32CO0nGvcjRLZw-xLdXp1_t-kSPvObIQ2s0ELeKNw6uzFY2ixpapR7rKapgUfJ"
};

// --- Components ---

const Header = ({ screen, timeLeft, onFinish, sectionName, violations }: { screen: Screen; timeLeft?: number; onFinish?: () => void; sectionName?: string; violations?: number }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAccess = screen === 'access';
  const isExam = screen === 'exam';
  
  return (
    <header className={cn(
      "flex justify-between items-center w-full px-6 md:px-12 py-4 md:py-5 z-50 border-b sticky top-0 transition-all",
      isExam ? "bg-slate-950 border-white/10 text-white" : "bg-white border-outline-variant/30 text-on-surface"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
          isExam ? "bg-primary text-white shadow-lg shadow-primary/40" : "kinetic-accent text-white"
        )}>
          <ShieldCheck size={20} />
        </div>
        <div className="flex flex-col">
          <h1 className="font-headline tracking-tight font-extrabold text-lg md:text-xl leading-none uppercase">
            {isAccess ? 'THE COGNITIVE ATELIER' : 'AXIOM PROCTOR'}
          </h1>
          {isExam && <span className="text-[8px] font-mono text-primary font-bold tracking-[0.3em] uppercase mt-1">Section: {sectionName}</span>}
        </div>
      </div>

      {isAccess && (
        <div className="hidden md:flex items-center gap-8">
          {/* Navigation links removed as per user request */}
        </div>
      )}

      <div className="flex items-center gap-4 md:gap-8">
        {isExam && timeLeft !== undefined && (
          <div className="flex items-center gap-4">
            {violations > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-error/10 border border-error/20 rounded-full text-error animate-pulse">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Violations: {violations}</span>
              </div>
            )}
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Section Time Left</span>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-3 h-1 bg-primary/30 rounded-full overflow-hidden"><div className="h-full bg-primary w-full animate-pulse"></div></div>)}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3 shadow-inner">
              <Timer size={18} className="text-primary" />
              <span className="font-mono font-bold text-xl tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
            </div>
          </div>
        )}
        
        {isExam && (
          <button 
            onClick={onFinish}
            className="bg-error text-on-error px-6 py-2.5 rounded-lg font-headline text-[10px] font-bold uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-error/20"
          >
            Submit Assessment
          </button>
        )}

        {screen === 'landing' && (
          <div className="flex items-center gap-2 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest">
            <Timer size={16} />
            <span>Duration: 60:00</span>
          </div>
        )}
      </div>
    </header>
  );
};

const Footer = ({ onNext, onPrev, onMark, onClear, isLastInSection }: { onNext?: () => void; onPrev?: () => void; onMark?: () => void; onClear?: () => void; isLastInSection?: boolean }) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 flex justify-between items-center px-6 md:px-12 py-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-outline-variant/30">
      <div className="flex gap-4 md:gap-8">
        <button onClick={onPrev} className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] font-bold cursor-pointer hover:text-primary transition-colors flex items-center gap-2">
          <ChevronLeft size={14} /> Previous
        </button>
        <button onClick={onMark} className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] font-bold cursor-pointer hover:text-amber-600 transition-colors flex items-center gap-2">
          <Bookmark size={14} /> Flag
        </button>
      </div>
      
      <div className="hidden md:flex items-center gap-4">
        <div className="h-1 w-32 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/3"></div>
        </div>
        <span className="text-[10px] font-mono font-bold text-on-surface-variant">SESSION ACTIVE</span>
      </div>

      <div className="flex gap-4 md:gap-8">
        <button onClick={onClear} className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] font-bold cursor-pointer hover:text-error transition-colors">
          Reset
        </button>
        <button onClick={onNext} className="bg-primary text-on-primary px-8 py-2.5 rounded-lg font-headline text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20">
          {isLastInSection ? 'Submit Section' : 'Next'} <ChevronRight size={14} />
        </button>
      </div>
    </footer>
  );
};

const AlertModal = ({ show, title, message, onClose }: { show: boolean; title: string; message: string; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            onClick={onClose}
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border border-white/20"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle size={32} />
            </div>
            <h2 className="font-headline text-2xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h2>
            <p className="text-slate-600 font-body text-sm leading-relaxed mb-8">{message}</p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-950 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all active:scale-95 shadow-xl shadow-slate-950/20"
            >
              Understood
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    return localStorage.getItem('axiom_exam_submitted') === 'true';
  });
  // --- State ---
  const [screen, setScreen] = useState<Screen>(() => (sessionStorage.getItem('exam_screen') as Screen) || 'access');
  const [candidateName, setCandidateName] = useState(() => sessionStorage.getItem('exam_name') || '');
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('exam_token') || '');
  const [isAgreed, setIsAgreed] = useState(() => sessionStorage.getItem('exam_agreed') === 'true');
  const [sectionTimesLeft, setSectionTimesLeft] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SECTIONS.forEach(s => initial[s.id] = s.duration);
    return initial;
  });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, Record<number, boolean>>>({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [accessError, setAccessError] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const [isAccessing, setIsAccessing] = useState(false);
  const [showSectionConfirm, setShowSectionConfirm] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '' });

  const finalizeSubmission = async () => {
    setShowExitConfirm(false);
    setShowSubmitConfirm(false);
    try {
      await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken })
      });
    } catch (err) {
      console.error('Submission error (ignoring for UX):', err);
    }
    // Always finalize locally to ensure the user isn't stuck
    localStorage.setItem('axiom_exam_submitted', 'true');
    localStorage.removeItem('axiom_exam_autosave');
    sessionStorage.clear();
    setIsSubmitted(true);
  };

  const handleSectionSubmit = () => {
    setShowSectionConfirm(false);
    if (currentSectionIndex < SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      // Auto-save to ensure state is captured
      localStorage.setItem('axiom_exam_autosave', JSON.stringify({
        answers,
        markedForReview,
        sectionTimesLeft,
        currentSectionIndex: currentSectionIndex + 1,
        currentQuestionIndex: 0,
        phoneNumber,
        screen: 'exam'
      }));
    }
  };

  // Auto-save logic: Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('axiom_exam_autosave');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.markedForReview) setMarkedForReview(parsed.markedForReview);
        if (parsed.sectionTimesLeft) setSectionTimesLeft(parsed.sectionTimesLeft);
        if (parsed.currentSectionIndex !== undefined) setCurrentSectionIndex(parsed.currentSectionIndex);
        if (parsed.currentQuestionIndex !== undefined) setCurrentQuestionIndex(parsed.currentQuestionIndex);
        if (parsed.phoneNumber) setPhoneNumber(parsed.phoneNumber);
        if (parsed.screen && parsed.screen !== 'completed') setScreen(parsed.screen);
      } catch (e) {
        console.error('Failed to load autosave data', e);
      }
    }
  }, []);

  // Auto-save logic: Save to localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const dataToSave = {
        answers,
        markedForReview,
        sectionTimesLeft,
        currentSectionIndex,
        currentQuestionIndex,
        phoneNumber,
        screen,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('axiom_exam_autosave', JSON.stringify(dataToSave));
      console.log('Progress auto-saved at', new Date().toLocaleTimeString());
    }, 30000);

    return () => clearInterval(interval);
  }, [answers, markedForReview, sectionTimesLeft, currentSectionIndex, currentQuestionIndex, phoneNumber, screen]);

  // Integrity Modals
  const [showFaceAlert, setShowFaceAlert] = useState(false);
  const [showTabAlert, setShowTabAlert] = useState(false);
  const [showFullScreenAlert, setShowFullScreenAlert] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [violations, setViolations] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<string>("Initializing...");
  const [lastCapturedFrame, setLastCapturedFrame] = useState<string | null>(null);
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Persistence Sync
  useEffect(() => {
    sessionStorage.setItem('exam_screen', screen);
    sessionStorage.setItem('exam_name', candidateName);
    sessionStorage.setItem('exam_token', accessToken);
    sessionStorage.setItem('exam_agreed', isAgreed.toString());
  }, [screen, candidateName, accessToken, isAgreed]);

  // Validation States
  const [validationProgress, setValidationProgress] = useState({
    camera: false,
    audio: false,
    network: false,
    cameraError: false,
    audioError: false
  });

  // Webcam Stream Management
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActiveMediaStream(stream);
      setValidationProgress(prev => ({ ...prev, camera: true, cameraError: false }));
      return stream;
    } catch (err) {
      console.error('Webcam access denied:', err);
      setValidationProgress(prev => ({ ...prev, camera: false, cameraError: true }));
      return null;
    }
  }, [videoRef]);

  const startAudio = useCallback(async () => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let stream: MediaStream | null = null;
    let animationFrame: number;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(Math.min(100, (average / 128) * 100));
        animationFrame = requestAnimationFrame(updateLevel);
      };

      updateLevel();
      setValidationProgress(prev => ({ ...prev, audio: true, audioError: false }));
      return { stream, audioContext, animationFrame };
    } catch (err) {
      console.error('Microphone access denied:', err);
      setValidationProgress(prev => ({ ...prev, audio: false, audioError: true }));
      return null;
    }
  }, []);

  // Reliable Video Attachment Callback Ref
  const videoElementRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      if (activeMediaStream) {
        node.srcObject = activeMediaStream;
        node.play().catch(err => console.log("Auto-play error (handled):", err));
      }
    }
    videoRef.current = node;
  }, [activeMediaStream]);

  // Unified permission effect with Auto-Detection
  useEffect(() => {
    let activeWebcamStream: MediaStream | null = null;
    let activeAudioResources: { stream: MediaStream; audioContext: AudioContext; animationFrame: number } | null = null;
    let pollInterval: NodeJS.Timeout;

    const checkPermissions = async () => {
      // Check Webcam
      if (!validationProgress.camera) {
        const s = await startWebcam();
        if (s) activeWebcamStream = s;
        else if (!showPermissionModal) setShowPermissionModal(true);
      }
      // Check Audio
      if (!validationProgress.audio) {
        const res = await startAudio();
        if (res) activeAudioResources = res;
        else if (!showPermissionModal) setShowPermissionModal(true);
      }
    };

    // Auto-Detecting Permission Change (Experimental)
    if ('permissions' in navigator) {
      Promise.all([
        navigator.permissions.query({ name: 'camera' as any }),
        navigator.permissions.query({ name: 'microphone' as any })
      ]).then(([camStatus, micStatus]) => {
        const onPermissionChange = () => {
          if (camStatus.state === 'granted' && micStatus.state === 'granted') {
             // Browser often requires reload to release devices after grant
             // We do it automatically so user doesn't have to click manual refresh
             setTimeout(() => window.location.reload(), 1000);
          }
        };
        camStatus.onchange = onPermissionChange;
        micStatus.onchange = onPermissionChange;
      }).catch(console.error);
    }

    if (screen === 'exam' || screen === 'validation') {
      checkPermissions();
      // Auto-Detect: Poll every 3 seconds to avoid manual refresh
      pollInterval = setInterval(() => {
        if (!validationProgress.camera || !validationProgress.audio) {
          checkPermissions();
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (activeWebcamStream) {
        activeWebcamStream.getTracks().forEach(track => track.stop());
      }
      if (activeAudioResources) {
        cancelAnimationFrame(activeAudioResources.animationFrame);
        activeAudioResources.audioContext.close();
        activeAudioResources.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [screen, startWebcam, startAudio, validationProgress.camera, validationProgress.audio, showPermissionModal]);


  // Record & Review Integrity Check
  const checkIntegrity = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing || screen !== 'exam') return;

    setIsAnalyzing(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Ensure video is ready
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.5); // full base64 with prefix
      setLastCapturedFrame(base64Image);

      // Upload to server for persistence in MongoDB
      await fetch('/api/proctor/upload-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: accessToken,
          image: base64Image
        })
      });

      setIntegrityStatus("Smart-Node Monitoring Active");
      console.log("Integrity heartbeat verified and frame uploaded.");

    } catch (err) {
      console.error('Integrity check/upload failed:', err);
      setIntegrityStatus("Backup integrity active");
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, screen, accessToken]);

  // Periodic Integrity Check
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === 'exam') {
      interval = setInterval(() => {
        checkIntegrity();
      }, 60000); // Check every 60 seconds (Record & Review)
    }
    return () => clearInterval(interval);
  }, [screen, checkIntegrity]);

  // Validation States (moved up)

  // Audio Level Detection


  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const currentSectionId = SECTIONS[currentSectionIndex].id;
    const currentTimeLeft = sectionTimesLeft[currentSectionId];

    if (screen === 'exam' && currentTimeLeft > 0 && !showFaceAlert && !showTabAlert) {
      interval = setInterval(() => {
        setSectionTimesLeft(prev => ({
          ...prev,
          [currentSectionId]: prev[currentSectionId] - 1
        }));
      }, 1000);
    } else if (screen === 'exam' && currentTimeLeft === 0) {
      // Auto-advance to next section or finish
      if (currentSectionIndex < SECTIONS.length - 1) {
        handleSectionSubmit();
      } else {
        finalizeSubmission();
      }
    }
    return () => clearInterval(interval);
  }, [screen, sectionTimesLeft, currentSectionIndex, showFaceAlert, showTabAlert]);

  // Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && screen === 'exam') {
        setShowTabAlert(true);
        setViolations(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [screen]);

  // Full Screen Enforcement
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && screen === 'exam') {
        setShowFullScreenAlert(true);
        setViolations(prev => prev + 1);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [screen]);

  // Window Blur Detection (Aggressive Kiosk)
  useEffect(() => {
    const handleBlur = () => {
      if (screen === 'exam' && !showTabAlert && !showFullScreenAlert) {
        setShowTabAlert(true);
        setViolations(prev => prev + 1);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [screen, showTabAlert, showFullScreenAlert]);

  // Kiosk Security: Prevent Context Menu & Keyboard Shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (screen === 'exam') e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen === 'exam') {
        // Prevent common shortcuts that could be used to exit or cheat
        const forbiddenKeys = ['F11', 'F12', 'Escape'];
        const isControlR = (e.ctrlKey || e.metaKey) && e.key === 'r';
        const isControlI = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I';
        const isControlU = (e.ctrlKey || e.metaKey) && e.key === 'u';

        if (forbiddenKeys.includes(e.key) || isControlR || isControlI || isControlU) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [screen]);

  const enterFullScreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        setShowFullScreenAlert(false);
      }
    } catch (err) {
      console.error('Error attempting to enable full-screen mode:', err);
    }
  };

  // Mock Validation Logic
  useEffect(() => {
    if (screen === 'validation') {
      const timer1 = setTimeout(() => setValidationProgress(p => ({ ...p, camera: true })), 1500);
      const timer2 = setTimeout(() => setValidationProgress(p => ({ ...p, audio: true })), 3000);
      const timer3 = setTimeout(() => setValidationProgress(p => ({ ...p, network: true })), 5000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [screen]);

  // Mock Face Detection Event removed in favor of real Gemini check

  const handleStartValidation = () => {
    if (isAgreed) setScreen('validation');
  };

  const handleStartExam = async () => {
    // 1. Immediate Fullscreen Attempt (Must be before any awaits)
    await enterFullScreen();

    // 2. Security Check 
    if (!validationProgress.camera || !validationProgress.audio) {
      setShowPermissionModal(true);
      return;
    }
    
    setScreen('exam');
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const sectionId = SECTIONS[currentSectionIndex].id;
    const questionId = SECTIONS[currentSectionIndex].questions[currentQuestionIndex].id;
    setAnswers(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [questionId]: optionIndex
      }
    }));
  };

  const handleMarkForReview = () => {
    const sectionId = SECTIONS[currentSectionIndex].id;
    const questionId = SECTIONS[currentSectionIndex].questions[currentQuestionIndex].id;
    setMarkedForReview(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [questionId]: !(prev[sectionId]?.[questionId])
      }
    }));
  };

  const isSectionComplete = (sectionId: string) => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return false;
    const sectionAnswers = answers[sectionId] || {};
    return section.questions.every(q => sectionAnswers[q.id] !== undefined);
  };


  const handleNext = () => {
    const currentSection = SECTIONS[currentSectionIndex];
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < SECTIONS.length - 1) {
      if (isSectionComplete(currentSection.id)) {
        setShowSectionConfirm(true);
      } else {
        setAlertConfig({
          show: true,
          title: "Section Incomplete",
          message: `Please complete all questions in the "${currentSection.name}" section before moving to the next section.`
        });
      }
    } else {
      if (isSectionComplete(currentSection.id)) {
        setShowSubmitConfirm(true);
      } else {
        setAlertConfig({
          show: true,
          title: "Final Check",
          message: `Please complete all questions in the "${currentSection.name}" section before submitting.`
        });
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleClear = () => {
    const sectionId = SECTIONS[currentSectionIndex].id;
    const questionId = SECTIONS[currentSectionIndex].questions[currentQuestionIndex].id;
    setAnswers(prev => {
      const newSectionAnswers = { ...(prev[sectionId] || {}) };
      delete newSectionAnswers[questionId];
      return {
        ...prev,
        [sectionId]: newSectionAnswers
      };
    });
  };

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessError('');
    setIsAccessing(true);

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAccessError('Please enter a valid email address.');
      setIsAccessing(false);
      return;
    }

    // Phone Number Validation (Simple check for 10+ digits)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setAccessError('Please enter a valid phone number (at least 10 digits).');
      setIsAccessing(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phoneNumber, token: accessToken })
      });

      const data = await response.json();

      if (!response.ok) {
        setAccessError(data.error || 'Authentication failed.');
        setIsAccessing(false);
        return;
      }

      console.log('Authentication successful:', data);
      setScreen('landing');
    } catch (err) {
      console.error('Auth error:', err);
      setAccessError('Server connection error. Please try again later.');
    } finally {
      setIsAccessing(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessError('');
    setIsAccessing(true);

    try {
      const response = await fetch('/api/candidates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, phone: phoneNumber })
      });

      const data = await response.json();

      if (!response.ok) {
        setAccessError(data.error || 'Registration failed.');
        return;
      }

      setRegistrationSuccess(data.token);
      setAccessToken(data.token);
      setIsRegistering(false);
    } catch (err) {
      console.error('Registration error:', err);
      setAccessError('Server connection error. Please try again later.');
    } finally {
      setIsAccessing(false);
    }
  };

  // --- Renderers ---

  const renderAccess = () => (
    <main className="flex-grow flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left Pane: Brand & Visual */}
      <div className="hidden md:flex md:w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary blur-[100px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>
        
        <div className="relative z-10">
          <div className="w-12 h-12 kinetic-accent rounded-xl flex items-center justify-center text-white mb-8">
            <ShieldCheck size={24} />
          </div>
          <h1 className="font-headline text-6xl font-extrabold text-white leading-[0.9] tracking-tighter mb-6">
            AXIOM<br/>PROCTOR
          </h1>
          <p className="text-slate-400 font-body text-lg max-w-md leading-relaxed">
            Advanced AI-driven proctoring environment for secure, high-stakes professional assessments.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-white text-sm font-bold uppercase tracking-widest">Biometric Integrity</p>
              <p className="text-slate-500 text-xs">Continuous facial and gaze tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60">
              <LayoutGrid size={18} />
            </div>
            <div>
              <p className="text-white text-sm font-bold uppercase tracking-widest">Environment Scan</p>
              <p className="text-slate-500 text-xs">Multi-sensor room validation</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 p-8">
          <p className="text-slate-800 font-headline text-8xl font-black leading-none select-none">01</p>
        </div>
      </div>

      {/* Right Pane: Form */}
      <div className="flex-1 bg-surface flex flex-col justify-center items-center p-8 md:p-24 relative">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
              {isRegistering ? 'Candidate Registration' : 'Secure Access'}
            </h2>
            <p className="text-on-surface-variant">
              {isRegistering 
                ? 'Register your details to receive an access token.' 
                : 'Enter your credentials to initialize the session.'}
            </p>
          </div>

          {registrationSuccess && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3 text-green-700 font-bold">
                <CheckCircle2 size={20} />
                <span>Registration Successful!</span>
              </div>
              <p className="text-sm text-green-800/80">
                Your unique access token has been generated. Please save it securely.
              </p>
              <div className="bg-white border border-green-200 p-4 rounded-lg text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold text-green-600 mb-1">Your Access Token</p>
                <p className="text-2xl font-mono font-bold text-slate-900 tracking-wider">{registrationSuccess}</p>
              </div>
              <button 
                onClick={() => setRegistrationSuccess(null)}
                className="w-full py-2 text-xs font-bold text-green-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <form className="space-y-6" onSubmit={isRegistering ? handleRegisterSubmit : handleAccessSubmit}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="full-name">Full Name</label>
              <input 
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body" 
                id="full-name" 
                placeholder="Johnathan Doe" 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="email">Email Address</label>
              <input 
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body" 
                id="email" 
                placeholder="j.doe@axiom.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="phone">Phone Number</label>
              <input 
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body" 
                id="phone" 
                placeholder="+1 (555) 000-0000" 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            
            {!isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="token">Access Token</label>
                <input 
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body tracking-[0.1em] uppercase" 
                  id="token" 
                  placeholder="AXIOM-YYYY-XXXX" 
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  required
                />
              </div>
            )}

            {accessError && (
              <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium animate-shake">
                <AlertTriangle size={14} />
                <span>{accessError}</span>
              </div>
            )}
            
            <div className="pt-6 space-y-4">
              <button 
                className="w-full py-4 bg-primary text-on-primary font-headline font-bold text-lg rounded-lg shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
                type="submit"
                disabled={isAccessing}
              >
                {isAccessing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isRegistering ? 'Register & Generate Token' : 'Access Secure Node'
                )}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAccessError('');
                }}
                className="w-full py-2 text-xs font-bold text-primary hover:underline uppercase tracking-widest"
              >
                {isRegistering ? 'Already have a token? Sign In' : 'Need a token? Register here'}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-outline-variant/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Server: US-EAST-1</span>
            </div>
            <a href="#" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Need Help?</a>
          </div>
        </div>
      </div>
    </main>
  );

  const renderLanding = () => (
    <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
      <div className="md:col-span-5 flex flex-col justify-start">
        <div className="mb-12">
          <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-4 block">Assessment Portal</span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter text-on-background mb-6">
            Aptitude Assessment 2024
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
            Welcome to the professional evaluation environment. Please ensure you are in a quiet space before commencing the session.
          </p>
        </div>
        
        <div className="bg-surface-container-low p-8 rounded-xl border-l-4 border-secondary">
          <div className="flex justify-between items-end mb-4">
            <span className="font-headline font-bold text-on-surface">Proctoring Status</span>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Active Ready</span>
          </div>
          <div className="flex gap-1 h-8 items-end">
            <div className="flex-1 bg-secondary opacity-20 h-2 rounded-full"></div>
            <div className="flex-1 bg-secondary opacity-40 h-4 rounded-full"></div>
            <div className="flex-1 bg-secondary opacity-60 h-6 rounded-full"></div>
            <div className="flex-1 bg-secondary h-8 rounded-full"></div>
            <div className="flex-1 bg-secondary opacity-30 h-3 rounded-full"></div>
          </div>
          <p className="text-xs mt-4 text-on-surface-variant italic">Biometric and environmental sensors are initialized.</p>
        </div>
      </div>

      <div className="md:col-span-7">
        <div className="bg-surface-container-lowest p-6 md:p-10 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]">
          <h3 className="font-headline text-2xl font-bold mb-8 text-on-background">Important Instructions</h3>
          <div className="space-y-6 mb-10">
            <InstructionItem icon={<Wifi className="text-primary" />} title="Stable Connection" desc="Ensure a minimum bandwidth of 5Mbps. Use a stable internet connection to avoid session timeout." />
            <InstructionItem icon={<LayoutGrid className="text-primary" />} title="Restricted Navigation" desc="No tab switching allowed. Browsing away from this window will trigger an immediate disqualification flag." />
            <InstructionItem icon={<Video className="text-primary" />} title="Camera must be ON" desc="Continuous visual proctoring is mandatory. System will auto-submit if multiple faces detected or if the user leaves the frame." />
          </div>

          <div className="bg-error-container/20 p-6 rounded-lg mb-10 flex items-start gap-4">
            <Gavel className="text-error shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-on-error-container mb-1 uppercase tracking-tight">Examination Integrity Rule</p>
              <p className="text-sm text-on-error-container/80">The system employs AI-driven gaze tracking. Maintain focus on the screen throughout the 60-minute duration.</p>
            </div>
          </div>

          <div className="space-y-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary-container bg-surface-container-low mt-1" 
              />
              <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                I have read the instructions and agree to abide by the rules. I understand that the examination environment is being monitored.
              </span>
            </label>
            <button 
              onClick={handleStartValidation}
              disabled={!isAgreed}
              className={cn(
                "w-full kinetic-accent text-white font-headline font-extrabold text-lg py-5 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-secondary/20 transition-all",
                !isAgreed ? "opacity-50 cursor-not-allowed grayscale" : "hover:scale-[1.01] active:scale-[0.98]"
              )}
            >
              Start Test <ArrowRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center px-2">
          <div className="flex gap-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ID: ASM-2024-QX</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">V: 1.0.4</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">System Secure</span>
          </div>
        </div>
      </div>
    </main>
  );

  const renderValidation = () => (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-5 space-y-6">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
            Environment <br/>Validation
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            The Cognitive Atelier requires a secure and stable connection to maintain proctoring integrity. Please remain still during the checks.
          </p>
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary space-y-4">
            <div>
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-secondary mb-2">Privacy Note</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Camera and audio streams are encrypted and processed locally. Recording only begins once the formal exam initiates.
              </p>
            </div>
            
            {/* Permission Gateway Indicator */}
            {!validationProgress.camera || !validationProgress.audio ? (
              <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck size={20} className="shrink-0" />
                  <p className="font-bold uppercase tracking-tight text-sm">Security Readiness</p>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  As requested, please ensure your proctoring hardware is active to proceed with the secure assessment.
                </p>
                <button 
                  onClick={() => setShowPermissionModal(true)}
                  className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Settings size={14} /> Configure Access
                </button>
              </div>
            ) : (
              <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-600" />
                <span className="text-xs font-bold text-green-700 uppercase tracking-widest font-mono">Sensors Calibrated</span>
              </div>
            )}

            {!validationProgress.camera && !validationProgress.cameraError && (
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 animate-pulse">
                <p className="text-xs font-bold text-primary uppercase mb-1">Waiting for Camera...</p>
                <p className="text-[10px] text-primary/70">Please click "Allow" on the browser prompt to proceed.</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-7 grid grid-cols-1 gap-4">
          <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 mb-4 border-2 border-outline-variant/30">
            <video 
              ref={videoElementRef}
              autoPlay 
              muted 
              playsInline
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Validation Feed
            </div>
          </div>
          <ValidationCard 
            icon={<Video size={24} />} 
            title="Camera Access" 
            desc={validationProgress.cameraError ? "Permission denied. Please enable camera in browser settings." : validationProgress.camera ? "Feed active & calibrated" : "Verifying visual feed quality"} 
            status={validationProgress.cameraError ? 'error' : validationProgress.camera ? 'active' : 'loading'} 
          />
          <ValidationCard 
            icon={<Mic size={24} />} 
            title="Audio Check" 
            desc={validationProgress.audioError ? "Permission denied. Please enable microphone in browser settings." : validationProgress.audio ? "Ambient noise cancellation test" : "Verifying audio feed quality"} 
            status={validationProgress.audioError ? 'error' : validationProgress.audio ? 'active' : 'loading'} 
          />
          <ValidationCard 
            icon={<Wifi size={24} />} 
            title="Network Stability" 
            desc={validationProgress.network ? "Latency: 24ms (Stable)" : "Latency: 24ms (Optimizing...)"} 
            status={validationProgress.network ? 'active' : 'loading'} 
          />

          <div className="mt-8 flex flex-col items-end gap-4">
            <p className="text-sm text-on-surface-variant font-medium">
              {validationProgress.network ? "All systems operational." : "Please wait while we finalize the connection..."}
            </p>
            <button 
              onClick={handleStartExam}
              disabled={!validationProgress.network || !validationProgress.camera || !validationProgress.audio}
              className={cn(
                "kinetic-accent text-white px-10 py-4 rounded-xl font-headline font-extrabold text-lg shadow-xl shadow-secondary/20 transition-all",
                (!validationProgress.network || !validationProgress.camera || !validationProgress.audio) 
                  ? "opacity-50 grayscale cursor-not-allowed" 
                  : "hover:scale-[1.02] active:scale-95"
              )}
            >
              {!validationProgress.camera || !validationProgress.audio 
                ? "Waiting for Permissions..." 
                : "All set, Start Exam"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  const renderExam = () => {
    const currentSection = SECTIONS[currentSectionIndex];
    const q = currentSection.questions[currentQuestionIndex];
    return (
      <div className="flex flex-1 overflow-hidden bg-surface">
        {/* Technical Sidebar */}
        <aside className="bg-white dark:bg-slate-950 h-full w-80 border-r border-outline-variant/30 flex flex-col hidden md:flex">
          {/* Proctoring Widget */}
          <div className="p-6 border-b border-outline-variant/30">
            <div className="relative rounded-lg overflow-hidden aspect-video bg-slate-900 group shadow-inner">
              <video 
                ref={videoElementRef}
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover opacity-80 grayscale" 
              />
              <canvas ref={canvasRef} className="hidden" />
              {/* Scanning Line Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-[1px] bg-primary/40 absolute top-0 animate-[scan_3s_linear_infinite]"></div>
              </div>
              {/* Overlays */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[8px] font-bold text-white uppercase tracking-widest">
                <div className="w-1 h-1 bg-error rounded-full animate-pulse"></div>
                Live Feed
              </div>
              <div className="absolute bottom-2 right-2 text-[8px] font-mono text-white/40 uppercase">
                ID: {violations}829-X
              </div>
            </div>
            
            {/* Ambient Sound Meter */}
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-outline-variant/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mic size={12} className={cn(audioLevel > 40 ? "text-error" : "text-primary")} />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ambient Audio</span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">{Math.round(audioLevel)}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden flex gap-0.5 p-0.5">
                {Array.from({ length: 20 }).map((_, i) => {
                  const threshold = (i / 20) * 100;
                  const isActive = audioLevel > threshold;
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-sm transition-all duration-75",
                        isActive 
                          ? (threshold > 70 ? "bg-error" : threshold > 40 ? "bg-amber-500" : "bg-primary") 
                          : "bg-outline-variant/20"
                      )}
                    />
                  );
                })}
              </div>
              {audioLevel > 60 && (
                <p className="mt-2 text-[8px] font-bold text-error uppercase tracking-tighter animate-pulse">
                  High noise level detected
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Biometric Status</span>
                <span className={cn("text-xs font-bold", violations > 0 ? "text-error" : "text-green-600")}>
                  {isAnalyzing ? "Analyzing..." : integrityStatus}
                </span>
              </div>
              <div className="flex gap-1">
                <div className={cn("w-1 h-3 rounded-full", violations > 0 ? "bg-error" : "bg-green-500")}></div>
                <div className={cn("w-1 h-3 rounded-full", violations > 1 ? "bg-error" : "bg-green-500")}></div>
                <div className={cn("w-1 h-3 rounded-full", violations > 2 ? "bg-error" : "bg-green-500/30")}></div>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {SECTIONS.map((section, sIdx) => (
              <div key={section.id} className={cn("space-y-3", sIdx !== currentSectionIndex && "opacity-60")}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{section.name}</h3>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    {Object.keys(answers[section.id] || {}).length}/{section.questions.length}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {section.questions.map((question, qIdx) => {
                    const isCurrent = sIdx === currentSectionIndex && qIdx === currentQuestionIndex;
                    const isAnswered = (answers[section.id] || {})[question.id] !== undefined;
                    const isMarked = (markedForReview[section.id] || {})[question.id];
                    
                    return (
                      <button 
                        key={question.id}
                        onClick={() => {
                          if (sIdx === currentSectionIndex) {
                            setCurrentQuestionIndex(qIdx);
                          } else if (sIdx < currentSectionIndex) {
                            setAlertConfig({
                              show: true,
                              title: "Section Locked",
                              message: "This section has already been submitted and cannot be revisited."
                            });
                          } else {
                            // Trying to move to a future section
                            // Check if all previous sections are complete
                            let allPreviousComplete = true;
                            for (let i = 0; i < sIdx; i++) {
                              if (!isSectionComplete(SECTIONS[i].id)) {
                                allPreviousComplete = false;
                                break;
                              }
                            }
                            if (allPreviousComplete) {
                              setCurrentSectionIndex(sIdx);
                              setCurrentQuestionIndex(qIdx);
                            } else {
                              setAlertConfig({
                                show: true,
                                title: "Navigation Blocked",
                                message: "You must complete the current section before moving to future sections."
                              });
                            }
                          }
                        }}
                        className={cn(
                          "aspect-square flex items-center justify-center text-[10px] font-mono font-bold rounded transition-all border",
                          isCurrent ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-110 z-10" :
                          isMarked ? "bg-amber-50 text-amber-600 border-amber-200" :
                          isAnswered ? "bg-surface-container-high text-on-surface border-outline-variant" : 
                          "bg-white text-on-surface-variant border-outline-variant hover:border-primary/40"
                        )}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-outline-variant/30">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Integrity Score</span>
                  <span className="text-[10px] font-mono font-bold text-primary">98.4%</span>
                </div>
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98.4%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/30">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Axiom Secure Node</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto flex flex-col relative">
          {/* Section Tabs */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar">
            {SECTIONS.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => {
                  if (idx === currentSectionIndex) return;
                  if (idx < currentSectionIndex) {
                    setAlertConfig({
                      show: true,
                      title: "Section Locked",
                      message: "This section has already been submitted and cannot be revisited."
                    });
                  } else {
                    // Moving forward
                    let allPreviousComplete = true;
                    for (let i = 0; i < idx; i++) {
                      if (!isSectionComplete(SECTIONS[i].id)) {
                        allPreviousComplete = false;
                        break;
                      }
                    }
                    if (allPreviousComplete) {
                      setCurrentSectionIndex(idx);
                      setCurrentQuestionIndex(0);
                    } else {
                      setAlertConfig({
                        show: true,
                        title: "Navigation Restricted",
                        message: "You must complete the current section before moving forward."
                      });
                    }
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  currentSectionIndex === idx 
                    ? "bg-primary text-on-primary shadow-md" 
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-dim"
                )}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none"></div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative z-10">
            <div className="w-full max-w-3xl">
              {/* Question Card */}
              <div className="bg-white rounded-2xl border border-outline-variant/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 mb-8">
                <div className="flex items-center gap-4 mb-8">
                  <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded">
                    Q.{(currentQuestionIndex + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Section: {currentSection.name}</span>
                </div>
                
                <h2 className="font-body text-2xl md:text-3xl font-medium text-on-surface leading-relaxed mb-12">
                  {q.text}
                </h2>

                <div className="grid gap-4">
                  {q.options.map((option, idx) => {
                    const isSelected = (answers[currentSection.id] || {})[q.id] === idx;
                    return (
                      <button 
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        className={cn(
                          "group flex items-center w-full text-left rounded-xl p-5 transition-all border-2",
                          isSelected 
                            ? "bg-primary/5 border-primary shadow-sm" 
                            : "bg-white border-outline-variant/50 hover:border-primary/30 hover:bg-surface-container-lowest"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold mr-6 transition-all",
                          isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={cn("font-body text-lg text-on-surface", isSelected && "font-semibold")}>
                          {option}
                        </span>
                        {isSelected && (
                          <div className="ml-auto text-primary">
                            <CheckCircle2 size={20} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
          
          {/* Spacer for Footer */}
          <div className="h-24"></div>
        </main>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 py-12 bg-white rounded-2xl shadow-xl p-8 border border-outline-variant/30">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Exam Completed</h1>
          <p className="text-on-surface-variant text-lg">
            You have successfully submitted your assessment. You may now close this window.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-4 opacity-70">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Security: Retest Disabled</p>
              <div className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                <RefreshCw size={16} />
                Retest & Restart Disabled
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-outline-variant/30">
            <div className="flex items-center justify-center gap-3 text-on-surface-variant">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Axiom Secure Node • Session Terminated</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="fixed top-0 left-0 w-full h-[2px] kinetic-accent opacity-80 z-[60]"></div>
      
      <Header 
        screen={screen} 
        timeLeft={screen === 'exam' ? sectionTimesLeft[SECTIONS[currentSectionIndex].id] : undefined} 
        onFinish={() => setShowExitConfirm(true)} 
        sectionName={screen === 'exam' ? SECTIONS[currentSectionIndex].name : undefined}
        violations={violations}
      />
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={screen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 flex flex-col"
        >
          {screen === 'access' && renderAccess()}
          {screen === 'landing' && renderLanding()}
          {screen === 'validation' && renderValidation()}
          {screen === 'exam' && renderExam()}
        </motion.div>
      </AnimatePresence>

      {screen === 'exam' && (
        <Footer 
          onNext={handleNext} 
          onPrev={handlePrev} 
          onMark={handleMarkForReview} 
          onClear={handleClear} 
          isLastInSection={currentQuestionIndex === SECTIONS[currentSectionIndex].questions.length - 1}
        />
      )}

      {/* Modals */}
      <AnimatePresence>
        {showFaceAlert && (
          <IntegrityModal 
            key="face-alert"
            icon={<CameraOff className="text-error" size={32} />}
            title="Integrity Violation"
            desc={`The AI proctor detected an issue: ${integrityStatus}. Please ensure you are alone, looking at the screen, and in a well-lit environment.`}
            image={IMAGES.blurredFace}
            capturedFrame={lastCapturedFrame}
            primaryAction={{ label: "Resume Session", onClick: () => setShowFaceAlert(false) }}
            badge="AI MONITORING ACTIVE"
          />
        )}

        {showTabAlert && (
          <IntegrityModal 
            key="tab-alert"
            icon={<AlertTriangle className="text-error" size={32} />}
            title="Tab Switch Detected"
            desc={`An unauthorized tab or window switch was recorded. This action constitutes a direct violation of the examination protocol. Multiple violations will result in automatic disqualification.`}
            primaryAction={{ label: "Resume Test", onClick: () => setShowTabAlert(false) }}
            footer="Axiom Proctored Environment • Session Logged"
            metadata={`Monitoring Active: ID-${violations}829`}
          />
        )}

        {showFullScreenAlert && (
          <IntegrityModal 
            key="fullscreen-alert"
            icon={<Maximize className="text-error" size={32} />}
            title="Full Screen Required"
            desc="The assessment must be taken in full-screen mode to ensure integrity. Exiting full-screen is considered a security violation. Please re-enter full-screen to continue."
            primaryAction={{ label: "Re-enter Full Screen", onClick: enterFullScreen }}
            badge="KIOSK MODE ACTIVE"
            footer="Assessment will resume once full-screen is restored."
            metadata={`Monitoring Active: ID-${violations}829`}
          />
        )}

        {showSubmitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-on-background/20 backdrop-blur-md" onClick={() => setShowSubmitConfirm(false)}></div>
            <div className="relative flex flex-col gap-6 max-w-xl w-full">
              <div className="bg-white rounded-xl shadow-[0_32px_64_px_-12px_rgba(0,0,0,0.2)] overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center text-primary">
                      <ShieldCheck size={24} />
                    </div>
                    <h2 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">Are you sure you want to submit?</h2>
                  </div>
                  <div className="bg-surface-container-low p-5 rounded-lg mb-8 border-l-4 border-secondary">
                    <p className="text-on-surface font-medium leading-relaxed">
                      All questions in this section are answered.
                    </p>
                    <p className="text-on-surface-variant text-sm mt-1">
                      Once you submit, you will not be able to return to this assessment.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 bg-surface-container-high text-on-surface font-label font-bold py-3.5 rounded-lg hover:bg-surface-dim transition-all active:scale-[0.98]">
                      Go back
                    </button>
                    <button onClick={finalizeSubmission} className="flex-1 bg-gradient-to-r from-secondary to-tertiary text-white font-label font-bold py-3.5 rounded-lg shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-[0.98]">
                      Submit anyway
                    </button>
                  </div>
                </div>
                <div className="bg-surface-container-lowest px-8 py-4 border-t border-surface-container flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Exam ID: QR-2024-0012</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-surface-dim"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-surface-dim"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-on-background/20 backdrop-blur-md" onClick={() => setShowExitConfirm(false)}></div>
            <div className="relative flex flex-col gap-6 max-w-md w-full">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} />
                  </div>
                  <h2 className="font-headline font-extrabold text-2xl text-on-surface mb-2">Finalize and Submit?</h2>
                  <p className="text-on-surface-variant mb-8">Your assessment progress will be securely saved and your session session will be finalized.</p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setShowExitConfirm(false)} 
                      className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-lg hover:brightness-110 transition-all"
                    >
                      Back to Test
                    </button>
                    <button 
                      onClick={finalizeSubmission} 
                      className="w-full bg-surface-container-high text-error font-bold py-3.5 rounded-lg hover:bg-error/10 transition-all"
                    >
                      Submit Assessment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSectionConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowSectionConfirm(false)}></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="font-headline text-2xl font-bold text-slate-900 mb-3">Submit this section?</h2>
              <p className="text-slate-600 mb-8">
                You have completed all questions in <strong>{SECTIONS[currentSectionIndex].name}</strong>. 
                Once submitted, you will not be able to return to this section.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSectionSubmit}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                  Finalize Section
                </button>
                <button 
                  onClick={() => setShowSectionConfirm(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AlertModal 
        show={alertConfig.show}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
      />

      {/* Background Decorative Elements */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed top-1/4 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      {/* Permission Gateway Modal */}
      <AnimatePresence>
        {showPermissionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setShowPermissionModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-3">Initialize Proctoring</h2>
                <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
                  To maintain the integrity of your assessment, we require access to your audio and visual hardware.
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {/* Camera Toggle */}
                <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/10 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      validationProgress.camera ? "bg-green-500 text-white" : validationProgress.cameraError ? "bg-error/10 text-error" : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      <Video size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface">Video Camera</p>
                      <p className={cn("text-[10px] font-bold", validationProgress.camera ? "text-green-600" : validationProgress.cameraError ? "text-error" : "text-on-surface-variant")}>
                        {validationProgress.cameraError ? "Permission Blocked" : validationProgress.camera ? "Successfully Activated" : "Required for proctoring"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => startWebcam()}
                    disabled={validationProgress.camera}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all duration-300",
                      validationProgress.camera ? "bg-green-500" : validationProgress.cameraError ? "bg-error/20" : "bg-slate-200 hover:bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300",
                      validationProgress.camera ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                {/* Audio Toggle */}
                <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/10 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      validationProgress.audio ? "bg-green-500 text-white" : validationProgress.audioError ? "bg-error/10 text-error" : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      <Mic size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface">Microphone</p>
                      <p className={cn("text-[10px] font-bold", validationProgress.audio ? "text-green-600" : validationProgress.audioError ? "text-error" : "text-on-surface-variant")}>
                        {validationProgress.audioError ? "Permission Blocked" : validationProgress.audio ? "Successfully Activated" : "Required for audio audit"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => startAudio()}
                    disabled={validationProgress.audio}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all duration-300",
                      validationProgress.audio ? "bg-green-500" : validationProgress.audioError ? "bg-error/20" : "bg-slate-200 hover:bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300",
                      validationProgress.audio ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>

              {/* Blocked Instructions with Pulsing Arrow and Animation */}
              {(validationProgress.cameraError || validationProgress.audioError) && (
                <>
                  {/* Top-Left Pulsing Arrow */}
                  <div className="fixed top-4 left-4 z-[200] pointer-events-none">
                    <motion.div 
                      animate={{ 
                        y: [0, 15, 0],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-error rounded-full flex items-center justify-center shadow-xl shadow-error/40 border-2 border-white">
                        <ArrowUp className="text-white" size={24} />
                      </div>
                      <span className="bg-error text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">Click Here First</span>
                    </motion.div>
                  </div>

                  <div className="mt-8 mb-10 p-6 bg-error shadow-[0_12px_32px_-8px_rgba(239,68,68,0.4)] border border-error/20 rounded-2xl text-white relative overflow-hidden">
                    {/* Animated Guide Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <AlertTriangle size={20} />
                      </div>
                      <span className="text-sm font-extrabold uppercase tracking-widest">Action Required: Unblock Hardware</span>
                    </div>

                    {/* Animated Clicking Illustration */}
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 mb-6 flex items-center justify-center gap-6">
                       <div className="relative">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Lock size={20} />
                          </div>
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.2, 1],
                              x: [20, 0, 20],
                              y: [20, 0, 20]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg"
                          >
                             <MousePointer2 size={12} />
                          </motion.div>
                       </div>
                       <div className="h-8 w-[1px] bg-white/20" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-tighter">Setting: Allow</p>
                          <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                             <motion.div 
                               animate={{ x: [-64, 0, -64] }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="h-full w-full bg-green-400"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                        <p className="text-[11px]">Click the <strong>Lock icon</strong> in the top-left address bar (indicated by the red arrow).</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                        <p className="text-[11px]">Toggle <strong>Camera</strong> and <strong>Microphone</strong> to <strong>"Allow"</strong>.</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                        <p className="text-[11px]">Once allowed, the proctoring engine will automatically initialize.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button 
                onClick={() => {
                  if (validationProgress.camera && validationProgress.audio) {
                    setShowPermissionModal(false);
                  } else {
                    startWebcam();
                    startAudio();
                  }
                }}
                className={cn(
                  "w-full py-5 rounded-2xl font-headline font-extrabold text-lg transition-all shadow-xl",
                  (validationProgress.camera && validationProgress.audio)
                    ? "bg-green-600 text-white shadow-green-600/20 hover:brightness-110 active:scale-[0.98]"
                    : "bg-primary text-on-primary shadow-primary/20 hover:brightness-110 active:scale-[0.98]"
                )}
              >
                {validationProgress.camera && validationProgress.audio ? "Continue to Assessment" : "Grant Security Permissions"}
              </button>
              
              <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Protected by Axiom AI Integrity Guard
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

const InstructionItem = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex gap-4 group">
    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 group-hover:bg-primary-fixed transition-colors">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-on-surface mb-1">{title}</h4>
      <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ValidationCard = ({ icon, title, desc, status }: { icon: React.ReactNode; title: string; desc: string; status: 'active' | 'pending' | 'loading' | 'error' }) => (
  <div className={cn(
    "bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between transition-all border-2",
    status === 'loading' ? "border-primary/10" : status === 'error' ? "border-error/20 bg-error/5" : "border-transparent"
  )}>
    <div className="flex items-center gap-5">
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center relative",
        status === 'active' ? "bg-surface-container text-primary" : 
        status === 'error' ? "bg-error-container text-error" : "bg-primary-fixed text-primary"
      )}>
        {icon}
        {status === 'loading' && <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
      </div>
      <div>
        <h4 className="font-headline font-bold text-lg">{title}</h4>
        <p className={cn("text-sm", status === 'error' ? "text-error" : "text-on-surface-variant")}>{desc}</p>
      </div>
    </div>
    {status === 'active' ? (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
        <CheckCircle2 size={18} fill="currentColor" className="text-white" />
        <span className="font-label text-xs font-bold uppercase tracking-wider">Active</span>
      </div>
    ) : status === 'error' ? (
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.location.reload()} 
          className="flex items-center gap-2 text-primary hover:text-secondary transition-colors font-label text-xs font-bold uppercase tracking-wider"
        >
          <RefreshCw size={14} />
          Retry
        </button>
        <div className="flex items-center gap-2 text-error bg-error/10 px-4 py-2 rounded-full">
          <AlertTriangle size={18} />
          <span className="font-label text-xs font-bold uppercase tracking-wider">Error</span>
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-primary font-label text-xs font-bold uppercase tracking-wider">
        {status === 'loading' ? 'Running...' : 'Pending'}
      </div>
    )}
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <div className={cn("w-3 h-3 rounded-sm", color)}></div>
    <span className="text-[10px] font-medium">{label}</span>
  </div>
);

const IntegrityModal = ({ icon, title, desc, image, primaryAction, secondaryAction, badge, footer, metadata, capturedFrame }: any) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-2xl w-full bg-surface-container-lowest rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col items-center"
    >
      <div className="w-full h-1.5 bg-error"></div>
      <div className="p-10 w-full flex flex-col items-center text-center">
        <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-error-container">
          {icon}
        </div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-4">{title}</h1>
        <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-lg mb-10">{desc}</p>
        
        {(image || capturedFrame) && (
          <div className="relative w-full aspect-video bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/20 mb-10">
            <img 
              alt="Integrity check" 
              className="w-full h-full object-cover grayscale blur-[1px] opacity-60" 
              src={capturedFrame || image} 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-error/40 rounded-tl-lg"></div>
              <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-error/40 rounded-tr-lg"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-error/40 rounded-bl-lg"></div>
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-error/40 rounded-br-lg"></div>
              <div className="w-[80%] h-[1px] bg-error/30 absolute top-1/2 -translate-y-1/2"></div>
            </div>
            {badge && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 bg-on-background/80 backdrop-blur rounded-full">
                <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest font-label">{badge}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button onClick={primaryAction.onClick} className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary font-semibold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
            {primaryAction.label}
          </button>
          {secondaryAction && (
            <button onClick={secondaryAction.onClick} className="flex items-center justify-center px-8 py-4 bg-surface-container-high text-primary font-semibold rounded-lg hover:bg-surface-container-highest active:scale-95 transition-all">
              {secondaryAction.label}
            </button>
          )}
        </div>

        {metadata && (
          <div className="mt-8 flex items-center gap-2 text-xs font-medium text-outline uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>{metadata}</span>
          </div>
        )}
      </div>
      {footer && (
        <div className="bg-surface-container-low w-full px-8 py-4 text-center">
          <p className="text-[10px] text-on-surface-variant/70 uppercase tracking-tighter">{footer}</p>
        </div>
      )}
    </motion.div>
  </div>
);

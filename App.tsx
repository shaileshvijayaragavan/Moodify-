
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CameraView } from './components/CameraView';
import { LanguageFilter } from './components/LanguageFilter';
import { PlaylistCard } from './components/PlaylistCard';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MusicIcon } from './components/icons/MusicIcon';
import { RefreshIcon } from './components/icons/RefreshIcon';
import { detectEmotionFromImage, generatePlaylists } from './services/geminiService';
import type { Language, Playlist, Emotion } from './types';
import { LANGUAGES } from './constants';

type AppState = 'idle' | 'capturing' | 'analyzing' | 'results';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([LANGUAGES[5]]); // Default to English
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const debounceTimeout = useRef<number | null>(null);

  const handleCapture = async (imageDataUrl: string) => {
    setAppState('analyzing');
    setCapturedImage(imageDataUrl);
    setIsLoading(true);
    setError(null);
    setPlaylists([]);
    try {
      const emotion = await detectEmotionFromImage(imageDataUrl);
      setDetectedEmotion(emotion);
      setAppState('results');
    } catch (err) {
      setError('Could not detect emotion. Please try again with a clearer image.');
      setAppState('capturing');
      setCapturedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylists = useCallback(async (emotion: Emotion, languages: Language[]) => {
    if (languages.length === 0) {
      setPlaylists([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newPlaylists = await generatePlaylists(emotion, languages);
      setPlaylists(newPlaylists);
    } catch (err) {
      setError('Failed to generate playlists. Please try again.');
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (appState === 'results' && detectedEmotion) {
        if (debounceTimeout.current) {
            window.clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = window.setTimeout(() => {
            fetchPlaylists(detectedEmotion, selectedLanguages);
        }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedEmotion, selectedLanguages, appState]);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };
  
  const handleReset = () => {
    setAppState('idle');
    setDetectedEmotion(null);
    setPlaylists([]);
    setError(null);
    setCapturedImage(null);
    setSelectedLanguages([LANGUAGES[5]]);
  };

  const renderContent = () => {
    switch (appState) {
      case 'idle':
        return (
          <div className="text-center flex flex-col items-center justify-center h-full p-8">
            <MusicIcon className="w-24 h-24 text-[#1DB954] mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Discover Music That Feels You</h2>
            <p className="text-gray-400 mb-8 max-w-sm">Let our AI analyze your facial expression to curate the perfect playlist for your current mood.</p>
            <button
              onClick={() => setAppState('capturing')}
              className="bg-[#1DB954] text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-[#1ed760] transition-transform transform hover:scale-105"
            >
              SCAN MY MOOD
            </button>
          </div>
        );
      case 'capturing':
        return <CameraView onCapture={handleCapture} onError={setError} />;
      case 'analyzing':
      case 'results':
        return (
          <div className="p-4 md:p-6 w-full">
            {isLoading && appState === 'analyzing' && <Loader message="Analyzing your mood..." />}
            {capturedImage && (
              <div className="relative mb-6">
                <img src={capturedImage} alt="Captured expression" className="rounded-lg w-full max-w-md mx-auto aspect-square object-cover" />
                <button onClick={handleReset} className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75">
                  <RefreshIcon className="w-6 h-6" />
                </button>
              </div>
            )}
            {detectedEmotion && (
              <div className="text-center mb-6 animate-fade-in">
                <p className="text-gray-400">Your current mood</p>
                <h2 className="text-4xl font-bold text-[#1DB954] capitalize">{detectedEmotion}</h2>
              </div>
            )}
            <LanguageFilter selectedLanguages={selectedLanguages} onLanguageChange={handleLanguageChange} />
            {error && <p className="text-red-400 text-center my-4">{error}</p>}
            {isLoading && appState === 'results' && <Loader message="Curating your playlists..." />}
            <div className="mt-6 space-y-4">
              {playlists.map((playlist, index) => (
                <PlaylistCard key={index} playlist={playlist} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen text-white flex flex-col">
      <Header onReset={handleReset}/>
      <main className="flex-grow flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-lg mx-auto bg-[#181818] rounded-2xl shadow-lg flex flex-col items-center min-h-[70vh] my-8 overflow-hidden">
            {renderContent()}
          </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;

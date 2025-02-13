import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EmotionTile {
  emotion: string;
  emoji: string;
  color: string;
  prompt: string;
}

const emotionTiles: EmotionTile[] = [
  {
    emotion: "Happy",
    emoji: "😊",
    color: "bg-[#FFD93D]",
    prompt: "happy"
  },
  {
    emotion: "Sad",
    emoji: "😢",
    color: "bg-[#74B9FF]",
    prompt: "sad"
  },
  {
    emotion: "Anxious",
    emoji: "😰",
    color: "bg-[#B19CD9]",
    prompt: "anxious"
  },
  {
    emotion: "Overwhelmed",
    emoji: "😫",
    color: "bg-[#FF7675]",
    prompt: "overwhelmed"
  },
  {
    emotion: "Excited",
    emoji: "🤩",
    color: "bg-[#FF79C6]",
    prompt: "excited"
  },
  {
    emotion: "Angry",
    emoji: "😠",
    color: "bg-[#FF9F43]",
    prompt: "angry"
  },
  {
    emotion: "Confused",
    emoji: "😕",
    color: "bg-[#6C5CE7]",
    prompt: "confused"
  },
  {
    emotion: "Grateful",
    emoji: "🙏",
    color: "bg-[#00B894]",
    prompt: "grateful"
  }
];

function EmotionGrid({ onSelect }: { onSelect: (tile: EmotionTile) => void }) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Emotional Wellness Space
        </h1>
        <p className="text-xl text-gray-600">I'm feeling...</p>
      </div>

      {/* Emotion Tiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {emotionTiles.map((tile) => (
          <button
            key={tile.emotion}
            onClick={() => onSelect(tile)}
            className={`aspect-square rounded-3xl ${tile.color} transition-all duration-300 
              flex flex-col items-center justify-center p-6
              hover:transform hover:scale-105 hover:shadow-lg
              shadow-md`}
          >
            <div className="text-4xl md:text-5xl mb-3">{tile.emoji}</div>
            <div className="font-semibold text-lg md:text-xl text-white">
              {tile.emotion}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResponseScreen({ 
  emotion,
  response,
  isLoading,
  error,
  onBack 
}: { 
  emotion: EmotionTile;
  response: string | null;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}) {
  const bgColorClass = emotion.color.replace('bg-', 'from-');
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgColorClass} to-white p-4 md:p-8`}>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="group mb-8 inline-flex items-center px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm
            hover:bg-white/30 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-white mr-2 transition-transform group-hover:-translate-x-1" />
          <span className="text-black font-medium">Back to emotions</span>
        </button>

        {/* Emotion Header */}
        <div className="text-center mb-12">
          <div className="text-6xl md:text-7xl mb-4 filter drop-shadow-lg">{emotion.emoji}</div>
          <div className="relative">
            <div className="absolute inset-0 blur-xl opacity-40 bg-black/20 rounded-full" />
            <h2 className="relative text-3xl md:text-4xl font-bold text-gray mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              I'm feeling {emotion.emotion.toLowerCase()}
            </h2>
          </div>
        </div>

        {/* Response Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 min-h-[200px] backdrop-blur-sm bg-opacity-95">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Finding guidance for you...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center p-4">
              {error}
            </div>
          ) : response ? (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = 'YOUR_API_TOKEN';

  const handleEmotionSelect = async (tile: EmotionTile) => {
    setIsLoading(true);
    setError(null);
    setSelectedEmotion(tile);
    setResponse(null);

    try {
      const response = await axios.post('/api/chat', {
        message: tile.prompt,
        apiKey,
      });

      setResponse(response.data.message);
    } catch (error) {
      console.error('Client Error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response?.status === 429) {
        errorMessage = 'Please wait 15 seconds before selecting another emotion.';
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedEmotion(null);
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedEmotion ? (
        <ResponseScreen
          emotion={selectedEmotion}
          response={response}
          isLoading={isLoading}
          error={error}
          onBack={handleBack}
        />
      ) : (
        <div className="p-4 md:p-8">
          <EmotionGrid onSelect={handleEmotionSelect} />
        </div>
      )}
    </div>
  );
}

export default App;
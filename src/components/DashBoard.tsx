"use client";
import { NextPage } from "next";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useInsertionEffect,
} from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, RefreshCw ,Play,ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import UseAuth from "./UseAuth";
import { Button } from "./ui/button";
import SpotifyWebPlayer from "react-spotify-web-playback";
import { useRouter } from "next/navigation";

const emotionColors = {
  Happy: "bg-green-500",
  Sad: "bg-blue-500",
  Neutral: "bg-gray-500",
  Angry: "bg-red-500",
  Surprised: "bg-yellow-500",
  Fear: "bg-purple-500",
  Disgust: "bg-green-700",
};

interface Prediction {
  emotion: string;
  confidence: number;
  face: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface DashBoardProps {
  code: string;
}
interface Track {
  uri: string;
  name: string;
  artists: { name: string }[];
  image: string;
  duration_ms: number;
  external_urls: string;
}

const DashBoard: NextPage<DashBoardProps> =  ({ code }) => {
  const router = useRouter()
  const accessToken = String(UseAuth({ code }));
  //  console.log(accessToken);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<Prediction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);

  const capture = useCallback(async () => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      const response = await axios.post(
        "/api/predict",
        { imageSrc },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if ("error" in response.data) {
        setError(response.data.error);
        setPrediction(null);
      } else {
        setPrediction(response.data);
        setEmotionData((prevData) => [...prevData, response.data].slice(-60));
        // console.log(emotionData)
        setError(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
        setError(`Network error: ${error.message}`);
      } else {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred.");
      }
      setPrediction(null);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      capture();
    }, 1000);
    return () => clearInterval(interval);
  }, [capture]);

  useEffect(() => {
    if (prediction && canvasRef.current && webcamRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          prediction.face.x,
          prediction.face.y,
          prediction.face.width,
          prediction.face.height
        );
      }
    } else if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [prediction]);


  const getEmotionBasedRecommendations = async () => {
    if (!accessToken) {
      setError("No Spotify access token available");
      return;
    }

    setIsProcessing(true);
    const emotionCounts = emotionData.reduce((acc, data) => {
      acc[data.emotion] = (acc[data.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b, '');
    const averageConfidence = emotionData.length > 0 ? emotionData.reduce((sum, data) => sum + data.confidence, 0) / emotionData.length : 0;

    const emotionToGenre: Record<string, string> = {
      'Angry': 'rock', 'Disgust': 'punk', 'Fear': 'ambient', 
      'Happy': 'happy', 'Sad': 'sad', 'Surprised': 'pop', 'Neutral': 'acoustic'
    };

    const seedGenre = emotionToGenre[dominantEmotion as keyof typeof emotionToGenre] || 'pop';
    let valence = 0.5, energy = 0.5;

    if (['Happy', 'Surprise'].includes(dominantEmotion)) {
      valence = energy = Math.min(averageConfidence, 1.0);
    } else if (['Sad', 'Fear'].includes(dominantEmotion)) {
      valence = energy = Math.max(1 - averageConfidence, 0.0);
    } else if (dominantEmotion === 'Angry') {
      valence = Math.max(1 - averageConfidence, 0.0);
      energy = Math.min(averageConfidence, 1.0);
    }

    try {
      const recommendationsResponse = await axios.get(`https://api.spotify.com/v1/recommendations`, {
        params: {
          seed_genres: seedGenre,
          target_valence: valence,
          target_energy: energy,
          limit: 10
        },
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const tracks: Track[] = recommendationsResponse.data.tracks.map((track: any) => {
        const smallestImage = track.album.images.reduce((smallest: any, image: any) => {
          return image.height < smallest.height ? image : smallest;
        }, track.album.images[0]);

        return {
          uri: track.uri,
          name: track.name,
          artists: track.artists.map((artist: any) => ({ name: artist.name })),
          image: smallestImage.url,
          duration_ms: track.duration_ms,
          external_urls: track.external_urls.spotify
        };
      });
      console.log(recommendationsResponse.data.tracks);

      setRecommendedTracks(tracks);
      console.log(tracks)
      console.log(tracks);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch song recommendations');
    } finally {
      setIsProcessing(false);
    }
  };

  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center text-green-400 mb-8">
        Mood-Based Music Recommender
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 bg-gray-900 shadow-xl rounded-lg overflow-hidden">
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={640}
              height={480}
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-auto transform scale-x-[-1]"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          {error ? (
            <Alert variant="destructive" className="mb-4 bg-red-900 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : prediction ? (
            <Card className="bg-gray-900 border-green-500 border">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-green-400">
                  Mood Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Detected Mood:
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-lg py-1 px-3 ${
                      emotionColors[
                        prediction.emotion as keyof typeof emotionColors
                      ] || "bg-gray-500"
                    } text-white`}
                  >
                    {prediction.emotion}
                  </Badge>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Confidence:
                  </h3>
                  <div className="flex items-center">
                    <Progress
                      value={prediction.confidence * 100}
                      className="w-full bg-slate-400 text-green-300 border-[0.25px]"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-300">
                      {(prediction.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-900 border-green-500 border">
              <CardContent className="p-6">
                <p className="text-lg text-gray-300">
                  Waiting for mood analysis...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Button 
        onClick={getEmotionBasedRecommendations} 
        disabled={isProcessing || !accessToken}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 flex items-center justify-center mt-8"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="animate-spin mr-2" />
            Finding tracks...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2" />
            Get Music Recommendations
          </>
        )}
      </Button>
      {recommendedTracks.length > 0 && (
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-400">Recommended Tracks:</h3>
          <ul className="space-y-4">
            {recommendedTracks.map((track, index) => (
              <li 
                key={index} 
                className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-800 transition duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 relative">
                  <img 
                    src={track.image || '/placeholder-album.png'} 
                    alt={`${track.name} album cover`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-white truncate">{track.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400">
                  {Math.floor(track.duration_ms / 60000)}:
                  {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                </div>
                <Button
                  onClick={(e) => {
                    router.push(track.external_urls);
                  }}
                  className="ml-2 p-2 bg-green-500 hover:bg-green-600 rounded-full"
                  title="Open in Spotify"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
    </div>
  </div>
  );
};

export default DashBoard;

'use client'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const emotionColors = {
  Happy: 'bg-green-500',
  Sad: 'bg-blue-500',
  Neutral: 'bg-gray-500',
  Angry: 'bg-red-500',
  Surprised: 'bg-yellow-500',
  // Add more colors for other emotions as needed
};

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const base64Data = imageSrc.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());

      const formData = new FormData();
      formData.append('image', blob, 'webcam.jpg');

      try {
        const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if ('error' in response.data) {
          setError(response.data.error);
          setPrediction(null);
        } else {
          setPrediction(response.data);
          setError(null);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.message);
          setError(`Network error: ${error.message}`);
        } else {
          console.error('Unexpected error:', error);
          setError('An unexpected error occurred.');
        }
        setPrediction(null);
      }
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
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          prediction.face.x,
          prediction.face.y,
          prediction.face.width,
          prediction.face.height
        );
      }
    } else if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [prediction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
          Facial Expression Recognition
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={640}
                height={480}
                videoConstraints={{ facingMode: 'user' }}
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
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : prediction ? (
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-indigo-900">Prediction Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Detected Emotion:</h3>
                    <Badge 
                      variant="outline" 
                      className={`text-lg py-1 px-3 ${emotionColors[prediction.emotion as keyof typeof emotionColors] || 'bg-gray-500'} text-white`}
                    >
                      {prediction.emotion}
                    </Badge>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Confidence:</h3>
                    <div className="flex items-center">
                      <Progress value={prediction.confidence * 100} className="w-full" />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {(prediction.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-xl">
                <CardContent className="p-6">
                  <p className="text-lg text-gray-700">Waiting for prediction...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
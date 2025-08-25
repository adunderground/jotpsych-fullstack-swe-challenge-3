import React, { useState, useEffect } from "react";
import APIService from "../services/APIService";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string, versionMismatch?: boolean, apiVersion?: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [finalRecordingTime, setFinalRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const MAX_RECORDING_TIME = 10;

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setFinalRecordingTime(recordingTime);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => {
          const newTime = prevTime + 1;
          if (newTime >= MAX_RECORDING_TIME) {
            // Auto-stop when reaching max time
            setTimeout(() => stopRecording(), 0);
            return prevTime; 
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]); 

  const startRecording = async () => {
    try {
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

        try {
          // Show loading state when transcription begins
          setIsTranscribing(true);
          
          // Use APIService for API requests
          const response = await APIService.transcribeAudio(audioBlob);
          
          if (response.error) {
            console.error("Error transcribing audio:", response.error);
            onTranscriptionComplete("Error transcribing audio");
          } else if (response.data) {
            // Extract transcription text from the response data
            let transcriptionText: string;
            if (typeof response.data === 'string') {
              transcriptionText = response.data;
            } else if (response.data && typeof response.data === 'object' && 'transcription' in response.data) {
              transcriptionText = (response.data as any).transcription;
            } else {
              transcriptionText = "Transcription completed";
            }
            // Pass transcription text and version mismatch info
            onTranscriptionComplete(
              transcriptionText, 
              response.versionMismatch, 
              response.apiVersion
            );
          }
        } catch (error) {
          console.error("Error sending audio:", error);
          onTranscriptionComplete("Error transcribing audio");
        } finally {
          // Hide loading state when transcription completes (success or error)
          setIsTranscribing(false);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {finalRecordingTime > 0 && (
        <p className="text-sm text-gray-600">
          Final recording time: {finalRecordingTime}s
        </p>
      )}
      
      {/* Loading indicator */}
      {isTranscribing && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 font-medium">Transcribing...</span>
        </div>
      )}
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        className={`px-6 py-3 rounded-lg font-semibold ${
          isTranscribing
            ? "bg-gray-400 cursor-not-allowed text-white"
            : isRecording
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isTranscribing
          ? "Processing..."
          : isRecording
          ? `Stop Recording (${MAX_RECORDING_TIME - recordingTime}s)`
          : "Start Recording"}
      </button>
      
      {isRecording && (
        <p className="text-sm text-gray-600">
          Recording in progress (Current time: {recordingTime}s)
        </p>
      )}
    </div>
  );
};

export default AudioRecorder;

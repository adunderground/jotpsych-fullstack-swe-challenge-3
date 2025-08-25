import React from "react";
import { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import Toast from "./components/Toast";

function App() {
  const [transcription, setTranscription] = useState<string>("");
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'warning' | 'error' | 'info';
  }>({
    isVisible: false,
    message: "",
    type: "info"
  });

  const handleTranscriptionComplete = (text: string, versionMismatch?: boolean, apiVersion?: string) => {
    setTranscription(text);
    
          // Show version mismatch toast if detected
      if (versionMismatch && apiVersion) {
        setToast({
          isVisible: true,
          message: `Version mismatch detected! Client: 0.0.9, API: ${apiVersion}`,
          type: "warning"
        });
      }
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Audio Transcription Demo</h1>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
      <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
      {transcription && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}

export default App;

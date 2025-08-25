import React from "react";
import { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import Toast from "./components/Toast";

interface RecordingInstance {
  id: string;
  isActive: boolean;
}

function App() {
  const [transcriptions, setTranscriptions] = useState<{ [key: string]: string }>({});
  const [recordingInstances, setRecordingInstances] = useState<RecordingInstance[]>([
    { id: "1", isActive: true }
  ]);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'warning' | 'error' | 'info';
  }>({
    isVisible: false,
    message: "",
    type: "info"
  });

  const handleTranscriptionComplete = (text: string, versionMismatch?: boolean, apiVersion?: string, instanceId?: string) => {
    if (instanceId) {
      setTranscriptions(prev => ({
        ...prev,
        [instanceId]: text
      }));
    }
    
    // Show version mismatch toast if detected
    if (versionMismatch && apiVersion) {
      setToast({
        isVisible: true,
        message: `Version mismatch detected! Client: 1.0.0, API: ${apiVersion}`,
        type: "warning"
      });
    }
  };

  const addRecordingInstance = () => {
    const newId = (recordingInstances.length + 1).toString();
    setRecordingInstances(prev => [...prev, { id: newId, isActive: true }]);
  };

  const removeRecordingInstance = (id: string) => {
    setRecordingInstances(prev => prev.filter(instance => instance.id !== id));
    setTranscriptions(prev => {
      const newTranscriptions = { ...prev };
      delete newTranscriptions[id];
      return newTranscriptions;
    });
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

      {/* Recording Instances */}
      <div className="w-full max-w-4xl space-y-6">
        {recordingInstances.map((instance) => (
          <div key={instance.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Recording Instance {instance.id}
              </h3>
              {recordingInstances.length > 1 && (
                <button
                  onClick={() => removeRecordingInstance(instance.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            
            <AudioRecorder 
              onTranscriptionComplete={(text, versionMismatch, apiVersion) => 
                handleTranscriptionComplete(text, versionMismatch, apiVersion, instance.id)
              }
              instanceId={instance.id}
            />
            
            {transcriptions[instance.id] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2 text-gray-700">Transcription {instance.id}:</h4>
                <p className="text-gray-800">{transcriptions[instance.id]}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Recording Instance Button */}
      <div className="mt-6">
        <button
          onClick={addRecordingInstance}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
        >
          + Add Another Recording
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center text-gray-600 max-w-2xl">
        <p className="text-sm">
          💡 <strong>Tip:</strong> You can record multiple messages simultaneously! 
          Start a recording in one instance while another is processing. 
          Each instance works independently and shows real-time progress.
        </p>
      </div>
    </div>
  );
}

export default App;

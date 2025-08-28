import { useState, useEffect } from "react";
import { BackgroundCells } from "./components/ui/background-cells";
import { HeroText } from "./components/ui/sparkles";
import { ControlButtons } from "./components/ui/control-buttons";
import { Footer } from "./components/ui/footer";
import ModernAudioRecorder from "./components/ModernAudioRecorder";
import Toast from "./components/Toast";
import UserIDService from "./services/UserIDService";

interface RecordingInstance {
  id: string;
  isActive: boolean;
}

function App() {
  const [, setTranscriptions] = useState<{ [key: string]: string }>({});
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

  // Initialize user ID on app start
  useEffect(() => {
    UserIDService.getUserID();
  }, []);

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
    <div className="relative bg-gray-950">
      {/* Background Cells - covers entire page */}
      <BackgroundCells className="absolute inset-0">
        <div className="relative z-50">
          {/* Hero Text - properly positioned, allows clicks through */}
          <div className="pt-16 pb-12 pointer-events-none">
            <HeroText />
          </div>
          
          {/* Toast - only in backdrop layer */}
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="pointer-events-auto">
              <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={closeToast}
              />
            </div>
          </div>
        </div>
      </BackgroundCells>
      
      {/* Scrollable content that starts after first screen */}
      <div className="relative z-40 pt-64 pointer-events-none">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Recording Instances */}
          <div className="space-y-12 pointer-events-auto">
            {recordingInstances.map((instance) => (
              <div key={instance.id} className="relative">
                {/* Remove button for multiple instances */}
                {recordingInstances.length > 1 && (
                  <div className="absolute top-0 right-0 z-10">
                    <button
                      onClick={() => removeRecordingInstance(instance.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 bg-white/90 hover:bg-red-50 rounded-md transition-colors shadow-sm"
                    >
                      Remove Instance {instance.id}
                    </button>
                  </div>
                )}
                
                {/* Modern Audio Recorder */}
                <div>
                  <ModernAudioRecorder 
                    onTranscriptionComplete={(text, versionMismatch, apiVersion) => 
                      handleTranscriptionComplete(text, versionMismatch, apiVersion, instance.id)
                    }
                    instanceId={instance.id}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Global Add Recording Button */}
          <div className="mt-16 text-center pointer-events-auto">
            <ControlButtons 
              onAddRecording={addRecordingInstance}
            />
          </div>

          {/* Footer */}
          <div className="mt-24 pointer-events-auto">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

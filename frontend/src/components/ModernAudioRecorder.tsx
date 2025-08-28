import React, { useState, useEffect } from "react";
import APIService from "../services/APIService";
import { RecordButton } from "./ui/record-button";
import { ControlButtons } from "./ui/control-buttons";
import { TextShimmer } from "./ui/text-shimmer";
import { AnalysisCard } from "./ui/analysis-card";

interface ModernAudioRecorderProps {
  onTranscriptionComplete: (text: string, versionMismatch?: boolean, apiVersion?: string) => void;
  instanceId: string;
}

interface TranscriptionCategories {
  primary_interest: string;
  confidence: number;
  subcategories: string[];
  sentiment: string;
  topics: string[];
}

interface JobState {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioBlob: Blob;
  result?: string;
  categories?: TranscriptionCategories;
  error?: string;
  createdAt: Date;
}

const ModernAudioRecorder: React.FC<ModernAudioRecorderProps> = ({ 
  onTranscriptionComplete, 
  instanceId 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [, setFinalRecordingTime] = useState(0);
  const [jobs, setJobs] = useState<JobState[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  const MAX_RECORDING_TIME = 10;

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setFinalRecordingTime(recordingTime);
      setIsRecording(false);
    }
  };

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
          const response = await APIService.submitTranscriptionJob(audioBlob);
          
          if (response.error) {
            console.error("Error submitting transcription job:", response.error);
            // Create a fallback job with lorem ipsum
            const fallbackJob: JobState = {
              jobId: `fallback-${Date.now()}`,
              status: 'completed',
              audioBlob: audioBlob,
              result: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Backend failed, but here's some placeholder text.",
              error: "Backend failed - showing placeholder text",
              createdAt: new Date()
            };
            setJobs(prevJobs => [...prevJobs, fallbackJob]);
            onTranscriptionComplete(fallbackJob.result || "");
          } else if (response.data) {
            const jobData = response.data as any;
            const newJob: JobState = {
              jobId: jobData.job_id,
              status: 'pending',
              audioBlob: audioBlob,
              createdAt: new Date()
            };
            setJobs(prevJobs => [...prevJobs, newJob]);
          }
        } catch (error) {
          console.error("Error sending audio:", error);
          // Create a fallback job with lorem ipsum
          const fallbackJob: JobState = {
            jobId: `fallback-${Date.now()}`,
            status: 'completed',
            audioBlob: audioBlob,
            result: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Backend connection failed, but here's some placeholder text.",
            error: "Backend connection failed - showing placeholder text",
            createdAt: new Date()
          };
          setJobs(prevJobs => [...prevJobs, fallbackJob]);
          onTranscriptionComplete(fallbackJob.result || "");
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onTranscriptionComplete("Error accessing microphone. Please check your device settings.");
    }
  };

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => {
          const newTime = prevTime + 1;
          if (newTime >= MAX_RECORDING_TIME) {
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

  // Poll job statuses
  useEffect(() => {
    if (jobs.length === 0 || isPolling) return;

    const pollJobs = async () => {
      setIsPolling(true);
      
      const jobsToPoll = jobs.filter(job => 
        job.status === 'pending' || job.status === 'processing'
      );

      if (jobsToPoll.length === 0) {
        setIsPolling(false);
        return;
      }

      for (const job of jobsToPoll) {
        try {
          const response = await APIService.getJobStatus(job.jobId);
          
          if (response.data && !response.error) {
            const jobStatus = response.data;
            
            setJobs(prevJobs => prevJobs.map(j => 
              j.jobId === job.jobId 
                ? { ...j, status: jobStatus.status, result: jobStatus.result, categories: jobStatus.categories, error: jobStatus.error }
                : j
            ));

            if (jobStatus.status === 'completed' && jobStatus.result) {
              onTranscriptionComplete(jobStatus.result);
            }
          }
        } catch (error) {
          console.error(`Error polling job ${job.jobId}:`, error);
        }
      }

      setTimeout(() => setIsPolling(false), 1000);
    };

    const interval = setInterval(pollJobs, 2000);
    return () => clearInterval(interval);
  }, [jobs, isPolling, onTranscriptionComplete]);

  // Clean up completed jobs after 5 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setJobs(prevJobs => prevJobs.filter(job => 
        job.createdAt > fiveMinutesAgo || job.status === 'pending' || job.status === 'processing'
      ));
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const hasPendingJobs = jobs.some(job => job.status === 'pending' || job.status === 'processing');
  const completedJobs = jobs.filter(job => job.status === 'completed');

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-2xl mx-auto">
      {/* Instance Counter */}
      <div className="text-center">
        {instanceId === "1" && (
          <h2 className="text-xl font-bold text-white mb-2">Press to record</h2>
        )}
        <p className="text-sm font-secondary text-gray-500">
          Recording instance {instanceId}
        </p>
        {isRecording && (
          <p className="text-sm text-gray-500 mt-1">
            Recording: {recordingTime}s / {MAX_RECORDING_TIME}s
          </p>
        )}
      </div>

      {/* Record Button */}
      <RecordButton 
        isRecording={isRecording}
        onClick={handleRecordClick}
        disabled={false}
      />

      {/* Control Buttons - only show pause/stop, no parallel button */}
      <ControlButtons 
        onStop={isRecording ? stopRecording : undefined}
        isRecording={isRecording}
        showParallelButton={false}
      />

      {/* Loading State with Text Shimmer */}
      {hasPendingJobs && (
        <div className="text-center">
          <TextShimmer duration={1.5} className="text-lg font-medium">
            Generating...
          </TextShimmer>
        </div>
      )}

      {/* AI Analysis Results */}
      {completedJobs.length > 0 && (
        <div className="w-full space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center">AI Analysis Results</h3>
          {completedJobs.map((job, index) => (
            <AnalysisCard
              key={job.jobId}
              title={`Analysis ${index + 1}${job.error ? ' (Backend Error)' : ''}`}
              content={job.result || "No transcription available"}
              categories={job.categories}
              defaultExpanded={index === completedJobs.length - 1} // Auto-expand latest
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernAudioRecorder;

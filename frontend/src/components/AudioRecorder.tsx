import React, { useState, useEffect } from "react";
import APIService from "../services/APIService";
import CategoryDisplay from "./CategoryDisplay";

interface AudioRecorderProps {
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
  categories?: TranscriptionCategories;  // NEW: Categorization result
  error?: string;
  createdAt: Date;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionComplete, instanceId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [finalRecordingTime, setFinalRecordingTime] = useState(0);
  const [jobs, setJobs] = useState<JobState[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  const MAX_RECORDING_TIME = 10;
  
  // TODO: PRODUCTION CONSIDERATIONS - Add configuration constants
  // const POLLING_INTERVAL = 2000; // 2 seconds
  // const CLEANUP_INTERVAL = 60000; // 1 minute
  // const JOB_CLEANUP_AGE = 5 * 60 * 1000; // 5 minutes
  // const MAX_CONCURRENT_JOBS = 5; // Prevent overwhelming the backend

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setFinalRecordingTime(recordingTime);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

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

  // Poll job statuses
  useEffect(() => {
    if (jobs.length === 0 || isPolling) return;

    const pollJobs = async () => {
      setIsPolling(true);
      
      // Poll each pending/processing job
      const jobsToPoll = jobs.filter(job => 
        job.status === 'pending' || job.status === 'processing'
      );

      if (jobsToPoll.length === 0) {
        setIsPolling(false);
        return;
      }

      // TODO: PRODUCTION CONSIDERATIONS - Add retry logic with exponential backoff
      // const retryCount = new Map<string, number>();
      // const MAX_RETRIES = 3;
      // const BASE_DELAY = 1000; // 1 second

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

            // If job completed, notify parent component
            if (jobStatus.status === 'completed' && jobStatus.result) {
              onTranscriptionComplete(jobStatus.result);
            }
          }
        } catch (error) {
          console.error(`Error polling job ${job.jobId}:`, error);
          
          // TODO: PRODUCTION CONSIDERATIONS - Add error handling strategies
          // - Implement exponential backoff for failed requests
          // - Mark job as failed after multiple consecutive errors
          // - Show user-friendly error messages
          // - Implement retry mechanism with user consent
        }
      }

      // Continue polling if there are still pending/processing jobs
      setTimeout(() => setIsPolling(false), 1000);
    };

    const interval = setInterval(pollJobs, 2000); // Poll every 2 seconds
    
    return () => clearInterval(interval);
  }, [jobs, isPolling, onTranscriptionComplete]);

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
          // TODO: PRODUCTION CONSIDERATIONS - Add file size validation
          // const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
          // if (audioBlob.size > MAX_FILE_SIZE) {
          //   onTranscriptionComplete("Audio file too large. Please record a shorter clip.");
          //   return;
          // }

          // TODO: PRODUCTION CONSIDERATIONS - Add concurrent job limit
          // if (jobs.filter(j => j.status === 'pending' || j.status === 'processing').length >= MAX_CONCURRENT_JOBS) {
          //   onTranscriptionComplete("Too many active jobs. Please wait for some to complete.");
          //   return;
          // }

          // Submit transcription job
          const response = await APIService.submitTranscriptionJob(audioBlob);
          
          if (response.error) {
            console.error("Error submitting transcription job:", response.error);
            onTranscriptionComplete("Error submitting transcription job");
          } else if (response.data) {
            const jobData = response.data as any;
            
            // Create new job entry
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
          onTranscriptionComplete("Error submitting transcription job");
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      
      // TODO: PRODUCTION CONSIDERATIONS - Add user-friendly error messages
      // if (error.name === 'NotAllowedError') {
      //   onTranscriptionComplete("Microphone access denied. Please allow microphone access and try again.");
      // } else if (error.name === 'NotFoundError') {
      //   onTranscriptionComplete("No microphone found. Please connect a microphone and try again.");
      // } else {
      //   onTranscriptionComplete("Error accessing microphone. Please check your device settings.");
      // }
    }
  };

  // Clean up completed jobs after 5 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setJobs(prevJobs => prevJobs.filter(job => 
        job.createdAt > fiveMinutesAgo || job.status === 'pending' || job.status === 'processing'
      ));
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // TODO: PRODUCTION CONSIDERATIONS - Add memory management
  // useEffect(() => {
  //   const memoryCleanup = setInterval(() => {
  //     // Clean up audio blobs for completed/failed jobs to free memory
  //     setJobs(prevJobs => prevJobs.map(job => {
  //       if (job.status === 'completed' || job.status === 'failed') {
  //         // Release audio blob reference
  //         return { ...job, audioBlob: null as any };
  //       }
  //       return job;
  //     }));
  //   }, 30000); // Every 30 seconds
  //
  //   return () => clearInterval(memoryCleanup);
  // }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  // TODO: PRODUCTION CONSIDERATIONS - Add job retry functionality
  // const retryJob = async (jobId: string) => {
  //   const job = jobs.find(j => j.jobId === jobId);
  //   if (!job || job.status !== 'failed') return;
  //
  //   try {
  //     const response = await APIService.submitTranscriptionJob(job.audioBlob);
  //     if (response.data) {
  //       const jobData = response.data as any;
  //       const newJob: JobState = {
  //         jobId: jobData.job_id,
  //         status: 'pending',
  //         audioBlob: job.audioBlob,
  //         createdAt: new Date()
  //       };
  //       
  //       setJobs(prevJobs => prevJobs.map(j => 
  //         j.jobId === jobId ? newJob : j
  //       ));
  //     }
  //   } catch (error) {
  //     console.error("Error retrying job:", error);
  //   }
  // };

  // TODO: PRODUCTION CONSIDERATIONS - Add job cancellation
  // const cancelJob = async (jobId: string) => {
  //   // Implement job cancellation logic
  //   // This would require backend support for job cancellation
  //   console.log("Job cancellation not implemented yet");
  // };

  return (
    <div className="flex flex-col items-center gap-4">
      {finalRecordingTime > 0 && (
        <p className="text-sm text-gray-600">
          Final recording time: {finalRecordingTime}s
        </p>
      )}
      
      {/* Job Status Display */}
      {jobs.length > 0 && (
        <div className="w-full max-w-md space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Instance {instanceId} - Transcription Jobs</h3>
          {jobs.map((job) => (
            <div 
              key={job.jobId} 
              className={`p-3 rounded-lg border ${getStatusColor(job.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(job.status)}</span>
                  <span className="text-sm font-medium capitalize">{job.status}</span>
                </div>
                <span className="text-xs text-gray-600">
                  {job.createdAt.toLocaleTimeString()}
                </span>
              </div>
              
              {job.result && (
                <p className="text-xs mt-2 text-gray-700 line-clamp-2">
                  {job.result}
                </p>
              )}
              
              {/* NEW: Display categories when job is completed */}
              {job.status === 'completed' && job.categories && (
                <CategoryDisplay categories={job.categories} />
              )}
              
              {job.error && (
                <p className="text-xs mt-2 text-red-600">
                  Error: {job.error}
                </p>
              )}
              
              {/* TODO: PRODUCTION CONSIDERATIONS - Add action buttons for failed jobs
              {job.status === 'failed' && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => retryJob(job.jobId)}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => cancelJob(job.jobId)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
              */}
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isRecording}
        className={`px-6 py-3 rounded-lg font-semibold ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isRecording
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

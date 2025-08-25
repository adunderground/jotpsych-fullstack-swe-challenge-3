import UserIDService from './UserIDService';

interface APIResponse<T> {
  data?: T;
  error?: string;
  version?: string;
  versionMismatch?: boolean;
  clientVersion?: string;
  apiVersion?: string;
}

interface JobResponse {
  job_id: string;
  status: string;
  message: string;
  version: string;
}

interface TranscriptionCategories {
  primary_interest: string;
  confidence: number;
  subcategories: string[];
  sentiment: string;
  topics: string[];
}

interface JobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  result?: string;
  categories?: TranscriptionCategories;  // NEW: Categorization result
  error?: string;
}

class APIService {
  private baseUrl: string = "http://localhost:8000";
  // private clientVersion: string = "0.0.9"; // for testing version mismatch
  private clientVersion: string = "1.0.0";

  // Generic request handler
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: FormData | object
  ): Promise<APIResponse<T>> {
    try {
      // Get user ID for this request
      const userId = await UserIDService.getUserID();
      
      const headers: HeadersInit = {
        "X-Client-Version": this.clientVersion,
        "X-User-ID": userId,
      };

      // Add Content-Type header if body is a plain object (not FormData)
      if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        body: body instanceof FormData ? body : JSON.stringify(body),
      };

      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        requestOptions
      );
      const data = await response.json();
      
      // Check for version mismatch using response body (more reliable than headers due to CORS)
      const apiVersion = data.version || response.headers.get("X-API-Version") || undefined;
      const versionMismatch = apiVersion ? apiVersion !== this.clientVersion : false;
      
      return { 
        data: data,
        version: apiVersion,
        versionMismatch,
        clientVersion: this.clientVersion,
        apiVersion: apiVersion
      };
    } catch (error) {
      return { error: `Request failed: ${error}` };
    }
  }

  // Submit a new transcription job
  async submitTranscriptionJob(audioBlob: Blob): Promise<APIResponse<JobResponse>> {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    return this.makeRequest<JobResponse>("/transcribe", "POST", formData);
  }

  // Get the status of a specific job
  async getJobStatus(jobId: string): Promise<APIResponse<JobStatusResponse>> {
    return this.makeRequest<JobStatusResponse>(`/job-status/${jobId}`, "GET");
  }

  // Legacy method for backward compatibility (returns job-based response now)
  async transcribeAudio(audioBlob: Blob): Promise<APIResponse<string>> {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    return this.makeRequest<string>("/transcribe", "POST", formData);
  }

  // Get current client version
  getCurrentVersion(): string {
    return this.clientVersion;
  }
}

export default new APIService();

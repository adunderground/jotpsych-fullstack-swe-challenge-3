interface APIResponse<T> {
  data?: T;
  error?: string;
  version?: string;
  versionMismatch?: boolean;
  clientVersion?: string;
  apiVersion?: string;
}

class APIService {
  private baseUrl: string = "http://localhost:8000";
  private clientVersion: string = "0.0.9";
  private userID: string = "1234567890";

  // Generic request handler
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: FormData | object
  ): Promise<APIResponse<T>> {
    try {
      const headers: HeadersInit = {
        // TODO: Version and user ID
        "X-Client-Version": this.clientVersion,
        "X-User-ID": this.userID,
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

  // Updated transcribeAudio using the generic request handler
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

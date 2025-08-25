from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random
import uuid
import threading
from typing import Dict, Optional, Literal
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

app = Flask(__name__)
CORS(app)

VERSION = "1.0.0"

# Simple in-memory job storage
jobs: Dict[str, Dict] = {}
job_lock = threading.Lock()
executor = ThreadPoolExecutor(max_workers=3)  # Limit concurrent jobs

# Simple in-memory user storage for demo purposes
users = set()
user_lock = threading.Lock()

class JobStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

def process_transcription(job_id: str, audio_data: bytes):
    """Mock function to simulate async transcription processing. Returns a random transcription."""
    try:
        # Simulate processing time
        time.sleep(random.randint(1, 2))
        
        # Random transcription result
        result = random.choice([
            "I've always been fascinated by cars, especially classic muscle cars from the 60s and 70s. The raw power and beautiful design of those vehicles is just incredible.",
            "Bald eagles are such majestic creatures. I love watching them soar through the sky and dive down to catch fish. Their white heads against the blue sky is a sight I'll never forget.",
            "Deep sea diving opens up a whole new world of exploration. The mysterious creatures and stunning coral reefs you encounter at those depths are unlike anything else on Earth."
        ])
        
        # Update job status to completed
        with job_lock:
            if job_id in jobs:
                jobs[job_id]["status"] = JobStatus.COMPLETED
                jobs[job_id]["result"] = result
                jobs[job_id]["completed_at"] = datetime.now().isoformat()
        
        return result
    except Exception as e:
        # Update job status to failed
        with job_lock:
            if job_id in jobs:
                jobs[job_id]["status"] = JobStatus.FAILED
                jobs[job_id]["error"] = str(e)
                jobs[job_id]["completed_at"] = datetime.now().isoformat()
        raise

def submit_transcription_job(audio_data: bytes) -> str:
    """Submit a new transcription job and return job ID"""
    job_id = str(uuid.uuid4())
    
    # Create job record
    job = {
        "job_id": job_id,
        "status": JobStatus.PENDING,
        "audio_data": audio_data,
        "created_at": datetime.now().isoformat(),
        "started_at": None,
        "completed_at": None,
        "result": None,
        "error": None
    }
    
    with job_lock:
        jobs[job_id] = job
    
    # Submit job to thread pool for processing
    def process_job():
        with job_lock:
            if job_id in jobs:
                jobs[job_id]["status"] = JobStatus.PROCESSING
                jobs[job_id]["started_at"] = datetime.now().isoformat()
        
        process_transcription(job_id, audio_data)
    
    executor.submit(process_job)
    
    return job_id

def get_job_status(job_id: str) -> Optional[Dict]:
    """Get the current status of a job"""
    with job_lock:
        return jobs.get(job_id)

def cleanup_old_jobs():
    """Clean up completed jobs older than 1 hour to prevent memory bloat"""
    # TODO: Implement cleanup logic for production
    # For now, just keep everything in memory
    pass

# TODO: PRODUCTION CONSIDERATIONS - Add these features for production deployment
# def cleanup_old_jobs():
#     """Clean up completed jobs older than 1 hour to prevent memory bloat"""
#     current_time = datetime.now()
#     with job_lock:
#         jobs_to_remove = []
#         for job_id, job in jobs.items():
#             if job["status"] in [JobStatus.COMPLETED, JobStatus.FAILED]:
#                 job_time = datetime.fromisoformat(job["completed_at"])
#                 if (current_time - job_time).total_seconds() > 3600:  # 1 hour
#                     jobs_to_remove.append(job_id)
#         
#         for job_id in jobs_to_remove:
#             del jobs[job_id]
#             print(f"Cleaned up old job: {job_id}")

# TODO: PRODUCTION CONSIDERATIONS - Add rate limiting
# def check_rate_limit(user_id: str) -> bool:
#     """Check if user has exceeded rate limits"""
#     # Implement rate limiting logic here
#     # - Track requests per user per time window
#     # - Return False if limit exceeded
#     pass

# TODO: PRODUCTION CONSIDERATIONS - Add job timeout handling
# def check_job_timeout(job_id: str) -> bool:
#     """Check if job has been running too long and should be cancelled"""
#     # Implement timeout logic here
#     # - Cancel jobs running longer than 5 minutes
#     # - Update status to FAILED with timeout error
#     pass

# TODO: PRODUCTION CONSIDERATIONS - Add graceful shutdown
# def shutdown_executor():
#     """Gracefully shutdown the thread pool executor"""
#     executor.shutdown(wait=True)

def categorize_transcription(transcription_string: str, user_id: str):
    # TODO: Implement transcription categorization
    model_to_use = get_user_model_from_db(user_id)
    if model_to_use == "openai":
        # TODO: Implement OpenAI categorization
        pass
    elif model_to_use == "anthropic":
        # TODO: Implement Anthropic categorization
        pass

def get_user_model_from_db(user_id: str) -> Literal["openai", "anthropic"]:
    """
    Mocks a slow and expensive function to simulate fetching a user's preferred LLM model from database
    Returns either 'openai' or 'anthropic' after a random delay.
    """
    time.sleep(random.randint(2, 8))
    return random.choice(["openai", "anthropic"])

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    # Get client version from headers
    client_version = request.headers.get('X-Client-Version', 'unknown')
    user_id = request.headers.get('X-User-ID', 'unknown')
    
    # Simple user ID logging
    print(f"User {user_id} submitted transcription")
    
    # TODO: PRODUCTION CONSIDERATIONS - Add input validation
    # if not audio_file or audio_file.filename == '':
    #     return jsonify({"error": "No audio file provided"}), 400
    
    # TODO: PRODUCTION CONSIDERATIONS - Add file size limits
    # MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    # if len(audio_data) > MAX_FILE_SIZE:
    #     return jsonify({"error": "Audio file too large"}), 400
    
    # TODO: PRODUCTION CONSIDERATIONS - Add file type validation
    # ALLOWED_TYPES = ['audio/wav', 'audio/mp3', 'audio/m4a']
    # if audio_file.content_type not in ALLOWED_TYPES:
    #     return jsonify({"error": "Invalid audio file type"}), 400
    
    # Get audio data from request
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    audio_data = audio_file.read()
    
    # TODO: PRODUCTION CONSIDERATIONS - Add rate limiting
    # if not check_rate_limit(user_id):
    #     return jsonify({"error": "Rate limit exceeded"}), 429
    
    # Submit job for processing
    job_id = submit_transcription_job(audio_data)
    
    response = jsonify({
        "job_id": job_id,
        "status": JobStatus.PENDING,
        "message": "Transcription job submitted successfully",
        "version": VERSION,
    })
    
    # Add version header
    response.headers['X-API-Version'] = VERSION
    
    return response

@app.route('/job-status/<job_id>', methods=['GET'])
def get_job_status_endpoint(job_id: str):
    """Get the status of a specific transcription job"""
    # TODO: PRODUCTION CONSIDERATIONS - Add input validation
    # if not job_id or len(job_id) != 36:  # UUID length
    #     return jsonify({"error": "Invalid job ID format"}), 400
    
    job = get_job_status(job_id)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    # Return job status without audio data for security
    response_data = {
        "job_id": job["job_id"],
        "status": job["status"],
        "created_at": job["created_at"],
        "started_at": job["started_at"],
        "completed_at": job["completed_at"],
        "result": job["result"],
        "error": job["error"]
    }
    
    return jsonify(response_data)

@app.route('/jobs', methods=['GET'])
def list_jobs():
    """List all jobs (for debugging/testing purposes)"""
    # TODO: In production, this should be admin-only and paginated
    # TODO: PRODUCTION CONSIDERATIONS - Add authentication
    # if not is_admin_user(request.headers.get('Authorization')):
    #     return jsonify({"error": "Unauthorized"}), 401
    
    # TODO: PRODUCTION CONSIDERATIONS - Add pagination
    # page = request.args.get('page', 1, type=int)
    # per_page = min(request.args.get('per_page', 50, type=int), 100)
    
    with job_lock:
        job_list = []
        for job_id, job in jobs.items():
            job_list.append({
                "job_id": job["job_id"],
                "status": job["status"],
                "created_at": job["created_at"],
                "started_at": job["started_at"],
                "completed_at": job["completed_at"],
                "result": job["result"],
                "error": job["error"]
            })
    
    return jsonify({"jobs": job_list})

@app.route('/generate-user-id', methods=['GET'])
def generate_user_id():
    """Generate a unique user ID for new users"""
    user_id = str(uuid.uuid4())
    users.add(user_id)  # Store in memory
    print(f"Generated user ID: {user_id}")  # Simple logging
    return jsonify({"user_id": user_id})

# TODO: PRODUCTION CONSIDERATIONS - Add health check endpoint
# @app.route('/health', methods=['GET'])
# def health_check():
#     """Health check endpoint for load balancers and monitoring"""
#     return jsonify({
#         "status": "healthy",
#         "timestamp": datetime.now().isoformat(),
#         "active_jobs": len([j for j in jobs.values() if j["status"] in [JobStatus.PENDING, JobStatus.PROCESSING]]),
#         "total_jobs": len(jobs)
#     })

# TODO: PRODUCTION CONSIDERATIONS - Add graceful shutdown handler
# import signal
# def signal_handler(signum, frame):
#     print("Shutting down gracefully...")
#     shutdown_executor()
#     exit(0)
# 
# signal.signal(signal.SIGINT, signal_handler)
# signal.signal(signal.SIGTERM, signal_handler)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

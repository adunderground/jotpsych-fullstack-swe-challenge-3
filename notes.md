THIS IS THE MOST IMPORTANT FILE IN THE ENTIRE REPO! HUMAN WRITING ONLY! NO AI ALLOWED!!

I'm using Cursor to crack this challenge.
My mac did an update last night and my xcode broke so I wasted 10 minutes installing python. Dumb.


Challenge #1
setRecordingTime was not being properly updated. Hardcoded value "5" was used instead of MAX_RECORDING_TIME variable

Challenge #2
added new state variable isTranscribing
set isTranscribing state appropriately when transcription starts/finishes 
add "Transcribing..." during the transcrption
logic disables the recording button during the transcription

Challenge #3
created toast.tsx component to show if the version mismatch is detected
updated variable currentVersion to clientVersion in APIService.ts to make a clear destinction b/w client and API versions. send "X-Client-Version" and "X-User-ID" headers in the request to backend. 
backend now sends the X-API-Version as part of the responce. APIService checks if there is a version mismatch. 

to test this functionality I updated "clientVersion" in APIService.ts to 
~~~
private clientVersion: string = "0.0.9";
~~~

Challenge #4
This is where things got a bit more challenging for me. I brainstormed the solution with Cursor.
changed the /transcribe endpoint to immediately return job id
added new endpoint /job-status/<job_id> for polling individual job status
in APIService.ts we have a new interfaces for checking  job's status and response, and getJobStatus method for status checking. 
AudioRecorder has instanceId prop for identifying each unique transcription. 
updated App.tsx to support multiple recording instances simultaneously, display status for each job individually
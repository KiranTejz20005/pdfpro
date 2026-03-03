import { create } from 'zustand';

type JobStatus = 'idle' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';

interface JobState {
  currentJobId: string | null;
  jobStatus: JobStatus;
  downloadUrl: string | null;
  errorMessage: string | null;
  progress: number;
  
  setJobId: (jobId: string) => void;
  setStatus: (status: JobStatus) => void;
  setDownloadUrl: (url: string) => void;
  setError: (message: string) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  currentJobId: null,
  jobStatus: 'idle',
  downloadUrl: null,
  errorMessage: null,
  progress: 0,
  
  setJobId: (jobId) => set({ currentJobId: jobId, jobStatus: 'queued' }),
  setStatus: (status) => set({ jobStatus: status }),
  setDownloadUrl: (url) => set({ downloadUrl: url, jobStatus: 'completed' }),
  setError: (message) => set({ errorMessage: message, jobStatus: 'failed' }),
  setProgress: (progress) => set({ progress }),
  reset: () => set({
    currentJobId: null,
    jobStatus: 'idle',
    downloadUrl: null,
    errorMessage: null,
    progress: 0,
  }),
}));

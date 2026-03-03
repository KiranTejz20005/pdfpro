# Celery Job-Based Architecture - Minimal Guide

## Flow

```
Upload → job_id → Processing in worker → Frontend polls → Download later
```

## Setup (3 Commands)

```bash
# Terminal 1
redis-server

# Terminal 2
cd backend && celery -A worker worker --loglevel=info --pool=solo

# Terminal 3
cd backend && uvicorn main:app --reload
```

## Install First

```bash
pip install celery==5.3.4 redis==5.0.1 kombu==5.3.4
```

## Migrate Any Endpoint (3 Steps)

### OLD:
```python
@router.post('/merge')
async def merge_pdf(files: List[UploadFile] = File(...)):
    input_paths = [await save_upload(f) for f in files]
    output_path = get_output_path('pdf')
    pdf_ops.merge_pdf(input_paths, output_path)  # BLOCKS
    return FileResponse(output_path, media_type="application/pdf")
```

### NEW:
```python
from job_manager import generate_job_id, create_job
from tasks.pdf_tasks import merge_pdf_task

@router.post('/merge')
async def merge_pdf(files: List[UploadFile] = File(...)):
    input_paths = [await save_upload(f) for f in files]
    output_path = get_output_path('pdf')
    
    job_id = generate_job_id()
    create_job(job_id, 'merge_pdf')
    merge_pdf_task.delay(job_id, input_paths, output_path)  # NON-BLOCKING
    
    return {"job_id": job_id}
```

## Frontend (React)

```typescript
// 1. Upload
const res = await fetch('/api/pdf/merge', { method: 'POST', body: formData });
const { job_id } = await res.json();

// 2. Poll every 2 seconds
const interval = setInterval(async () => {
  const status = await fetch(`/api/jobs/status/${job_id}`).then(r => r.json());
  
  if (status.status === 'completed') {
    clearInterval(interval);
    window.location.href = status.download_url;  // Download
  }
}, 2000);
```

## Test

```bash
# Upload
curl -X POST http://localhost:8000/api/pdf/merge -F "files=@test.pdf"
# Returns: {"job_id":"abc-123"}

# Check status
curl http://localhost:8000/api/jobs/status/abc-123
# Returns: {"status":"completed","download_url":"/api/jobs/download/abc-123"}

# Download
curl -O http://localhost:8000/api/jobs/download/abc-123
```

## That's It!

All tasks are already created in `tasks/` folder.
All service functions remain unchanged.
Just modify endpoints to return `job_id` instead of `FileResponse`.

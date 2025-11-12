# MultiVideoViewer

A full-stack video management application built with FastAPI (Python backend) and React/TypeScript (frontend) for viewing, organizing, and managing a large number of video files.

## Features

- **Local Video Streaming**: Stream videos from your local system
- **File Management**: Easily move or delete videos
- **Video Sync**: Displays up to 12 videos synchronously (perfect for videos with similar lengths!)
- **MP4 Support**: Only supports MP4 playback

## Tech Stack

### Backend

- **FastAPI**
- **Uvicorn**
- **Jinja2**

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **Chakra UI**

## Prerequisites

- **Python 3.8+**
- **Node.js 18+** and npm
- **Chrome** - Firefox has stuttering issues

## Running the Application

#### Create a new virtual environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Start the Servers

```bash
# Run the batch files
run_backend.bat
run_frontend.bat
```

The backend server will start on `http://localhost:8000`
The frontend server will start on `http://localhost:3000`

### Connect

Connect to the frontend server at `http://localhost:3000`, preferably on a Chrome browser.

## Usage

- **Set Source Directory**: Sets the local folder to load videos from. (non-recursive)
- **Set Destination Directory**: Destination folder for moving videos
- **Selection**: Select videos by clicking on them for movement or deletion. Selection is persistent over multiple pages.
- **Seek Bar**: The Seek Bar is synced for all currently displayed videos.

## Troubleshooting

### Common Issues

1. **Firefox**

   - There seems to be some weird stuttering and loading issues on Firefox, likely due to certain differing permissions. (Most browsers don't seem to like local stuff)

2. **Invalid File Type**
   - Currenlty only supports MP4 files.

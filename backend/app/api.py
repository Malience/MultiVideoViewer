from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
import shutil
import mimetypes
from typing import List
import tkinter as tk
from tkinter import filedialog


# Application
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Cleanup

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Variables
src_video_directory: str = ""
dst_video_directory: str = ""
videos: List[str] = []


# Helper Functions
async def select_directory():
    """Opens a folder selection dialog and returns the selected path."""
    root = tk.Tk()
    root.withdraw()
    root.wm_attributes('-topmost', 1)

    directory_path = filedialog.askdirectory()
    print(directory_path)
    root.destroy()
    return directory_path

async def refresh_videos():
    global videos
    videos.clear()

    if not os.path.exists(src_video_directory):
        return
    
    for f in os.listdir(src_video_directory):
        if os.path.splitext(f)[1].lower() in ['.mp4', '.mov', '.avi', '.mkv', '.webm']:
            videos.append(os.path.join(src_video_directory, f))
    


@app.get("/")
async def read_root() -> dict:
    return {
        "src_directory": src_video_directory,
        "dst_directory": dst_video_directory,
        "video_count": len(videos),
    }


@app.post("/set_source")
async def set_source() -> dict:
    """Sets the source video directory"""
    global src_video_directory
    src_video_directory = await select_directory()
    await refresh_videos()
    return {
        "src_directory": src_video_directory,
        "video_count": len(videos),
    }


@app.post("/set_destination")
async def set_destination() -> dict:
    """Sets the destination video directory"""
    global dst_video_directory
    dst_video_directory = await select_directory()
    return {
        "dst_directory": dst_video_directory,
    }


@app.delete("/delete_video")
async def delete_video(body: dict) -> dict:
    """Deletes selected videos and updates the page"""
    global videos
    selection = body["selection"]

    for s in selection:
        os.remove(videos[s])

    # Remove selection from videos
    videos = [vid for i, vid in enumerate(videos) if i not in selection]

    return {
        "video_count": len(videos),
    }


@app.post("/move_video")
async def move_video(body: dict) -> dict:
    """Moves selected videos and updates the page"""
    global videos
    if(dst_video_directory == "" or not os.path.exists(dst_video_directory)): 
        return {
            "video_count": len(videos),
        }

    selection = body["selection"]

    for s in selection:
        video_path = videos[s]
        filename = os.path.basename(video_path)
        shutil.move(video_path, dst_video_directory + "/" + filename)

    # Remove selection from videos
    videos = [vid for i, vid in enumerate(videos) if i not in selection]

    return {
        "video_count": len(videos),
    }


def parse_range_header(range_header, file_size: int) -> tuple[int, int]:
    try:
        unit, ranges = range_header.strip().split('=')
        if unit.lower() != 'bytes':
            raise ValueError("Invalid range unit")
        
        start_str, end_str = ranges.split('-')
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1
        
        if start < 0 or end >= file_size or start > end:
            raise ValueError("Invalid byte range")
            
        return start, end
    
    except Exception as e:
        raise HTTPException(
            status_code=416,
            detail=f"Range header parsing failed: {str(e)}",
            headers={'Accept-Ranges': 'bytes', 'Content-Range': f'bytes */{file_size}'}
        )


@app.get("/video/{id}")
async def stream_video(id: int, request: Request) -> StreamingResponse:
    try:
        video_path = videos[id]
        
        file_size = os.path.getsize(video_path)
        mime_type, _ = mimetypes.guess_type(video_path)
        range_header = request.headers.get("Range")
        
        # Only stream the requested fragment of the file
        if range_header:
            start, end = parse_range_header(range_header, file_size)
            length = end - start + 1

            async def iterfile():
                with open(video_path, mode="rb") as f:
                    f.seek(start)
                    yield f.read(length)

            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(length),
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
            return StreamingResponse(
                iterfile(),
                status_code=206,
                media_type=mime_type,
                headers=headers
            )
        
        # Stream the full file
        else:
            def iterfile():
                with open(video_path, mode="rb") as f:
                    yield from f

            return StreamingResponse(
                iterfile(),
                media_type=mime_type,
                headers={
                    "Content-Length": str(file_size),
                    "Content-Disposition": f"inline; filename={video_path}",
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
        )
    except HTTPException as e:
        raise e
    except IndexError:
        raise HTTPException(status_code=404, detail="Video not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
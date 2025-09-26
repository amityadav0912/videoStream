import ffmpeg from "ffmpeg";

export const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    // ffprobe is a method provided by fluent-ffmpeg to analyze video metadata
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        // If an error occurs, reject the Promise with an error message
        reject("Error extracting video duration");
      } else {
        // If successful, resolve the Promise with the duration of the video
        resolve(metadata.format.duration);
      }
    });
  });
};

/**
 * Camera / microphone access with friendly failure handling.
 */

/**
 * Asks for camera + mic. If the camera is missing or already in use (very
 * common when testing two windows on one PC), retries with the mic only so
 * the call can still go ahead. A blocked permission is NOT retried.
 *
 * @returns {Promise<{ stream: MediaStream, audioOnly: boolean }>}
 */
export async function getLocalMedia() {
  if (!navigator.mediaDevices?.getUserMedia) {
    const err = new Error("getUserMedia is not available");
    err.name = "NotSupportedError"; // e.g. plain http:// on a non-localhost address
    throw err;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return { stream, audioOnly: false };
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") throw err;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return { stream, audioOnly: true };
  }
}

/** Turns a getUserMedia error into { code, message } for the UI. */
export function describeMediaError(err) {
  switch (err?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return {
        code: "MEDIA_DENIED",
        message:
          "Camera/microphone access was blocked. Click the camera icon in your browser's address bar, allow access, then try again.",
      };
    case "NotFoundError":
    case "DevicesNotFoundError":
      return {
        code: "MEDIA_MISSING",
        message: "No microphone was found on this device. Plug one in and try again.",
      };
    case "NotReadableError":
    case "TrackStartError":
      return {
        code: "MEDIA_BUSY",
        message:
          "Your microphone is being used by another app or browser. Close it and try again.",
      };
    case "NotSupportedError":
      return {
        code: "MEDIA_UNSUPPORTED",
        message:
          "Video calls need a secure connection. Use https:// or open the app on localhost.",
      };
    default:
      return {
        code: "MEDIA_FAILED",
        message: "Couldn't start your camera or microphone. Check your device settings and try again.",
      };
  }
}

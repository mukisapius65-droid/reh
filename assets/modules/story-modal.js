// assets/modules/story-modal.js
import { getCurrentUser, showToast } from "../utils.js";

// Module-level mic state so the modal close handler can clean up
let _activeMediaStream = null;
let _activeMediaRecorder = null;

const modalHTML = `
<div id="story-upload-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9998; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
  <div style="background: linear-gradient(145deg, #1a1a2e, #16213e); padding:2rem; border-radius:20px; max-width:400px; width:90%; box-shadow: 0 8px 32px rgba(0,0,0,0.6); border:1px solid rgba(245,166,35,0.3);">
    <h3 style="color:#f5a623; font-family:'Playfair Display',serif; text-align:center; margin-bottom:1.5rem;">Add Story</h3>
    <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; justify-content:center;">
      <button class="story-type-btn active" data-type="text" style="background:rgba(245,166,35,0.2); border:1px solid #f5a623; color:#f5a623; padding:8px 16px; border-radius:20px; cursor:pointer; transition:all 0.2s;">Text</button>
      <button class="story-type-btn" data-type="photo" style="background:transparent; border:1px solid #555; color:#ccc; padding:8px 16px; border-radius:20px; cursor:pointer; transition:all 0.2s;">Photo</button>
      <button class="story-type-btn" data-type="audio" style="background:transparent; border:1px solid #555; color:#ccc; padding:8px 16px; border-radius:20px; cursor:pointer; transition:all 0.2s;">Audio</button>
    </div>
    <div id="story-upload-content">
      <textarea id="story-text-input" placeholder="What's on your mind?" style="width:100%; height:120px; border-radius:10px; padding:1rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #555; resize:none; font-family:'Inter',sans-serif;"></textarea>
    </div>
    <div id="record-indicator" style="display:none; text-align:center; color:#ff4444; font-size:0.85rem; font-weight:600; margin-top:0.5rem;">
      ● Recording…
    </div>
    <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:center;">
      <button id="story-upload-submit" style="background:#f5a623; color:#000; border:none; padding:10px 30px; border-radius:30px; font-weight:bold; cursor:pointer; transition:all 0.2s;">Post</button>
      <button id="story-upload-close" style="background:transparent; color:#fff; border:1px solid #555; padding:10px 20px; border-radius:30px; cursor:pointer; transition:all 0.2s;">Cancel</button>
    </div>
  </div>
</div>`;

let selectedStoryType = "text";

function stopAnyActiveRecording(discard = false) {
  if (_activeMediaRecorder && _activeMediaRecorder.state !== "inactive") {
    if (discard) {
      // Detach the handler so a stopped-for-discard recording can't
      // write its blob back into window._recordedAudioBlob later.
      _activeMediaRecorder.onstop = null;
    }
    try {
      _activeMediaRecorder.stop();
    } catch (e) {}
  }
  if (_activeMediaStream) {
    try {
      _activeMediaStream.getTracks().forEach((t) => t.stop());
    } catch (e) {}
  }
  _activeMediaRecorder = null;
  _activeMediaStream = null;
}

function closeStoryUploadModal() {
  // Stop any in‑progress recording first (prevents mic staying hot)
  stopAnyActiveRecording(true);

  // Clear any staged recording so a text story isn't haunted by an old blob
  window._recordedAudioBlob = null;

  const modal = document.getElementById("story-upload-modal");
  if (modal) modal.style.display = "none";

  const container = document.getElementById("story-upload-content");
  if (container) {
    container.innerHTML = `<textarea id="story-text-input" placeholder="What's on your mind?" style="width:100%; height:120px; border-radius:10px; padding:1rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #555; resize:none; font-family:'Inter',sans-serif;"></textarea>`;
  }

  const recInd = document.getElementById("record-indicator");
  if (recInd) recInd.style.display = "none";

  document.querySelectorAll(".story-type-btn").forEach((b) => {
    b.style.background = "transparent";
    b.style.borderColor = "#555";
    b.style.color = "#ccc";
  });
  const textBtn = document.querySelector('.story-type-btn[data-type="text"]');
  if (textBtn) {
    textBtn.style.background = "rgba(245,166,35,0.2)";
    textBtn.style.borderColor = "#f5a623";
    textBtn.style.color = "#f5a623";
  }
  selectedStoryType = "text";
}

function setupMicRecording() {
  const micBtn = document.getElementById("mic-record-btn");
  const previewDiv = document.getElementById("audio-preview");
  const previewPlayer = document.getElementById("audio-preview-player");
  const cancelBtn = document.getElementById("audio-record-cancel");
  const recInd = document.getElementById("record-indicator");
  if (!micBtn) return;

  let isRecording = false;
  let userWantsRecording = false;
  let recordedChunks = [];

  async function startRecording() {
    if (isRecording) return;
    userWantsRecording = true;

    // Clear any staged preview from a prior recording so the user doesn't
    // confuse it with the one they're about to make. If this attempt fails
    // (too short, permission denied), the old blob won't linger.
    previewDiv.style.display = "none";
    previewPlayer.src = "";
    window._recordedAudioBlob = null;

    try {
      _activeMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // User released while permission dialog was open → abort cleanly
      if (!userWantsRecording) {
        _activeMediaStream.getTracks().forEach((t) => t.stop());
        _activeMediaStream = null;
        return;
      }

      // Pick a MIME type the device supports (Chrome/Android → webm, Safari/iOS → mp4)
      let mimeType = "";
      if (window.MediaRecorder.isTypeSupported("audio/webm"))
        mimeType = "audio/webm";
      else if (window.MediaRecorder.isTypeSupported("audio/mp4"))
        mimeType = "audio/mp4";

      _activeMediaRecorder = mimeType
        ? new MediaRecorder(_activeMediaStream, { mimeType })
        : new MediaRecorder(_activeMediaStream);

      recordedChunks = [];

      _activeMediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      _activeMediaRecorder.onstop = () => {
        if (recordedChunks.length === 0) {
          showToast("Recording too short — hold a bit longer.");
          stopAnyActiveRecording();
          isRecording = false;
          micBtn.style.background = "linear-gradient(135deg, #8b1a2b, #c9a84c)";
          micBtn.querySelector("i").className = "fa-solid fa-microphone";
          if (recInd) recInd.style.display = "none";
          return;
        }

        const blob = new Blob(recordedChunks, {
          type: _activeMediaRecorder.mimeType || "audio/webm",
        });
        window._recordedAudioBlob = blob;
        if (previewPlayer.src && previewPlayer.src.startsWith("blob:")) {
          URL.revokeObjectURL(previewPlayer.src);
        }
        previewPlayer.src = URL.createObjectURL(blob);
        previewDiv.style.display = "block";
        stopAnyActiveRecording();
        isRecording = false;
        micBtn.style.background = "linear-gradient(135deg, #8b1a2b, #c9a84c)";
        micBtn.querySelector("i").className = "fa-solid fa-microphone";
        if (recInd) recInd.style.display = "none";
      };

      _activeMediaRecorder.start();
      isRecording = true;
      micBtn.style.background = "#ff4444";
      micBtn.querySelector("i").className = "fa-solid fa-stop";
      if (recInd) recInd.style.display = "block";
    } catch (err) {
      console.error("[mic] error:", err);
      userWantsRecording = false;
      stopAnyActiveRecording();
      showToast("❌ Mic access denied. Please allow microphone.");
    }
  }

  function stopRecording() {
    userWantsRecording = false;
    if (_activeMediaRecorder && _activeMediaRecorder.state !== "inactive") {
      try {
        _activeMediaRecorder.stop();
      } catch (e) {}
    }
  }

  micBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startRecording();
  });
  micBtn.addEventListener("mouseup", (e) => {
    e.preventDefault();
    stopRecording();
  });
  micBtn.addEventListener("mouseleave", () => stopRecording());
  micBtn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      startRecording();
    },
    { passive: false },
  );
  micBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopRecording();
  });
  micBtn.addEventListener("touchcancel", () => stopRecording());

  if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    if (previewPlayer.src && previewPlayer.src.startsWith('blob:')) {
      URL.revokeObjectURL(previewPlayer.src);
    }
    previewDiv.style.display = 'none';
    previewPlayer.src = '';
    window._recordedAudioBlob = null;
    recordedChunks = [];
    micBtn.style.background = 'linear-gradient(135deg, #8b1a2b, #c9a84c)';
    micBtn.querySelector('i').className = 'fa-solid fa-microphone';
    if (recInd) recInd.style.display = 'none';
  });
}
}

export function initStoryModal() {
  if (document.getElementById("story-upload-modal")) return;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // ─── Type switcher ──────────────────────────────
  document.querySelectorAll(".story-type-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      document.querySelectorAll(".story-type-btn").forEach((b) => {
        b.style.background = "transparent";
        b.style.borderColor = "#555";
        b.style.color = "#ccc";
      });
      this.style.background = "rgba(245,166,35,0.2)";
      this.style.borderColor = "#f5a623";
      this.style.color = "#f5a623";

      selectedStoryType = this.dataset.type;

      const contentContainer = document.getElementById("story-upload-content");
      const recInd = document.getElementById("record-indicator");
      if (recInd) recInd.style.display = "none";

      // Any staged recording is discarded when switching type
      window._recordedAudioBlob = null;
      stopAnyActiveRecording(true);

      if (selectedStoryType === "text") {
        contentContainer.innerHTML = `<textarea id="story-text-input" placeholder="What's on your mind?" style="width:100%; height:120px; border-radius:10px; padding:1rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #555; resize:none; font-family:'Inter',sans-serif;"></textarea>`;
      } else if (selectedStoryType === "photo") {
        contentContainer.innerHTML = `<input type="file" id="story-file-input" accept="image/*" style="color:#fff; width:100%; padding:0.5rem 0;">`;
      } else if (selectedStoryType === "audio") {
        if (
          navigator.mediaDevices?.getUserMedia &&
          typeof MediaRecorder !== "undefined"
        ) {
          contentContainer.innerHTML = `
            <div style="text-align:center; padding:0.5rem 0;">
              <button id="mic-record-btn" style="
                width:80px; height:80px; border-radius:50%;
                background:linear-gradient(135deg, #8b1a2b, #c9a84c);
                border:none; color:white; font-size:2.4rem;
                cursor:pointer; transition:0.3s;
                box-shadow:0 0 20px rgba(200,160,60,0.4);
                touch-action:none; user-select:none;
              ">
                <i class="fa-solid fa-microphone"></i>
              </button>
              <p style="color:#c5bfb3; margin-top:0.5rem; font-size:0.8rem;">
                Hold to record, release to stop
              </p>
              <div id="audio-preview" style="display:none; margin-top:1rem;">
                <audio controls id="audio-preview-player" style="width:100%;"></audio>
                <button id="audio-record-cancel" type="button"
                  style="margin-top:0.5rem; background:transparent; border:1px solid #555;
                         color:#c5bfb3; padding:0.3rem 1rem; border-radius:20px; cursor:pointer;">
                  Cancel Recording
                </button>
              </div>
            </div>
          `;
          setupMicRecording();
        } else {
          contentContainer.innerHTML = `
            <p style="color:#8a857a; font-size:0.85rem; text-align:center; padding:1rem 0;">
              Audio recording is not supported on this browser.
            </p>
          `;
        }
      }
    });
  });

  // ─── Submit handler ─────────────────────────────
  document
    .getElementById("story-upload-submit")
    .addEventListener("click", async function () {
      const user = getCurrentUser();
      if (!user) {
        showToast("Please log in first.");
        return;
      }

      let content;

      if (selectedStoryType === "text") {
        const input = document.getElementById("story-text-input");
        content = input ? input.value.trim() : "";
        if (!content) {
          showToast("Please write something.");
          return;
        }
      } else if (selectedStoryType === "photo") {
        const fileInput = document.getElementById("story-file-input");
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
          showToast("Please select a photo.");
          return;
        }
        content = fileInput.files[0];
        if (!content.type.startsWith("image/")) {
          showToast("Please select a valid image file.");
          return;
        }
      } else if (selectedStoryType === "audio") {
        const recordedBlob = window._recordedAudioBlob;
        if (!recordedBlob) {
          showToast("Please record something first — hold the mic.");
          return;
        }
        const ext = (recordedBlob.type || "audio/webm").includes("mp4")
          ? "m4a"
          : "webm";
        const fileName = `audio_${Date.now()}.${ext}`;
        content = new File([recordedBlob], fileName, {
          type: recordedBlob.type || "audio/webm",
        });
      }

      try {
        if (typeof window.uploadStory !== "function") {
          throw new Error(
            "window.uploadStory is not a function. Check if stories.js is loaded.",
          );
        }
        const docId = await window.uploadStory(
          user,
          selectedStoryType,
          content,
        );
        console.log("Story uploaded successfully, ID:", docId);
        closeStoryUploadModal();
        if (typeof window.renderStories === "function") {
          window.renderStories();
        }
        const emoji =
          { text: "✍️", photo: "📸", audio: "🎤" }[selectedStoryType] || "✨";
        showToast(`${emoji} Story posted successfully!`);
      } catch (err) {
        console.error("Upload error:", err);
        showToast(`Upload failed: ${err.message || "Unknown error"}`);
      }
    });

  // ─── Close handlers ─────────────────────────────
  document
    .getElementById("story-upload-close")
    .addEventListener("click", closeStoryUploadModal);
  document
    .getElementById("story-upload-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeStoryUploadModal();
    });

  // ─── Expose open globally ──────────────────────
  window.openStoryUploadModal = function () {
    const modal = document.getElementById("story-upload-modal");
    if (modal) modal.style.display = "flex";
  };

  // ─── Hook the bottom-nav "+" button ────────────
  const addBtn = document.getElementById("createStoryBtn");
  if (addBtn) {
    addBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof window.openStoryUploadModal === "function") {
        window.openStoryUploadModal();
      }
    });
  }

  // ─── Cleanup expired stories ────────────────────
  if (typeof window.cleanupExpiredStories === "function") {
    window
      .cleanupExpiredStories()
      .catch((err) => console.warn("Initial cleanup failed:", err));
    setInterval(() => {
      window
        .cleanupExpiredStories()
        .catch((err) => console.warn("Cleanup interval failed:", err));
    }, 300000);
  }
}

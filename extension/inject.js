// Zaalys Live — câmera virtual (roda no contexto da página).
// Quando ligada, a página do TikTok que pedir a câmera recebe um stream
// com os clipes do produto em loop e o áudio dos clipes ou da narração.
(() => {
  if (window.__mediaflowCam) return;

  const W = 1080;
  const H = 1920;
  const state = {
    enabled: false,
    clips: [], // object URLs do produto atual
    narration: null, // object URL de áudio em loop (opcional)
    clipIndex: 0,
  };

  // Elementos que produzem o stream
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const video = document.createElement("video");
  video.muted = false;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  const narrationEl = new Audio();
  narrationEl.loop = true;

  let audioCtx = null;
  let audioDest = null;
  let stream = null;

  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new AudioContext();
    audioDest = audioCtx.createMediaStreamDestination();
    // O áudio vai para o stream da live, não para as caixas de som.
    audioCtx.createMediaElementSource(video).connect(audioDest);
    audioCtx.createMediaElementSource(narrationEl).connect(audioDest);
  }

  function drawFrame() {
    if (video.readyState >= 2 && video.videoWidth) {
      // Preenche 9:16 cortando as sobras (cover)
      const scale = Math.max(W / video.videoWidth, H / video.videoHeight);
      const dw = video.videoWidth * scale;
      const dh = video.videoHeight * scale;
      ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }
    requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);

  function playClip(i) {
    if (!state.clips.length) return;
    state.clipIndex = ((i % state.clips.length) + state.clips.length) % state.clips.length;
    video.src = state.clips[state.clipIndex];
    // Com narração, o som dos clipes fica baixo para não competir.
    video.volume = state.narration ? 0.15 : 1;
    video.play().catch(() => {});
  }
  video.addEventListener("ended", () => playClip(state.clipIndex + 1));

  function buildStream() {
    ensureAudio();
    const v = canvas.captureStream(30).getVideoTracks()[0];
    const a = audioDest.stream.getAudioTracks()[0];
    stream = new MediaStream([v, a]);
    v.addEventListener("ended", () => post("cam-ended"));
    return stream;
  }

  function post(type, detail) {
    window.postMessage({ source: "mediaflow-cam", type, detail }, location.origin);
  }

  // Substitui o pedido de câmera/microfone enquanto a câmera estiver ligada.
  const md = navigator.mediaDevices;
  if (md && md.getUserMedia) {
    const original = md.getUserMedia.bind(md);
    md.getUserMedia = async (constraints) => {
      if (!state.enabled) return original(constraints);
      const s = stream ?? buildStream();
      const tracks = [];
      if (constraints && constraints.video) tracks.push(s.getVideoTracks()[0].clone());
      if (constraints && constraints.audio) tracks.push(s.getAudioTracks()[0].clone());
      post("cam-requested", { video: !!constraints?.video, audio: !!constraints?.audio });
      return new MediaStream(tracks);
    };
    const originalEnum = md.enumerateDevices?.bind(md);
    if (originalEnum) {
      md.enumerateDevices = async () => {
        const list = await originalEnum();
        if (!state.enabled) return list;
        // Garante que a página veja uma câmera e um microfone disponíveis.
        return [
          { deviceId: "mediaflow-cam", kind: "videoinput", label: "Zaalys Live (clipes)", groupId: "zaalys", toJSON() { return this; } },
          { deviceId: "mediaflow-mic", kind: "audioinput", label: "Zaalys Live (narração)", groupId: "zaalys", toJSON() { return this; } },
          ...list.filter((d) => d.kind === "audiooutput"),
        ];
      };
    }
  }

  // Comandos vindos do content script (mundo isolado).
  window.addEventListener("message", (e) => {
    if (e.source !== window || e.data?.source !== "mediaflow-ext") return;
    const { type, payload } = e.data;

    if (type === "set-clips") {
      state.clips.forEach((u) => URL.revokeObjectURL(u));
      state.clips = (payload.files || []).map((f) => URL.createObjectURL(f));
      playClip(0);
      post("clips-ready", { count: state.clips.length });
    }
    if (type === "set-narration") {
      if (state.narration) URL.revokeObjectURL(state.narration);
      state.narration = payload.file ? URL.createObjectURL(payload.file) : null;
      if (state.narration) {
        narrationEl.src = state.narration;
        narrationEl.play().catch(() => {});
      } else narrationEl.pause();
      video.volume = state.narration ? 0.15 : 1;
    }
    if (type === "enable") {
      state.enabled = true;
      ensureAudio();
      audioCtx.resume();
      playClip(state.clipIndex);
      post("cam-enabled");
    }
    if (type === "disable") {
      state.enabled = false;
      video.pause();
      narrationEl.pause();
      post("cam-disabled");
    }
    if (type === "preview-request") {
      post("preview", { dataUrl: canvas.toDataURL("image/jpeg", 0.5) });
    }
  });

  window.__mediaflowCam = true;
})();

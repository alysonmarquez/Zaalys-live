// MediaFlowMZ Live — câmera e microfone virtuais (roda no contexto da página do TikTok).
// Com clipes carregados, a página passa a ver "MediaFlowMZ Live (vídeo)" e "MediaFlowMZ Live (áudio)" na lista
// de câmeras e microfones; escolhidos, recebem os clipes em ordem aleatória e o som deles.
(() => {
  if (window.__zaalysCam) return;
  window.__zaalysCam = true;

  const W = 1080;
  const H = 1920;
  const CAM_ID = "zaalys-live-video";
  const MIC_ID = "zaalys-live-audio";
  const state = { ready: false, clips: [], order: [], pos: 0 };

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const video = document.createElement("video");
  video.playsInline = true;
  let audioCtx = null;
  let audioDest = null;
  let stream = null;

  const post = (type, detail) => window.postMessage({ source: "zaalys-cam", type, detail }, location.origin);

  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new AudioContext();
    audioDest = audioCtx.createMediaStreamDestination();
    audioCtx.createMediaElementSource(video).connect(audioDest); // o som vai para a live, não para as caixas
  }

  (function draw() {
    if (video.readyState >= 2 && video.videoWidth) {
      const s = Math.max(W / video.videoWidth, H / video.videoHeight);
      const dw = video.videoWidth * s;
      const dh = video.videoHeight * s;
      ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }
    requestAnimationFrame(draw);
  })();

  const shuffle = (n) => {
    const a = [...Array(n).keys()];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function next() {
    if (!state.clips.length) return;
    if (state.pos >= state.order.length) {
      state.order = shuffle(state.clips.length);
      state.pos = 0;
    }
    video.src = state.clips[state.order[state.pos++]];
    video.play().catch(() => {});
  }
  video.addEventListener("ended", next);

  function getStream() {
    if (stream) return stream;
    ensureAudio();
    const v = canvas.captureStream(30).getVideoTracks()[0];
    const a = audioDest.stream.getAudioTracks()[0];
    v.addEventListener("ended", () => post("cam-ended"));
    stream = new MediaStream([v, a]);
    return stream;
  }

  const wants = (c, id) => {
    if (!c) return false;
    const d = c.deviceId;
    const val = typeof d === "string" ? d : d?.exact ?? d?.ideal;
    return Array.isArray(val) ? val.includes(id) : val === id;
  };

  const md = navigator.mediaDevices;
  if (md?.getUserMedia) {
    const original = md.getUserMedia.bind(md);
    md.getUserMedia = async (constraints = {}) => {
      if (!state.ready) return original(constraints);
      const vid = constraints.video && (wants(constraints.video, CAM_ID) || constraints.video === true || !constraints.video.deviceId);
      const aud = constraints.audio && (wants(constraints.audio, MIC_ID) || constraints.audio === true || !constraints.audio.deviceId);
      if (!vid && !aud) return original(constraints);
      ensureAudio();
      audioCtx.resume();
      const s = getStream();
      const tracks = [];
      if (vid) tracks.push(s.getVideoTracks()[0].clone());
      if (aud) tracks.push(s.getAudioTracks()[0].clone());
      // Pedido misto (nossa câmera + microfone real, ou o contrário): completa com o aparelho real.
      if (constraints.video && !vid) tracks.push(...(await original({ video: constraints.video })).getVideoTracks());
      if (constraints.audio && !aud) tracks.push(...(await original({ audio: constraints.audio })).getAudioTracks());
      post("cam-requested", { video: !!vid, audio: !!aud });
      return new MediaStream(tracks);
    };
    const originalEnum = md.enumerateDevices?.bind(md);
    if (originalEnum) {
      md.enumerateDevices = async () => {
        const list = await originalEnum().catch(() => []);
        if (!state.ready) return list;
        const fake = (deviceId, kind, label) => ({ deviceId, kind, label, groupId: "zaalys-live", toJSON() { return { deviceId, kind, label, groupId: "zaalys-live" }; } });
        return [fake(CAM_ID, "videoinput", "MediaFlowMZ Live (vídeo)"), fake(MIC_ID, "audioinput", "MediaFlowMZ Live (áudio)"), ...list];
      };
    }
  }

  window.addEventListener("message", (e) => {
    if (e.source !== window || e.data?.source !== "zaalys-ext") return;
    const { type, payload } = e.data;
    if (type === "set-clips") {
      state.clips.forEach((u) => URL.revokeObjectURL(u));
      state.clips = (payload.files || []).map((f) => URL.createObjectURL(f));
      state.order = shuffle(state.clips.length);
      state.pos = 0;
      state.ready = state.clips.length > 0;
      next();
      // Avisa a página que a lista de aparelhos mudou (o TikTok atualiza o seletor de câmera).
      md?.dispatchEvent?.(new Event("devicechange"));
      post("clips-ready", { count: state.clips.length });
    }
    if (type === "preview-request") post("preview", { dataUrl: canvas.toDataURL("image/jpeg", 0.45) });
  });
})();

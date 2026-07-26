(() => {
  "use strict";

  const canvas = document.querySelector("#profile-canvas");
  const form = document.querySelector("#profile-form");
  if (!(canvas instanceof HTMLCanvasElement) || !(form instanceof HTMLFormElement)) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const storageKey = "profile-palette:card:v1";
  const sessionKey = "profile-palette:session:v1";
  const visitKey = "profile-palette:last-visit:v1";
  const today = new Date().toISOString().slice(0, 10);
  const defaultState = {
    template: "aurora",
    accent: "#a9ff68",
    displayName: "Palette",
    xHandle: "@palette_vrc",
    vrchatId: "Palette_vrc",
    message: "写真を撮ったり、のんびり雑談したり。",
    activity: ["平日夜", "土日"],
    interests: ["雑談", "写真", "改変"],
    friendOpen: true,
    imageX: 0,
    imageY: 0,
    imageZoom: 100,
  };

  const safeParse = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const storedState = safeParse(localStorage.getItem(storageKey));
  let state = {
    ...defaultState,
    ...(storedState && typeof storedState === "object" ? storedState : {}),
  };
  let images = [null, null, null];
  let imageUrls = [null, null, null];
  let hasStarted = false;
  let hasReportedReady = false;
  let renderQueued = false;

  const element = (selector) => document.querySelector(selector);
  const displayNameInput = element("#display-name");
  const xHandleInput = element("#x-handle");
  const vrchatIdInput = element("#vrchat-id");
  const messageInput = element("#message");
  const messageCount = element("#message-count");
  const friendOpenInput = element("#friend-open");
  const imageXInput = element("#image-x");
  const imageYInput = element("#image-y");
  const imageZoomInput = element("#image-zoom");
  const downloadButton = element("#download-button");
  const copyButton = element("#copy-button");
  const resetButton = element("#reset-button");
  const actionStatus = element("#action-status");

  const makeSessionId = () => {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(/[xy]/g, (character) => {
      const random = Math.floor(Math.random() * 16);
      const value = character === "x" ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
  };

  let sessionId = localStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = makeSessionId();
    localStorage.setItem(sessionKey, sessionId);
  }

  const track = (name) => {
    void fetch("/api/events", {
      body: JSON.stringify({
        name,
        sessionId,
        template: state.template,
      }),
      headers: { "content-type": "application/json" },
      keepalive: true,
      method: "POST",
    }).catch(() => undefined);
  };

  const lastVisit = localStorage.getItem(visitKey);
  track("visited");
  if (lastVisit && lastVisit !== today) {
    track("returned");
  }
  localStorage.setItem(visitKey, today);

  const setStatus = (message, kind = "") => {
    if (!(actionStatus instanceof HTMLElement)) {
      return;
    }
    actionStatus.textContent = message;
    actionStatus.dataset.kind = kind;
  };

  const saveState = () => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  const reportStarted = () => {
    if (hasStarted) {
      return;
    }
    hasStarted = true;
    track("started");
  };

  const reportReady = () => {
    const ready = Boolean(images[0]) && state.displayName.trim().length > 0;
    if (downloadButton instanceof HTMLButtonElement) {
      downloadButton.disabled = !ready;
    }
    if (ready && !hasReportedReady) {
      hasReportedReady = true;
      track("ready");
    }
  };

  const roundedRect = (ctx, x, y, width, height, radius) => {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
    ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
    ctx.arcTo(x, y + height, x, y, safeRadius);
    ctx.arcTo(x, y, x + width, y, safeRadius);
    ctx.closePath();
  };

  const drawCoverImage = (ctx, image, x, y, width, height, radius, adjustable = false) => {
    ctx.save();
    roundedRect(ctx, x, y, width, height, radius);
    ctx.clip();

    if (!image) {
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, "#6e52a6");
      gradient.addColorStop(0.45, "#263d61");
      gradient.addColorStop(1, "#0f161d");
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);

      ctx.globalAlpha = 0.65;
      ctx.fillStyle = state.accent;
      ctx.beginPath();
      ctx.arc(x + width * 0.72, y + height * 0.28, Math.min(width, height) * 0.23, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.beginPath();
      ctx.arc(x + width * 0.46, y + height * 0.45, Math.min(width, height) * 0.18, 0, Math.PI * 2);
      ctx.fill();
      roundedRect(
        ctx,
        x + width * 0.22,
        y + height * 0.6,
        width * 0.56,
        height * 0.52,
        Math.min(width, height) * 0.2,
      );
      ctx.fill();
      ctx.restore();
      return;
    }

    const zoom = adjustable ? state.imageZoom / 100 : 1;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const offsetX = adjustable
      ? (state.imageX / 100) * Math.max(0, drawWidth - width + width * 0.3)
      : 0;
    const offsetY = adjustable
      ? (state.imageY / 100) * Math.max(0, drawHeight - height + height * 0.3)
      : 0;
    const drawX = x + (width - drawWidth) / 2 + offsetX;
    const drawY = y + (height - drawHeight) / 2 + offsetY;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  };

  const font = (weight, size) =>
    `${weight} ${size}px "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", system-ui, sans-serif`;

  const drawText = (ctx, text, x, y, options = {}) => {
    const {
      color = "#ffffff",
      maxWidth,
      size = 32,
      weight = 700,
      align = "left",
      baseline = "alphabetic",
    } = options;
    ctx.fillStyle = color;
    ctx.font = font(weight, size);
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y, maxWidth);
  };

  const wrapLines = (ctx, text, maxWidth, maxLines = 3) => {
    const characters = Array.from(text);
    const lines = [];
    let line = "";

    for (const character of characters) {
      const candidate = `${line}${character}`;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = character;
        if (lines.length === maxLines) {
          break;
        }
      } else {
        line = candidate;
      }
    }

    if (lines.length < maxLines && line) {
      lines.push(line);
    }

    if (lines.length === maxLines && characters.join("").length > lines.join("").length) {
      let finalLine = lines.at(-1) ?? "";
      while (ctx.measureText(`${finalLine}…`).width > maxWidth && finalLine) {
        finalLine = finalLine.slice(0, -1);
      }
      lines[lines.length - 1] = `${finalLine}…`;
    }
    return lines;
  };

  const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, options = {}) => {
    ctx.font = font(options.weight ?? 600, options.size ?? 30);
    const lines = wrapLines(ctx, text, maxWidth, options.maxLines ?? 3);
    lines.forEach((line, index) => {
      drawText(ctx, line, x, y + index * lineHeight, options);
    });
  };

  const drawPill = (ctx, text, x, y, options = {}) => {
    const size = options.size ?? 26;
    const paddingX = options.paddingX ?? 22;
    const height = options.height ?? 52;
    ctx.font = font(options.weight ?? 700, size);
    const width = ctx.measureText(text).width + paddingX * 2;
    roundedRect(ctx, x, y, width, height, height / 2);
    ctx.fillStyle = options.background ?? "rgba(255,255,255,0.12)";
    ctx.fill();
    if (options.stroke) {
      ctx.strokeStyle = options.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    drawText(ctx, text, x + paddingX, y + height / 2, {
      baseline: "middle",
      color: options.color ?? "#ffffff",
      size,
      weight: options.weight ?? 700,
    });
    return width;
  };

  const drawFooterBrand = (ctx, color, right = 1538) => {
    ctx.save();
    ctx.globalAlpha = 0.78;
    drawText(ctx, "PROF PALETTE", right, 848, {
      align: "right",
      color,
      size: 22,
      weight: 800,
    });
    ctx.fillStyle = state.accent;
    ctx.beginPath();
    ctx.arc(right - 186, 840, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const normalizedHandle = () => {
    const handle = state.xHandle.trim();
    return handle && !handle.startsWith("@") ? `@${handle}` : handle;
  };

  const drawAurora = (ctx) => {
    const background = ctx.createLinearGradient(0, 0, 1600, 900);
    background.addColorStop(0, "#10131b");
    background.addColorStop(0.58, "#171b25");
    background.addColorStop(1, "#0c1017");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1600, 900);

    const glow = ctx.createRadialGradient(1180, 190, 0, 1180, 190, 480);
    glow.addColorStop(0, `${state.accent}66`);
    glow.addColorStop(1, `${state.accent}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(700, 0, 900, 680);

    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    for (let x = 960; x < 1600; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 900);
      ctx.stroke();
    }
    for (let y = 0; y < 900; y += 64) {
      ctx.beginPath();
      ctx.moveTo(900, y);
      ctx.lineTo(1600, y);
      ctx.stroke();
    }

    drawCoverImage(ctx, images[0], 58, 54, 850, 792, 34, true);
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 2;
    roundedRect(ctx, 58, 54, 850, 792, 34);
    ctx.stroke();

    drawText(ctx, "VRCHAT // PROFILE", 984, 96, {
      color: state.accent,
      size: 22,
      weight: 800,
    });
    drawText(ctx, state.displayName || "No name", 984, 194, {
      color: "#ffffff",
      maxWidth: 540,
      size: 68,
      weight: 850,
    });
    drawText(ctx, normalizedHandle(), 988, 245, {
      color: "rgba(255,255,255,0.62)",
      maxWidth: 520,
      size: 30,
      weight: 600,
    });

    drawPill(ctx, state.friendOpen ? "● フレンド申請 OK" : "● ひとことください", 984, 292, {
      background: state.friendOpen ? `${state.accent}22` : "rgba(255,255,255,0.09)",
      color: state.friendOpen ? state.accent : "#ffffff",
      size: 23,
      stroke: state.friendOpen ? `${state.accent}66` : "rgba(255,255,255,0.15)",
    });

    drawText(ctx, "LIKE", 984, 398, {
      color: "rgba(255,255,255,0.42)",
      size: 19,
      weight: 800,
    });
    let tagX = 984;
    state.interests.slice(0, 4).forEach((interest) => {
      const width = drawPill(ctx, interest, tagX, 420, {
        background: "rgba(255,255,255,0.1)",
        size: 23,
      });
      tagX += width + 12;
    });

    drawText(ctx, "ACTIVE", 984, 520, {
      color: "rgba(255,255,255,0.42)",
      size: 19,
      weight: 800,
    });
    drawText(ctx, state.activity.join(" · ") || "不定期", 984, 562, {
      color: "#ffffff",
      maxWidth: 520,
      size: 29,
      weight: 700,
    });

    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.beginPath();
    ctx.moveTo(984, 608);
    ctx.lineTo(1528, 608);
    ctx.stroke();
    drawWrappedText(ctx, state.message, 984, 660, 540, 43, {
      color: "rgba(255,255,255,0.9)",
      maxLines: 3,
      size: 28,
      weight: 600,
    });

    drawText(ctx, "VRC", 984, 798, {
      color: state.accent,
      size: 20,
      weight: 800,
    });
    drawText(ctx, state.vrchatId, 1040, 798, {
      color: "#ffffff",
      maxWidth: 340,
      size: 27,
      weight: 700,
    });

    if (images[1]) {
      drawCoverImage(ctx, images[1], 1392, 740, 62, 62, 31);
    }
    if (images[2]) {
      drawCoverImage(ctx, images[2], 1464, 740, 62, 62, 31);
    }
    drawFooterBrand(ctx, "#ffffff");
  };

  const drawPaper = (ctx) => {
    ctx.fillStyle = "#f2efe7";
    ctx.fillRect(0, 0, 1600, 900);

    ctx.strokeStyle = "rgba(29,29,32,0.08)";
    ctx.lineWidth = 1;
    for (let x = 56; x < 1600; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 900);
      ctx.stroke();
    }
    for (let y = 52; y < 900; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1600, y);
      ctx.stroke();
    }

    ctx.fillStyle = state.accent;
    ctx.fillRect(0, 0, 18, 900);
    drawText(ctx, "VRCHAT PROFILE / 2026", 76, 88, {
      color: "#34343b",
      size: 21,
      weight: 800,
    });
    drawText(ctx, state.displayName || "No name", 76, 190, {
      color: "#15161a",
      maxWidth: 570,
      size: 70,
      weight: 850,
    });
    drawText(ctx, normalizedHandle(), 80, 240, {
      color: "#686870",
      maxWidth: 530,
      size: 29,
      weight: 650,
    });

    drawPill(ctx, state.friendOpen ? "FRIEND REQUEST / OPEN" : "FRIEND REQUEST / ASK", 78, 286, {
      background: "#15161a",
      color: state.accent,
      height: 50,
      size: 20,
    });

    drawText(ctx, "ABOUT", 78, 400, {
      color: "#707078",
      size: 18,
      weight: 850,
    });
    drawWrappedText(ctx, state.message, 78, 448, 545, 48, {
      color: "#24252a",
      maxLines: 3,
      size: 30,
      weight: 650,
    });

    drawText(ctx, "LIKE", 78, 614, {
      color: "#707078",
      size: 18,
      weight: 850,
    });
    let tagX = 78;
    state.interests.slice(0, 4).forEach((interest) => {
      const width = drawPill(ctx, interest, tagX, 636, {
        background: `${state.accent}88`,
        color: "#15161a",
        height: 48,
        size: 22,
      });
      tagX += width + 10;
    });

    drawText(ctx, "ACTIVE", 78, 750, {
      color: "#707078",
      size: 18,
      weight: 850,
    });
    drawText(ctx, state.activity.join("  /  ") || "不定期", 78, 792, {
      color: "#24252a",
      maxWidth: 480,
      size: 27,
      weight: 750,
    });
    drawText(ctx, `VRC  ${state.vrchatId}`, 78, 844, {
      color: "#24252a",
      maxWidth: 490,
      size: 24,
      weight: 700,
    });

    ctx.save();
    ctx.translate(1110, 442);
    ctx.rotate(0.025);
    ctx.shadowColor = "rgba(18,18,20,0.22)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-398, -388, 796, 776);
    ctx.shadowColor = "transparent";
    drawCoverImage(ctx, images[0], -370, -360, 740, 682, 2, true);
    drawText(ctx, "hello, world.", -342, 355, {
      color: "#25262b",
      size: 24,
      weight: 700,
    });
    ctx.restore();

    if (images[1]) {
      ctx.save();
      ctx.translate(720, 710);
      ctx.rotate(-0.08);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-94, -94, 188, 188);
      drawCoverImage(ctx, images[1], -82, -82, 164, 164, 0);
      ctx.restore();
    }
    if (images[2]) {
      ctx.save();
      ctx.translate(1468, 720);
      ctx.rotate(0.08);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-94, -94, 188, 188);
      drawCoverImage(ctx, images[2], -82, -82, 164, 164, 0);
      ctx.restore();
    }
    drawFooterBrand(ctx, "#24252a");
  };

  const drawSignal = (ctx) => {
    ctx.fillStyle = "#07090d";
    ctx.fillRect(0, 0, 1600, 900);
    drawCoverImage(ctx, images[0], 32, 32, 1536, 836, 36, true);

    const shade = ctx.createLinearGradient(0, 150, 0, 868);
    shade.addColorStop(0, "rgba(6,8,12,0.05)");
    shade.addColorStop(0.52, "rgba(6,8,12,0.2)");
    shade.addColorStop(1, "rgba(6,8,12,0.94)");
    ctx.fillStyle = shade;
    roundedRect(ctx, 32, 32, 1536, 836, 36);
    ctx.fill();

    const sideShade = ctx.createLinearGradient(800, 0, 1570, 0);
    sideShade.addColorStop(0, "rgba(6,8,12,0)");
    sideShade.addColorStop(1, "rgba(6,8,12,0.72)");
    ctx.fillStyle = sideShade;
    roundedRect(ctx, 32, 32, 1536, 836, 36);
    ctx.fill();

    drawPill(ctx, "VRCHAT PROFILE", 78, 76, {
      background: state.accent,
      color: "#0b0d12",
      height: 48,
      size: 20,
    });
    drawPill(ctx, state.friendOpen ? "● OPEN" : "● ASK", 1340, 76, {
      background: "rgba(8,10,14,0.72)",
      color: state.accent,
      height: 48,
      size: 20,
      stroke: `${state.accent}88`,
    });

    drawText(ctx, state.displayName || "No name", 82, 650, {
      color: "#ffffff",
      maxWidth: 910,
      size: 76,
      weight: 850,
    });
    drawText(ctx, `${normalizedHandle()}   /   VRC ${state.vrchatId}`, 86, 704, {
      color: "rgba(255,255,255,0.72)",
      maxWidth: 850,
      size: 27,
      weight: 650,
    });
    drawWrappedText(ctx, state.message, 86, 766, 840, 40, {
      color: "#ffffff",
      maxLines: 2,
      size: 27,
      weight: 650,
    });

    let tagY = 574;
    state.interests.slice(0, 4).forEach((interest) => {
      drawPill(ctx, interest, 1290, tagY, {
        background: "rgba(7,9,13,0.7)",
        color: "#ffffff",
        height: 46,
        size: 21,
        stroke: "rgba(255,255,255,0.2)",
      });
      tagY += 58;
    });

    if (images[1]) {
      drawCoverImage(ctx, images[1], 1074, 94, 184, 184, 28);
    }
    if (images[2]) {
      drawCoverImage(ctx, images[2], 1272, 94, 184, 184, 28);
    }
    drawText(ctx, state.activity.join(" / ") || "不定期", 1488, 814, {
      align: "right",
      color: state.accent,
      maxWidth: 450,
      size: 25,
      weight: 800,
    });
    drawFooterBrand(ctx, "#ffffff", 1490);
  };

  const render = () => {
    renderQueued = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (state.template === "paper") {
      drawPaper(context);
    } else if (state.template === "signal") {
      drawSignal(context);
    } else {
      drawAurora(context);
    }
    reportReady();
  };

  const queueRender = () => {
    if (renderQueued) {
      return;
    }
    renderQueued = true;
    requestAnimationFrame(render);
  };

  const applyStateToForm = () => {
    if (displayNameInput instanceof HTMLInputElement) {
      displayNameInput.value = state.displayName;
    }
    if (xHandleInput instanceof HTMLInputElement) {
      xHandleInput.value = state.xHandle;
    }
    if (vrchatIdInput instanceof HTMLInputElement) {
      vrchatIdInput.value = state.vrchatId;
    }
    if (messageInput instanceof HTMLTextAreaElement) {
      messageInput.value = state.message;
    }
    if (messageCount instanceof HTMLElement) {
      messageCount.textContent = String(Array.from(state.message).length);
    }
    if (friendOpenInput instanceof HTMLInputElement) {
      friendOpenInput.checked = state.friendOpen;
    }
    if (imageXInput instanceof HTMLInputElement) {
      imageXInput.value = String(state.imageX);
    }
    if (imageYInput instanceof HTMLInputElement) {
      imageYInput.value = String(state.imageY);
    }
    if (imageZoomInput instanceof HTMLInputElement) {
      imageZoomInput.value = String(state.imageZoom);
    }

    document.querySelectorAll("[data-template]").forEach((button) => {
      const selected = button.getAttribute("data-template") === state.template;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-checked", String(selected));
    });
    document.querySelectorAll('input[name="activity"]').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = state.activity.includes(input.value);
      }
    });
    document.querySelectorAll('input[name="interest"]').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = state.interests.includes(input.value);
      }
    });
    document.querySelectorAll('input[name="accent"]').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = input.value === state.accent;
      }
    });
  };

  const updateFromForm = () => {
    state = {
      ...state,
      displayName:
        displayNameInput instanceof HTMLInputElement ? displayNameInput.value.slice(0, 24) : "",
      xHandle: xHandleInput instanceof HTMLInputElement ? xHandleInput.value.slice(0, 32) : "",
      vrchatId: vrchatIdInput instanceof HTMLInputElement ? vrchatIdInput.value.slice(0, 40) : "",
      message: messageInput instanceof HTMLTextAreaElement ? messageInput.value.slice(0, 90) : "",
      friendOpen: friendOpenInput instanceof HTMLInputElement ? friendOpenInput.checked : false,
      imageX: imageXInput instanceof HTMLInputElement ? Number(imageXInput.value) : 0,
      imageY: imageYInput instanceof HTMLInputElement ? Number(imageYInput.value) : 0,
      imageZoom: imageZoomInput instanceof HTMLInputElement ? Number(imageZoomInput.value) : 100,
      activity: Array.from(document.querySelectorAll('input[name="activity"]:checked')).map(
        (input) => input.value,
      ),
      interests: Array.from(document.querySelectorAll('input[name="interest"]:checked')).map(
        (input) => input.value,
      ),
      accent: document.querySelector('input[name="accent"]:checked')?.value ?? defaultState.accent,
    };
    if (messageCount instanceof HTMLElement) {
      messageCount.textContent = String(Array.from(state.message).length);
    }
    saveState();
    reportStarted();
    queueRender();
  };

  form.addEventListener("input", updateFromForm);
  form.addEventListener("change", updateFromForm);

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      state.template = button.getAttribute("data-template") ?? "aurora";
      applyStateToForm();
      saveState();
      reportStarted();
      queueRender();
    });
  });

  document.querySelectorAll("[data-image-input]").forEach((input) => {
    input.addEventListener("change", async () => {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }
      const index = Number(input.dataset.imageInput);
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setStatus("JPG・PNG・WebPの画像を選んでください。", "error");
        input.value = "";
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setStatus("画像は20MB以下にしてください。", "error");
        input.value = "";
        return;
      }

      if (imageUrls[index]) {
        URL.revokeObjectURL(imageUrls[index]);
      }
      const objectUrl = URL.createObjectURL(file);
      imageUrls[index] = objectUrl;
      const image = new Image();
      image.decoding = "async";
      image.src = objectUrl;

      try {
        await image.decode();
      } catch {
        setStatus("画像を読み込めませんでした。別の画像を試してください。", "error");
        URL.revokeObjectURL(objectUrl);
        imageUrls[index] = null;
        input.value = "";
        return;
      }

      images[index] = image;
      const preview = document.querySelector(`[data-upload-preview="${index}"]`);
      const slot = document.querySelector(`[data-upload-slot="${index}"]`);
      if (preview instanceof HTMLElement) {
        preview.style.backgroundImage = `url("${objectUrl}")`;
        preview.textContent = "";
      }
      slot?.classList.add("filled");
      setStatus(
        index === 0 ? "画像を読み込みました。カードを調整できます。" : "サブ画像を追加しました。",
      );
      reportStarted();
      queueRender();
    });
  });

  if (downloadButton instanceof HTMLButtonElement) {
    downloadButton.addEventListener("click", () => {
      if (!images[0]) {
        setStatus("メイン画像を選んでください。", "error");
        return;
      }
      render();
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setStatus("PNGを作成できませんでした。", "error");
            return;
          }
          const safeName =
            state.displayName
              .trim()
              .replaceAll(/[\\/:*?"<>|]/g, "-")
              .slice(0, 24) || "profile";
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `${safeName}-vrchat-profile.png`;
          document.body.append(anchor);
          anchor.click();
          anchor.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          track("exported");
          setStatus("PNGを保存しました。Xの投稿へ画像を添付してください。", "success");
        },
        "image/png",
        1,
      );
    });
  }

  if (copyButton instanceof HTMLButtonElement) {
    copyButton.addEventListener("click", async () => {
      const text = `${state.displayName || "プロフィール"}の自己紹介カードを更新しました。\n\n#VRChat自己紹介カード #VRChatフレンド募集 #プロフパレット\nhttps://profile-palette.yusuke8h.workers.dev/`;
      try {
        await navigator.clipboard.writeText(text);
        track("shared");
        setStatus("投稿文をコピーしました。保存したPNGと一緒に使えます。", "success");
      } catch {
        setStatus("コピーできませんでした。ブラウザの権限を確認してください。", "error");
      }
    });
  }

  if (resetButton instanceof HTMLButtonElement) {
    resetButton.addEventListener("click", () => {
      state = { ...defaultState };
      images = [null, null, null];
      imageUrls.forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
      imageUrls = [null, null, null];
      localStorage.removeItem(storageKey);
      document.querySelectorAll("[data-upload-preview]").forEach((preview) => {
        if (preview instanceof HTMLElement) {
          preview.style.backgroundImage = "";
          preview.textContent = "+";
        }
      });
      document.querySelectorAll("[data-upload-slot]").forEach((slot) => {
        slot.classList.remove("filled");
      });
      document.querySelectorAll("[data-image-input]").forEach((input) => {
        if (input instanceof HTMLInputElement) {
          input.value = "";
        }
      });
      hasReportedReady = false;
      applyStateToForm();
      queueRender();
      setStatus("入力と端末内のプロフィール保存をリセットしました。");
    });
  }

  applyStateToForm();
  render();
})();

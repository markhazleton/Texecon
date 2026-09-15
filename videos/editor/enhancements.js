/* Motion, backgrounds, storytelling, audio, and the shared render timeline. */
let playhead = null,
  posePhoto = 0,
  endpoint = "end",
  poseMode = false;
let lastSelected = -1,
  playingScrub = false,
  scrubGeneration = 0,
  loadedVideo = "",
  drag = null;
const basePose = () => ({ x: 0, y: 0, scale: 1, rotation: 0, zoom: 1 });
const baseAnimation = () => ({ start: basePose(), end: basePose(), focal: { x: 0.5, y: 0.5 } });
const baseBackground = {
  style: "solid",
  color: "#101419",
  color2: "#394655",
  blur: 30,
  brightness: 1,
};
const svgNS = "http://www.w3.org/2000/svg";
function animation(scene, index, create = false) {
  if (create) {
    scene.photo_motion ||= [];
    while (scene.photo_motion.length <= index) scene.photo_motion.push(baseAnimation());
  }
  return scene.photo_motion?.[index] || baseAnimation();
}
function swapAnimations(scene, a, b) {
  animation(scene, Math.max(a, b), true);
  [scene.photo_motion[a], scene.photo_motion[b]] = [scene.photo_motion[b], scene.photo_motion[a]];
}
function resetAnimationSlot(scene, index) {
  if (scene.photo_motion?.[index]) scene.photo_motion[index] = baseAnimation();
}
function starts() {
  let t = 0;
  return project.scenes.map((scene) => {
    const start = t;
    t += scene.duration - project.transition_seconds;
    return start;
  });
}
function totalTime() {
  return (
    project.scenes.reduce((sum, scene) => sum + scene.duration, 0) -
    (project.scenes.length - 1) * project.transition_seconds
  );
}
function timeText(time) {
  const frames = Math.max(0, Math.round(time * 30));
  return `${Math.floor(frames / 1800)}:${String(Math.floor(frames / 30) % 60).padStart(2, "0")}.${String(frames % 30).padStart(2, "0")}`;
}
function enhancedPreviewPayload() {
  if (poseMode) return { project, scene: selected, progress: endpoint === "end" ? 1 : 0 };
  return playhead === null
    ? { project, scene: selected }
    : { project, scene: selected, time: playhead };
}
function drawOutline() {
  const svg = $("motion-overlay");
  svg.replaceChildren();
  svg.toggleAttribute("hidden", !poseMode);
  if (!poseMode) return;
  const scene = project.scenes[selected];
  const box = scene.card
    ? [1060, 140, 760, 800]
    : endpoint === "end" && scene.layout_end
      ? scene.layout_end[posePhoto]
      : scene.layout[posePhoto];
  if (!box) return;
  const pose = animation(scene, posePhoto)[endpoint];
  const [x, y, w, h] = box;
  const width = w * pose.scale,
    height = h * pose.scale;
  const left = x + (w - width) / 2 + pose.x,
    top = y + (h - height) / 2 + pose.y;
  const rect = document.createElementNS(svgNS, "rect");
  for (const [key, value] of Object.entries({
    x: left,
    y: top,
    width,
    height,
    rx: 5,
    transform: `rotate(${pose.rotation} ${left + width / 2} ${top + height / 2})`,
  }))
    rect.setAttribute(key, String(value));
  rect.setAttribute("tabindex", "0");
  rect.setAttribute("aria-label", "Drag photo or use horizontal and vertical offset fields");
  svg.append(rect);
  rect.onpointerdown = (event) => {
    event.preventDefault();
    stopScrub();
    history.push({ project: clone(project), selected });
    if (history.length > 50) history.shift();
    const bounds = svg.getBoundingClientRect();
    const current = animation(scene, posePhoto, true)[endpoint];
    scene.motion = "still";
    drag = { x: event.clientX, y: event.clientY, initialX: current.x, initialY: current.y, bounds };
    svg.setPointerCapture?.(event.pointerId);
  };
}
$("motion-overlay").onpointermove = (event) => {
  if (!drag) return;
  const pose = animation(project.scenes[selected], posePhoto, true)[endpoint];
  pose.x = Math.round(
    Math.max(
      -960,
      Math.min(960, drag.initialX + ((event.clientX - drag.x) * 1920) / drag.bounds.width)
    )
  );
  pose.y = Math.round(
    Math.max(
      -540,
      Math.min(540, drag.initialY + ((event.clientY - drag.y) * 1080) / drag.bounds.height)
    )
  );
  $("pose-x").value = pose.x;
  $("pose-y").value = pose.y;
  drawOutline();
  clearTimeout(previewTimer);
  previewTimer = setTimeout(preview, 100);
};
for (const name of ["onpointerup", "onpointercancel"])
  $("motion-overlay")[name] = () => {
    if (drag) {
      drag = null;
      refresh();
    }
  };
function refreshEnhancements() {
  const scene = project.scenes[selected];
  if (lastSelected !== selected) {
    playhead = null;
    poseMode = false;
    posePhoto = 0;
    lastSelected = selected;
    stopScrub();
  }
  posePhoto = Math.min(posePhoto, scene.photos.length - 1);
  const time = playhead === null ? starts()[selected] : Math.min(playhead, totalTime() - 1 / 30);
  $("scrub").max = Math.max(0, totalTime() - 1 / 30);
  $("scrub").value = time;
  $("timecode").textContent = timeText(time);
  $("trim-duration").min = Math.max(1, project.transition_seconds * 2 + 1 / 30);
  $("trim-duration").value = scene.duration;
  $("trim-time").textContent = `${scene.duration}s`;
  $("preview-from").max = totalTime() - 1 / 30;
  $("preview-from").value = time.toFixed(2);
  $("sound-badge").textContent = Object.values(project.sound || {}).some((track) => track?.file)
    ? "With audio"
    : "Silent";
  $("preview-mode").textContent = poseMode
    ? `${endpoint === "start" ? "Start" : "End"} keyframe · drag the outlined photo`
    : "Scrub preview · section renders include audio";
  $("film-timeline").replaceChildren(
    ...project.scenes.map((entry, index) => {
      const item = button(`${index + 1} · ${entry.duration}s`, () => {
        selected = index;
        playhead = null;
        poseMode = false;
        refresh();
      });
      item.className = `timeline-scene${index === selected ? " active" : ""}`;
      item.title = `${entry.chapter || sceneName(entry)} · ${timeText(starts()[index])}`;
      item.style.flexGrow = String(entry.duration);
      return item;
    })
  );
  setOptions(
    "animated-photo",
    scene.photos.map((_, index) => String(index + 1))
  );
  $("animated-photo").value = String(posePhoto + 1);
  const anim = animation(scene, posePhoto);
  for (const key of Object.keys(basePose())) $("pose-" + key).value = anim[endpoint][key];
  $("focal-x").value = anim.focal.x;
  $("focal-y").value = anim.focal.y;
  $("focal-image").src = `/photos/${encodeURIComponent(scene.photos[posePhoto])}`;
  $("focal-dot").setAttribute("cx", String(anim.focal.x * 100));
  $("focal-dot").setAttribute("cy", String(anim.focal.y * 100));
  $("pose-start").classList.toggle("primary", poseMode && endpoint === "start");
  $("pose-end").classList.toggle("primary", poseMode && endpoint === "end");
  $("photo-preset").value = "custom";
  $("caption").value = scene.caption || "";
  $("chapter").value = scene.chapter || "";
  $("end-layout-label").hidden = !!scene.card;
  $("continue-layout").disabled = !!scene.card;
  const matching = Object.keys(catalog.layouts).filter(
    (name) => catalog.layouts[name].length >= scene.photos.length
  );
  setOptions("end-layout", [
    "None",
    ...matching,
    ...(scene.layout_end &&
    !matching.some(
      (name) => JSON.stringify(catalog.layouts[name]) === JSON.stringify(scene.layout_end)
    )
      ? ["Custom"]
      : []),
  ]);
  $("end-layout").value = scene.layout_end
    ? matching.find(
        (name) => JSON.stringify(catalog.layouts[name]) === JSON.stringify(scene.layout_end)
      ) || "Custom"
    : "None";
  const bg = {
    ...baseBackground,
    ...project.background,
    ...($("background-scope").value === "scene" ? scene.background : {}),
  };
  for (const key of Object.keys(baseBackground)) $("background-" + key).value = bg[key];
  $("inherit-background").disabled = !scene.background;
  refreshSound();
  drawOutline();
}
function stopScrub() {
  playingScrub = false;
  scrubGeneration++;
  $("play-scrub").textContent = "▶ Play";
}
$("play-scrub").onclick = async () => {
  if (playingScrub) {
    stopScrub();
    return;
  }
  clearTimeout(previewTimer);
  poseMode = false;
  $("motion-overlay").setAttribute("hidden", "");
  playingScrub = true;
  const generation = ++scrubGeneration;
  $("play-scrub").textContent = "Pause";
  const started = performance.now(),
    offset = playhead ?? starts()[selected];
  const tick = async () => {
    if (!playingScrub || generation !== scrubGeneration) return;
    playhead = Math.min(totalTime() - 1 / 30, offset + (performance.now() - started) / 1000);
    $("scrub").value = playhead;
    $("timecode").textContent = timeText(playhead);
    await preview();
    if (playhead >= totalTime() - 1 / 30) stopScrub();
    else setTimeout(tick, 60);
  };
  await tick();
};
$("scrub").oninput = () => {
  stopScrub();
  poseMode = false;
  playhead = Number($("scrub").value);
  $("timecode").textContent = timeText(playhead);
  $("preview-from").value = playhead.toFixed(2);
  $("motion-overlay").setAttribute("hidden", "");
  clearTimeout(previewTimer);
  previewTimer = setTimeout(preview, 80);
};
$("scene-start").onclick = () => {
  stopScrub();
  poseMode = false;
  playhead = null;
  refresh();
};
$("trim-duration").onchange = () =>
  change(() => {
    project.scenes[selected].duration = Math.round(Number($("trim-duration").value) * 30) / 30;
  });
$("animated-photo").onchange = () => {
  posePhoto = Number($("animated-photo").value) - 1;
  refresh();
};
for (const which of ["start", "end"])
  $("pose-" + which).onclick = () => {
    stopScrub();
    endpoint = which;
    poseMode = true;
    refresh();
    $("preview").scrollIntoView?.({ block: "center", behavior: "smooth" });
  };
for (const key of Object.keys(basePose()))
  $("pose-" + key).onchange = () =>
    change(() => {
      poseMode = true;
      const scene = project.scenes[selected];
      scene.motion = "still";
      animation(scene, posePhoto, true)[endpoint][key] = Number($("pose-" + key).value);
    });
for (const axis of ["x", "y"])
  $("focal-" + axis).onchange = () =>
    change(() => {
      animation(project.scenes[selected], posePhoto, true).focal[axis] = Number(
        $("focal-" + axis).value
      );
    });
$("focal-picker").onclick = (event) => {
  const bounds = $("focal-image").getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  change(() => {
    const focal = animation(project.scenes[selected], posePhoto, true).focal;
    focal.x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    focal.y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
  });
};
function preset(name, index) {
  const value = baseAnimation(),
    direction = index % 2 ? -1 : 1;
  if (name === "float") {
    value.start.y = 18 * direction;
    value.end.y = -18 * direction;
    value.start.rotation = -0.6 * direction;
    value.end.rotation = 0.6 * direction;
  }
  if (name === "push") value.end.zoom = 1.3;
  if (name === "slide-left") value.start.x = -140;
  if (name === "slide-right") value.start.x = 140;
  if (name === "tilt") {
    value.start.rotation = -3;
    value.end.rotation = 3;
  }
  return value;
}
$("photo-preset").onchange = () => {
  const name = $("photo-preset").value;
  if (name !== "custom")
    change(() => {
      const scene = project.scenes[selected];
      const focal = clone(animation(scene, posePhoto).focal);
      animation(scene, posePhoto, true);
      scene.photo_motion[posePhoto] = { ...preset(name, posePhoto), focal };
      scene.motion = "still";
      poseMode = true;
      endpoint = "end";
    });
};
$("animate-all").onclick = () =>
  change(() => {
    const scene = project.scenes[selected];
    scene.photo_motion = scene.photos.map((_, index) => ({
      ...preset(index % 2 ? "push" : "float", index),
      focal: clone(animation(scene, index).focal),
    }));
    scene.motion = "still";
    poseMode = false;
  });
$("reset-photo").onclick = () =>
  change(() => {
    animation(project.scenes[selected], posePhoto, true);
    project.scenes[selected].photo_motion[posePhoto] = baseAnimation();
  });
for (const field of ["chapter", "caption"])
  $(field).onchange = () =>
    change(() => {
      project.scenes[selected][field] = $(field).value;
    });
$("end-layout").onchange = () =>
  change(() => {
    const value = $("end-layout").value;
    if (value === "None") delete project.scenes[selected].layout_end;
    else if (catalog.layouts[value])
      project.scenes[selected].layout_end = clone(catalog.layouts[value]);
  });
$("continue-layout").onclick = () =>
  change(() => {
    const scene = project.scenes[selected],
      next = clone(scene);
    scene.transition = "morph";
    next.layout = clone(scene.layout_end || scene.layout);
    delete next.layout_end;
    next.photo_motion = scene.photos.map((_, index) => {
      const previous = animation(scene, index);
      return { start: clone(previous.end), end: clone(previous.end), focal: clone(previous.focal) };
    });
    next.transition = "fade";
    next.motion = scene.motion = "still";
    project.scenes.splice(selected + 1, 0, next);
    selected += 1;
  });
$("background-scope").onchange = refreshEnhancements;
for (const key of Object.keys(baseBackground))
  $("background-" + key).onchange = () =>
    change(() => {
      const target = $("background-scope").value === "scene" ? project.scenes[selected] : project;
      target.background = { ...baseBackground, ...project.background, ...target.background };
      target.background[key] = ["blur", "brightness"].includes(key)
        ? Number($("background-" + key).value)
        : $("background-" + key).value;
      if (key === "style" && target.background.style === "paper") {
        target.background.color = "#d5c8ad";
        target.background.color2 = "#827763";
        target.background.brightness = 0.85;
      }
    });
$("inherit-background").onclick = () =>
  change(() => {
    delete project.scenes[selected].background;
  });
function refreshSound() {
  const sound = project.sound || { music: {}, narration: {}, duck_music: true };
  $("duck-music").checked = sound.duck_music;
  $("audio-tracks").replaceChildren(
    ...["music", "narration"].map((kind) => {
      const track = sound[kind];
      const section = el("div", undefined, "audio-track");
      section.append(el("h3", kind === "music" ? "Music bed" : "Narration"));
      const label = el("label", "Audio file");
      const select = el("select");
      select.id = kind + "-file";
      for (const name of ["", ...(catalog.audio_files || [])]) {
        const option = el("option", name || "None");
        option.value = name;
        select.append(option);
      }
      select.value = track.file || "";
      select.onchange = () =>
        change(() => {
          project.sound[kind].file = select.value;
        });
      label.append(select);
      section.append(label);
      const controls = el("div", undefined, "pose-fields");
      for (const [key, name, max] of [
        ["volume", "Volume", 2],
        ["start", "Start at (seconds)", 60000],
        ["fade_in", "Fade in (seconds)", 30],
        ["fade_out", "Fade out (seconds)", 30],
      ]) {
        const field = el("label", name),
          input = el("input");
        input.type = "number";
        input.min = "0";
        input.max = String(max);
        input.step = ".1";
        input.value = track[key] ?? 0;
        input.id = `${kind}-${key}`;
        input.onchange = () =>
          change(() => {
            project.sound[kind][key] = Number(input.value);
          });
        field.append(input);
        controls.append(field);
      }
      section.append(controls);
      if (kind === "music") {
        const label = el("label", undefined, "check-label"),
          input = el("input");
        input.type = "checkbox";
        input.checked = !!track.loop;
        input.id = "music-loop";
        input.onchange = () =>
          change(() => {
            project.sound.music.loop = input.checked;
          });
        label.append(input, document.createTextNode("Loop to fill the film"));
        section.append(label);
      }
      section.append(
        button(
          "Listen to file",
          () => {
            $("audio-audition").src = `/audio/${encodeURIComponent(track.file)}`;
            $("audio-audition").hidden = false;
          },
          !track.file
        )
      );
      return section;
    })
  );
}
$("duck-music").onchange = () =>
  change(() => {
    project.sound.duck_music = $("duck-music").checked;
  });
$("upload-audio").onclick = () => $("audio-file").click();
$("audio-file").onchange = async () => {
  const file = $("audio-file").files[0];
  if (!file) return;
  if (file.size > 100 * 1024 * 1024) {
    message("Choose an audio file up to 100 MB.", true);
    return;
  }
  $("upload-audio").disabled = true;
  try {
    const response = await fetch("/api/audio-upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Editor-Token": catalog.token,
        "X-Filename": encodeURIComponent(file.name),
      },
      body: file,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    catalog.audio_files = result.audio_files;
    refreshSound();
    message(`Imported ${file.name}. Select it as music or narration below.`);
  } catch (error) {
    message(error.message, true);
  } finally {
    $("upload-audio").disabled = false;
    $("audio-file").value = "";
  }
};
$("preview-section").onclick = async () => {
  stopScrub();
  $("preview-section").disabled = true;
  try {
    await api("/api/preview-video", {
      project,
      start: Number($("preview-from").value),
      duration: Number($("preview-length").value),
    });
    await status();
    message("Rendering a section from your current edits. The player appears when ready.");
  } catch (error) {
    message(error.message, true);
    $("preview-section").disabled = false;
  }
};
function updatePreviewJob(job) {
  $("preview-section").disabled = job.state === "running";
  if (job.state === "complete" && job.output !== loadedVideo) {
    loadedVideo = job.output;
    $("preview-player").src = `/render/video?play&v=${encodeURIComponent(job.output)}`;
    $("preview-player").hidden = false;
  }
}

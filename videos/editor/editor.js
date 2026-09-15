/* Local editor: project data stays in the loopback server and browser. */
const $ = (id) => document.getElementById(id);
let project,
  catalog,
  revision,
  saved,
  selected = 0,
  history = [],
  previewUrl;
let previewTimer,
  previewSequence = 0,
  pickSlot = 0,
  busy = false,
  rendering = false;
const clone = (value) => structuredClone(value);
const labels = {
  fade: "Crossfade",
  smoothleft: "Slide left",
  smoothright: "Slide right",
  dissolve: "Dissolve",
  wipeup: "Wipe up",
  wipedown: "Wipe down",
  circleopen: "Circular reveal",
  radial: "Radial reveal",
  "push-in": "Slow push-in",
  "pull-out": "Slow pull-out",
  "pan-left": "Pan left",
  "pan-right": "Pan right",
  still: "Still",
  morph: "Layout morph (keep shared photos)",
};
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text, action, disabled = false) {
  const node = el("button", text);
  node.onclick = action;
  node.disabled = disabled;
  return node;
}
function photo(name) {
  const img = el("img");
  img.src = `/photos/${encodeURIComponent(name)}`;
  img.alt = name;
  img.loading = "lazy";
  return img;
}
function message(text, error = false) {
  $("message").textContent = text;
  $("message").classList.toggle("error", error);
}
function dirty() {
  return JSON.stringify(project) !== saved;
}
function summary() {
  const duration =
    project.scenes.reduce((sum, scene) => sum + scene.duration, 0) -
    (project.scenes.length - 1) * project.transition_seconds;
  const unique = new Set(project.scenes.flatMap((scene) => scene.photos)).size;
  return `${project.scenes.length} scenes · ${unique} photos · ${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, "0")}`;
}
async function api(path, body, blob = false) {
  const response = await fetch(
    path,
    body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Editor-Token": catalog.token },
          body: JSON.stringify(body),
        }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed.");
  }
  return blob ? response.blob() : response.json();
}
function change(update) {
  history.push({ project: clone(project), selected });
  if (history.length > 50) history.shift();
  update();
  if (typeof stopScrub === "function") stopScrub();
  refresh();
}
function setOptions(id, values) {
  $(id).replaceChildren(
    ...values.map((value) => {
      const option = el("option", labels[value] || value);
      option.value = value;
      return option;
    })
  );
}
function layoutName(scene) {
  return (
    Object.keys(catalog.layouts).find(
      (name) => JSON.stringify(catalog.layouts[name]) === JSON.stringify(scene.layout)
    ) || "Custom layout"
  );
}
function sceneName(scene) {
  if (scene.title?.trim()) return scene.title.trim();
  return scene.card
    ? scene.closing
      ? "Closing card"
      : "Opening card"
    : `${scene.photos.length}-photo collage`;
}
function refresh() {
  const scene = project.scenes[selected];
  $("project-name").textContent = project.title;
  $("summary").textContent = summary();
  $("dirty").textContent = dirty() ? "Unsaved changes" : "Saved";
  $("scene-count").textContent = project.scenes.length;
  $("scene-number").textContent =
    `SCENE ${String(selected + 1).padStart(2, "0")} / ${project.scenes.length}`;
  $("scene-name").textContent = sceneName(scene);
  $("scenes").replaceChildren(
    ...project.scenes.map((entry, index) => {
      const item = button("", () => {
        selected = index;
        refresh();
      });
      item.className = `scene-item${selected === index ? " selected" : ""}`;
      item.setAttribute("aria-label", `Scene ${index + 1}: ${sceneName(entry)}`);
      item.setAttribute("aria-current", String(index === selected));
      item.title = sceneName(entry);
      const text = el("div");
      text.append(
        el("strong", entry.title?.trim() ? Array.from(entry.title.trim()).slice(0, 10).join("") : sceneName(entry)),
        el(
          "small",
          `${entry.duration}s · ${index === project.scenes.length - 1 ? "End" : labels[entry.transition]}`
        )
      );
      item.append(
        el("span", String(index + 1).padStart(2, "0"), "scene-index"),
        photo(entry.photos[0]),
        text
      );
      return item;
    })
  );
  $("scene-title").value = scene.title || "";
  $("duration").value = scene.duration;
  $("position").value = selected + 1;
  $("position").max = project.scenes.length;
  $("scene-type").value = scene.card ? (scene.closing ? "closing" : "opening") : "collage";
  const layout = layoutName(scene);
  setOptions("layout", [
    ...Object.keys(catalog.layouts),
    ...(layout === "Custom layout" && !scene.card ? ["Custom layout"] : []),
  ]);
  $("layout").value = layout;
  $("layout-label").hidden = !!scene.card;
  $("subtitle-label").hidden = !scene.card;
  $("subtitle").value = scene.subtitle || "";
  $("motion").value = scene.motion;
  $("transition").value = scene.transition;
  $("transition").disabled = selected === project.scenes.length - 1;
  $("transition-hint").textContent = $("transition").disabled
    ? "The final scene has no outgoing transition."
    : "Applies at the end of this scene.";
  $("title").value = project.title;
  $("transition-length").value = project.transition_seconds;
  $("undo").disabled = history.length === 0;
  $("delete").disabled = project.scenes.length === 1;
  $("save").disabled = busy;
  $("render").disabled = busy || rendering;
  $("add-photo").disabled = !!scene.card || scene.photos.length >= scene.layout.length;
  $("scene-photos").replaceChildren(
    ...scene.photos.map((name, index) => {
      const card = el("div", undefined, "photo-card");
      const filename = el("p", name);
      filename.title = name;
      const controls = el("div", undefined, "actions");
      const earlier = button(
        "←",
        () =>
          change(() => {
            [scene.photos[index - 1], scene.photos[index]] = [
              scene.photos[index],
              scene.photos[index - 1],
            ];
            if (typeof swapAnimations === "function") swapAnimations(scene, index - 1, index);
          }),
        index === 0
      );
      earlier.setAttribute("aria-label", `Move photo ${index + 1} earlier`);
      const later = button(
        "→",
        () =>
          change(() => {
            [scene.photos[index + 1], scene.photos[index]] = [
              scene.photos[index],
              scene.photos[index + 1],
            ];
            if (typeof swapAnimations === "function") swapAnimations(scene, index + 1, index);
          }),
        index === scene.photos.length - 1
      );
      later.setAttribute("aria-label", `Move photo ${index + 1} later`);
      const replace = button("Replace", () => openPicker(index));
      replace.setAttribute("aria-label", `Replace photo ${index + 1}`);
      const remove = button(
        "Remove",
        () =>
          change(() => {
            scene.photos.splice(index, 1);
            scene.photo_motion?.splice(index, 1);
          }),
        scene.photos.length === 1
      );
      remove.setAttribute("aria-label", `Remove photo ${index + 1}`);
      controls.append(replace, earlier, later, remove);
      card.append(photo(name), filename, controls);
      return card;
    })
  );
  if (typeof refreshEnhancements === "function") refreshEnhancements();
  clearTimeout(previewTimer);
  previewTimer = setTimeout(preview, 200);
}
async function preview() {
  const sequence = ++previewSequence;
  $("preview-status").hidden = false;
  $("preview-status").textContent = "Updating preview…";
  try {
    const payload =
      typeof enhancedPreviewPayload === "function"
        ? enhancedPreviewPayload()
        : { project, scene: selected };
    const blob = await api("/api/preview", payload, true);
    if (sequence !== previewSequence) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(blob);
    $("preview").src = previewUrl;
    $("preview-status").hidden = true;
    message(
      dirty()
        ? "Preview updated. Save to keep your edits."
        : "Ready. Select a scene to begin editing."
    );
  } catch (error) {
    if (sequence === previewSequence) {
      $("preview-status").textContent = "Fix the settings to update this preview";
      message(error.message, true);
    }
  }
}
function openPicker(slot) {
  pickSlot = slot;
  $("photo-search").value = "";
  library();
  $("picker").showModal();
  $("photo-search").focus();
}
function library() {
  const names = catalog.photos.filter((name) =>
    name.toLowerCase().includes($("photo-search").value.toLowerCase())
  );
  $("library-count").textContent =
    `${names.length} photographs · choose one for slot ${pickSlot + 1}`;
  $("library").replaceChildren(
    ...names.map((name) => {
      const item = button("", () => {
        change(() => {
          project.scenes[selected].photos[pickSlot] = name;
          if (typeof resetAnimationSlot === "function")
            resetAnimationSlot(project.scenes[selected], pickSlot);
        });
        $("picker").close();
      });
      item.className = "library-photo";
      item.setAttribute("aria-label", `Choose ${name}`);
      item.append(photo(name), el("span", name));
      return item;
    })
  );
}
async function save() {
  if (busy) return false;
  busy = true;
  $("save").disabled = true;
  $("render").disabled = true;
  const submitted = JSON.stringify(project);
  try {
    const result = await api("/api/save", { project, revision });
    revision = result.revision;
    saved = JSON.stringify(result.project);
    if (JSON.stringify(project) === submitted) project = result.project;
    refresh();
    message("Project saved. A backup of the previous JSON was kept.");
    return true;
  } catch (error) {
    message(error.message, true);
    return false;
  } finally {
    busy = false;
    $("save").disabled = false;
    $("render").disabled = rendering;
  }
}
async function status() {
  try {
    const job = await api("/api/status");
    rendering = job.state === "running";
    $("render").disabled = busy || rendering;
    $("render").textContent = rendering ? "Rendering…" : "Render MP4 ↗";
    $("render-status").textContent = {
      idle: "Save your changes, then render a new version.",
      running: "Rendering your saved project. You can keep editing.",
      complete: `Ready: ${job.output}`,
      failed: "Rendering failed. Details are below; your project is saved.",
    }[job.state];
    $("render-log").hidden = !job.log.length;
    $("render-log").textContent = job.log.join("\n");
    $("download").hidden = job.state !== "complete";
    if (typeof updatePreviewJob === "function") updatePreviewJob(job);
  } catch (error) {
    $("render-status").textContent = `Editor connection lost: ${error.message}`;
  }
}
function download(projectData) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(projectData, null, 2) + "\n"], { type: "application/json" })
  );
  const link = el("a");
  link.href = url;
  link.download = "collage-project.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("scene-title").onchange = () =>
  change(() => {
    project.scenes[selected].title = $("scene-title").value;
  });
$("duration").onchange = () =>
  change(() => {
    project.scenes[selected].duration = Number($("duration").value);
  });
$("position").onchange = () => {
  const next = Number($("position").value) - 1;
  if (!Number.isInteger(next) || next < 0 || next >= project.scenes.length) {
    $("position").value = selected + 1;
    message("Choose a valid scene position.", true);
    return;
  }
  change(() => {
    const [scene] = project.scenes.splice(selected, 1);
    project.scenes.splice(next, 0, scene);
    selected = next;
  });
};
$("layout").onchange = () => {
  const layout = catalog.layouts[$("layout").value];
  const scene = project.scenes[selected];
  if (!layout) return;
  if (layout.length < scene.photos.length) {
    $("layout").value = layoutName(scene);
    message("Remove photos before switching to a smaller layout.", true);
    return;
  }
  change(() => {
    scene.layout = clone(layout);
    delete scene.layout_end;
  });
};
$("scene-type").onchange = () => {
  const type = $("scene-type").value;
  const scene = project.scenes[selected];
  if (type !== "collage" && scene.photos.length > 1) {
    $("scene-type").value = "collage";
    message("A title card uses one photo. Remove extra photos first.", true);
    return;
  }
  change(() => {
    scene.card = type !== "collage";
    scene.closing = type === "closing";
    if (scene.card) {
      scene.subtitle =
        scene.subtitle || (scene.closing ? "MOMENTS TO REMEMBER" : "A LIFE IN PHOTOGRAPHS");
      scene.motion = "still";
    } else {
      scene.layout = scene.layout || clone(catalog.layouts.Pair);
    }
  });
};
for (const field of ["motion", "transition", "subtitle"])
  $(field).onchange = () =>
    change(() => {
      project.scenes[selected][field] = $(field).value;
    });
$("title").onchange = () =>
  change(() => {
    project.title = $("title").value;
  });
$("transition-length").onchange = () =>
  change(() => {
    project.transition_seconds = Number($("transition-length").value);
  });
$("undo").onclick = () => {
  const previous = history.pop();
  if (previous) {
    project = previous.project;
    selected = previous.selected;
    refresh();
  }
};
$("add-scene").onclick = () =>
  change(() => {
    project.scenes.splice(selected + 1, 0, {
      photos: [catalog.photos[0], catalog.photos[1] || catalog.photos[0]],
      layout: clone(catalog.layouts.Pair),
      duration: 10,
      transition: "fade",
      motion: "push-in",
    });
    selected += 1;
  });
$("duplicate").onclick = () =>
  change(() => {
    project.scenes.splice(selected + 1, 0, clone(project.scenes[selected]));
    selected += 1;
  });
$("delete").onclick = () =>
  change(() => {
    project.scenes.splice(selected, 1);
    selected = Math.min(selected, project.scenes.length - 1);
  });
$("add-photo").onclick = () => openPicker(project.scenes[selected].photos.length);
$("close-picker").onclick = () => $("picker").close();
$("photo-search").oninput = library;
$("save").onclick = save;
$("render").onclick = async () => {
  if (await save()) {
    if (dirty()) {
      message("More edits arrived during saving. Save again before rendering.", true);
      return;
    }
    try {
      await api("/api/render", { revision });
      await status();
    } catch (error) {
      message(error.message, true);
    }
  }
};
$("export").onclick = async () => {
  try {
    const result = await api("/api/validate", { project });
    download(result.project);
    message("Exported a copy. Use Save project to update the renderer’s source file.");
  } catch (error) {
    message(error.message, true);
  }
};
$("import").onclick = () => $("json-file").click();
$("json-file").onchange = async () => {
  const file = $("json-file").files[0];
  if (!file) return;
  try {
    const result = await api("/api/validate", { project: JSON.parse(await file.text()) });
    change(() => {
      project = result.project;
      selected = 0;
    });
    message(
      "Imported project. Review it, then save to update the project file. Undo restores the previous project."
    );
  } catch (error) {
    message(error.message, true);
  } finally {
    $("json-file").value = "";
  }
};
window.addEventListener("beforeunload", (event) => {
  if (project && dirty()) {
    event.preventDefault();
    event.returnValue = "";
  }
});
(async () => {
  try {
    catalog = await api("/api/project");
    project = catalog.project;
    revision = catalog.revision;
    saved = JSON.stringify(project);
    $("file").textContent = catalog.file;
    setOptions("motion", catalog.motions);
    setOptions("transition", catalog.effects);
    refresh();
    await status();
    setInterval(status, 2000);
  } catch (error) {
    message(error.message, true);
    for (const control of document.querySelectorAll("button, input, select"))
      control.disabled = true;
  }
})();

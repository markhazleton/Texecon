import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, copyFile, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { JSDOM } from "jsdom";

const root = fileURLToPath(new URL("../../", import.meta.url));
async function until(predicate, label) {
  for (let attempt = 0; attempt < 300; attempt++) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${label}`);
}

test(
  "editor changes scenes, picks photos, saves, reloads, and launches a render",
  { timeout: 60000 },
  async () => {
    const folder = await mkdtemp(path.join(tmpdir(), "collage-ui-"));
    const config = path.join(folder, "project.json");
    await copyFile(path.join(root, "videos/jared-e-hazleton-collage.json"), config);
    const fixture = JSON.parse(await readFile(config, "utf8"));
    fixture.scenes = fixture.scenes.slice(0, 58);
    fixture.scenes[1] = {
      photos: fixture.scenes[1].photos.slice(0, 2),
      layout: [[90, 170, 852, 800], [978, 170, 852, 800]],
      duration: 10,
    };
    await writeFile(config, JSON.stringify(fixture));
    const child = spawn(
      "python",
      [path.join(root, "videos/collage-editor.py"), "--config", config, "--port", "0"],
      { windowsHide: true }
    );
    let output = "",
      dom,
      renderedOutput,
      uploadedAudio;
    const renderedOutputs = [];
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    const errors = [];
    try {
      await until(() => /http:\/\/127\.0\.0\.1:\d+/.test(output), "server startup");
      const base = output.match(/http:\/\/127\.0\.0\.1:\d+/)[0];
      const options = {
        resources: "usable",
        runScripts: "dangerously",
        pretendToBeVisual: true,
        beforeParse(window) {
          window.structuredClone = structuredClone;
          window.fetch = (url, options) => fetch(new URL(url, base), options);
          window.URL.createObjectURL = () => "blob:preview";
          window.URL.revokeObjectURL = () => {};
          window.HTMLDialogElement.prototype.showModal = function () {
            this.open = true;
          };
          window.HTMLDialogElement.prototype.close = function () {
            this.open = false;
          };
          window.addEventListener("error", (event) => errors.push(event.message));
        },
      };
      dom = await JSDOM.fromURL(base, options);
      let document = dom.window.document;
      const $ = (id) => document.getElementById(id);
      const change = (id, value) => {
        $(id).value = value;
        $(id).dispatchEvent(new dom.window.Event("change", { bubbles: true }));
      };
      await until(() => document.querySelectorAll(".scene-item").length === 58, "project loaded");
      await until(() => $("preview").hasAttribute("src"), "rendered preview loaded");
      document.querySelector('[aria-label="Scene 2: 2-photo collage"]').click();
      assert.equal($("scene-name").textContent, "2-photo collage");
      change("scene-title", "Family vacation memories");
      assert.equal(document.querySelector(".scene-item.selected strong").textContent, "Family vac");
      assert.equal(document.querySelector(".scene-item.selected").title, "Family vacation memories");
      assert.equal($("scene-name").textContent, "Family vacation memories");
      $("undo").click();
      assert.equal($("scene-title").value, "");
      assert.equal(document.querySelector(".scene-item.selected strong").textContent, "2-photo collage");
      change("scene-title", "Family vacation memories");
      change("duration", "9");
      change("transition", "radial");
      change("motion", "pan-left");
      assert.equal($("dirty").textContent, "Unsaved changes");
      $("duplicate").click();
      assert.equal(document.querySelectorAll(".scene-item").length, 59);
      $("undo").click();
      assert.equal(document.querySelectorAll(".scene-item").length, 58);
      change("layout", "Four photos");
      $("add-photo").click();
      const everything = document.querySelectorAll(".library-photo").length;
      const inScene = [...document.querySelectorAll(".photo-card p")].map((p) => p.textContent);
      $("unused-only").checked = true;
      $("unused-only").dispatchEvent(new dom.window.Event("change"));
      const unused = [...document.querySelectorAll(".library-photo span")].map(
        (span) => span.textContent
      );
      assert.ok(unused.length < everything, "unused filter hides photos already in the video");
      assert.ok(
        inScene.length > 0 && inScene.every((name) => !unused.includes(name)),
        "unused filter never lists a photo the video already uses"
      );
      $("photo-search").value = "zzz-no-such-photo";
      $("photo-search").dispatchEvent(new dom.window.Event("input"));
      assert.equal(
        document.querySelectorAll(".library-photo").length,
        0,
        "search and unused filter combine"
      );
      $("unused-only").checked = false;
      $("unused-only").dispatchEvent(new dom.window.Event("change"));

      $("photo-search").value = "2019-08-04";
      $("photo-search").dispatchEvent(new dom.window.Event("input"));
      assert.equal(document.querySelectorAll(".library-photo").length, 1);
      document.querySelector(".library-photo").click();
      assert.equal(document.querySelectorAll(".photo-card").length, 3);
      change("layout", "Pair");
      assert.equal($("layout").value, "Four photos", "smaller layout never drops photos");
      change("position", "3");
      assert.equal($("position").value, "3");
      change("background-scope", "scene");
      change("background-style", "gradient");
      change("background-color", "#304050");
      change("chapter", "Family");
      change("caption", "A favorite memory");
      $("animate-all").click();
      change("photo-preset", "push");
      $("pose-end").click();
      assert.equal($("motion-overlay").hasAttribute("hidden"), false);
      change("pose-x", "60");
      const overlay = $("motion-overlay");
      overlay.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1920, height: 1080 });
      overlay
        .querySelector("rect")
        .dispatchEvent(
          new dom.window.MouseEvent("pointerdown", { clientX: 100, clientY: 100, bubbles: true })
        );
      overlay.dispatchEvent(
        new dom.window.MouseEvent("pointermove", { clientX: 130, clientY: 50, bubbles: true })
      );
      overlay.dispatchEvent(new dom.window.MouseEvent("pointerup", { bubbles: true }));
      assert.equal($("pose-x").value, "90");
      $("focal-image").getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 80 });
      $("focal-picker").dispatchEvent(
        new dom.window.MouseEvent("click", { clientX: 30, clientY: 40, bubbles: true })
      );
      assert.equal($("focal-x").value, "0.3");
      change("end-layout", "Feature + two");
      $("continue-layout").click();
      assert.equal(document.querySelectorAll(".scene-item").length, 59);
      $("undo").click();
      assert.equal(document.querySelectorAll(".scene-item").length, 58);
      $("scrub").value = "2.5";
      $("scrub").dispatchEvent(new dom.window.Event("input"));
      assert.equal($("timecode").textContent, "0:02.15");
      const wav = Buffer.alloc(44 + 16000 * 2);
      wav.write("RIFF", 0);
      wav.writeUInt32LE(wav.length - 8, 4);
      wav.write("WAVEfmt ", 8);
      wav.writeUInt32LE(16, 16);
      wav.writeUInt16LE(1, 20);
      wav.writeUInt16LE(1, 22);
      wav.writeUInt32LE(16000, 24);
      wav.writeUInt32LE(32000, 28);
      wav.writeUInt16LE(2, 32);
      wav.writeUInt16LE(16, 34);
      wav.write("data", 36);
      wav.writeUInt32LE(32000, 40);
      for (let n = 0; n < 16000; n++)
        wav.writeInt16LE(Math.round(3000 * Math.sin((2 * Math.PI * 440 * n) / 16000)), 44 + n * 2);
      Object.defineProperty($("audio-file"), "files", {
        value: [new File([wav], "ui-tone.wav", { type: "audio/wav" })],
      });
      $("audio-file").dispatchEvent(new dom.window.Event("change"));
      await until(
        () => [...$("music-file").options].some((option) => option.value.startsWith("ui-tone-")),
        "audio import"
      );
      uploadedAudio = [...$("music-file").options].find((option) =>
        option.value.startsWith("ui-tone-")
      ).value;
      change("music-file", uploadedAudio);
      change("music-volume", ".2");
      change("music-fade_in", ".1");
      change("title", "Jared · Editor verification");
      $("save").click();
      await until(() => $("dirty").textContent === "Saved", "save completed");
      const saved = JSON.parse(await readFile(config, "utf8"));
      assert.equal(saved.title, "Jared · Editor verification");
      assert.equal(saved.scenes[2].title, "Family vacation memories");
      assert.equal(saved.scenes[2].duration, 9);
      assert.equal(saved.scenes[2].transition, "radial");
      assert.equal(saved.scenes[2].motion, "still");
      assert.equal(saved.scenes[2].photos.length, 3);
      assert.equal(saved.scenes[2].background.color, "#304050");
      assert.equal(saved.scenes[2].chapter, "Family");
      assert.equal(saved.scenes[2].caption, "A favorite memory");
      assert.equal(saved.scenes[2].photo_motion[0].end.x, 90);
      assert.equal(saved.scenes[2].photo_motion[0].focal.x, 0.3);
      assert.equal(saved.scenes[2].layout_end.length, 3);
      assert.equal(saved.sound.music.file, uploadedAudio);
      assert.equal(saved.audio, true);
      assert.equal((await (await fetch(`${base}/api/project`)).json()).project.title, saved.title);

      dom.window.close();
      dom = await JSDOM.fromURL(base, options);
      document = dom.window.document;
      await until(() => $("project-name").textContent === saved.title, "saved project reload");
      document.querySelectorAll(".scene-item")[2].click();
      assert.equal($("scene-title").value, "Family vacation memories");
      assert.equal(document.querySelector(".scene-item.selected strong").textContent, "Family vac");
      assert.equal($("dirty").textContent, "Saved");

      // Exercise the file-import handler and render button with a short project.
      const short = structuredClone(saved);
      short.scenes = short.scenes.slice(0, 3).map((scene) => ({ ...scene, duration: 1.2 }));
      short.transition_seconds = 0.2;
      Object.defineProperty($("json-file"), "files", {
        value: [{ text: async () => JSON.stringify(short) }],
      });
      $("json-file").dispatchEvent(new dom.window.Event("change"));
      await until(() => document.querySelectorAll(".scene-item").length === 3, "JSON import");
      $("render").click();
      let job;
      await until(async () => {
        job = await (await fetch(`${base}/api/status`)).json();
        return ["complete", "failed"].includes(job.state);
      }, "short server render");
      renderedOutput = job.output;
      renderedOutputs.push(renderedOutput);
      assert.equal(job.state, "complete", job.log.join("\n"));
      const video = await fetch(`${base}/render/video`);
      assert.equal(video.headers.get("content-type"), "video/mp4");
      assert.ok((await video.arrayBuffer()).byteLength > 1000);
      $("preview-from").value = ".4";
      $("preview-length").value = ".6";
      await until(() => !$("preview-section").disabled, "preview control ready");
      $("preview-section").click();
      await until(async () => {
        job = await (await fetch(`${base}/api/status`)).json();
        return job.output !== renderedOutput && ["complete", "failed"].includes(job.state);
      }, "section preview");
      renderedOutputs.push(job.output);
      assert.equal(job.state, "complete", job.log.join("\n"));
      assert.equal(job.preview, true);
      await until(() => !$("preview-player").hidden, "preview player");
      const range = await fetch(`${base}/render/video?play`, { headers: { Range: "bytes=0-31" } });
      assert.equal(range.status, 206);
      assert.equal((await range.arrayBuffer()).byteLength, 32);
      assert.deepEqual(errors, []);
    } finally {
      dom?.window.close();
      child.kill();
      await new Promise((resolve) =>
        child.exitCode !== null ? resolve() : child.once("exit", resolve)
      );
      for (const renderedOutput of renderedOutputs) {
        assert.equal(
          path.dirname(path.resolve(renderedOutput)),
          path.resolve(root, "videos/renders")
        );
        assert.match(path.basename(renderedOutput), /^collage-\d{8}-\d{6}-\d{6}\.mp4$/);
        for (const extension of [".mp4", ".json", ".render.json"]) {
          await rm(renderedOutput.replace(/\.mp4$/, extension), { force: true });
        }
      }
      assert.equal(path.dirname(path.resolve(folder)), path.resolve(tmpdir()));
      assert.ok(path.basename(folder).startsWith("collage-ui-"));
      await rm(folder, { recursive: true, force: true });
      if (uploadedAudio) {
        const audioPath = path.resolve(root, "videos/audio", uploadedAudio);
        assert.equal(path.dirname(audioPath), path.resolve(root, "videos/audio"));
        await rm(audioPath, { force: true });
      }
    }
  }
);

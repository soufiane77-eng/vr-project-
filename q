[1mdiff --git a/src/js/main.js b/src/js/main.js[m
[1mindex 820650d..83fe8c3 100644[m
[1m--- a/src/js/main.js[m
[1m+++ b/src/js/main.js[m
[36m@@ -164,16 +164,14 @@[m [mfunction resizeCanvas() {[m
   const width = window.innerWidth;[m
   const height = window.innerHeight;[m
   const dpr = window.devicePixelRatio || 1;[m
[31m-  // Cap device pixel ratio at 2: prevents huge canvases on high-DPI phones[m
[31m-  const cappedDpr = Math.min(dpr, 2);[m
 [m
   // Canvas 1 Sizing[m
[31m-  canvas.width = width * cappedDpr;[m
[31m-  canvas.height = height * cappedDpr;[m
[32m+[m[32m  canvas.width = width * dpr;[m
[32m+[m[32m  canvas.height = height * dpr;[m
 [m
   // Canvas 2 Sizing[m
[31m-  canvas2.width = width * cappedDpr;[m
[31m-  canvas2.height = height * cappedDpr;[m
[32m+[m[32m  canvas2.width = width * dpr;[m
[32m+[m[32m  canvas2.height = height * dpr;[m
 [m
   // Render current frames[m
   render();[m
[36m@@ -183,77 +181,65 @@[m [mfunction resizeCanvas() {[m
 // Listen for window resize events[m
 window.addEventListener('resize', resizeCanvas);[m
 [m
[31m-// Batched image loader: loads paths with limited concurrency so image[m
[31m-// decodes don't burst on the main thread (better TBT / LCP / FCP / SI).[m
[31m-// Writes into `target` at the matching index to preserve order.[m
[31m-function loadImageBatch(paths, target, onProgress, concurrency = 6) {[m
[32m+[m[32m// Preload all Section 1 images and synchronously preserve order[m
[32m+[m[32mfunction preloadImages() {[m
   return new Promise((resolve) => {[m
[31m-    const total = paths.length;[m
[31m-    let next = 0;[m
[31m-    let done = 0;[m
[31m-[m
[31m-    const worker = () => {[m
[31m-      if (next >= total) return;[m
[31m-      const i = next++;[m
[32m+[m[32m    for (let i = 1; i <= frameCount; i++) {[m
       const img = new Image();[m
[31m-      img.decoding = 'async'; // decode off the critical path[m
[31m-      target[i] = img;[m
[31m-      const finish = () => {[m
[31m-        done++;[m
[31m-        if (onProgress) onProgress(done, total);[m
[31m-        if (done === total) resolve();[m
[31m-        else worker();[m
[32m+[m[32m      images.push(img);[m
[32m+[m[32m      img.onload = () => {[m
[32m+[m[32m        loadedCount++;[m
[32m+[m[32m        loaderText.textContent = `Loading ${Math.round((loadedCount / frameCount) * 100)}%`;[m
[32m+[m[41m        [m
[32m+[m[32m        if (loadedCount === frameCount) {[m
[32m+[m[32m          resolve();[m
[32m+[m[32m        }[m
       };[m
[31m-      img.onload = finish;[m
[31m-      img.onerror = finish;[m
[31m-      img.src = paths[i];[m
[31m-    };[m
[31m-[m
[31m-    for (let k = 0; k < Math.min(concurrency, total); k++) worker();[m
[31m-  });[m
[31m-}[m
[31m-[m
[31m-// Preload Section 1 images with limited concurrency.[m
[31m-// Resolves `firstReady` as soon as the first frame is available so the page[m
[31m-// can appear immediately instead of waiting for all 210 frames (~4.6 MB).[m
[31m-function preloadImages() {[m
[31m-  const paths = [];[m
[31m-  for (let i = 0; i < frameCount; i++) paths.push(getFramePath(i + 1));[m
[31m-[m
[31m-  let resolveFirst;[m
[31m-  const firstReady = new Promise((r) => { resolveFirst = r; });[m
[31m-[m
[31m-  const allLoaded = loadImageBatch(paths, images, (done, total) => {[m
[31m-    loaderText.textContent = `Loading ${Math.round((done / total) * 100)}%`;[m
[31m-    // Wait specifically for frame 0 (not just any first response)[m
[31m-    if (images[0] && images[0].complete) resolveFirst();[m
[32m+[m[32m      img.onerror = () => {[m
[32m+[m[32m        loadedCount++;[m
[32m+[m[32m        if (loadedCount === frameCount) {[m
[32m+[m[32m          resolve();[m
[32m+[m[32m        }[m
[32m+[m[32m      };[m
[32m+[m[32m      img.src = getFramePath(i);[m
[32m+[m[32m    }[m
   });[m
[31m-[m
[31m-  return { firstReady, allLoaded };[m
 }[m
 [m
[31m-// Preload Section 3 images in the background with limited concurrency[m
[32m+[m[32m// Preload Section 3 images asynchronously in the background and preserve order[m
 function preloadImages2() {[m
[31m-  const paths = [];[m
[31m-  for (let i = 0; i < frameCount2; i++) paths.push(getFramePath2(i + 1));[m
[31m-  return loadImageBatch(paths, images2).then(() => {[m
[31m-    sequence2Loaded = true;[m
[32m+[m[32m  return new Promise((resolve) => {[m
[32m+[m[32m    for (let i = 1; i <= frameCount2; i++) {[m
[32m+[m[32m      const img = new Image();[m
[32m+[m[32m      images2.push(img);[m
[32m+[m[32m      img.onload = () => {[m
[32m+[m[32m        loadedCount2++;[m
[32m+[m[32m        if (loadedCount2 === frameCount2) {[m
[32m+[m[32m          sequence2Loaded = true;[m
[32m+[m[32m          resolve();[m
[32m+[m[32m        }[m
[32m+[m[32m      };[m
[32m+[m[32m      img.onerror = () => {[m
[32m+[m[32m        loadedCount2++;[m
[32m+[m[32m        if (loadedCount2 === frameCount2) {[m
[32m+[m[32m          sequence2Loaded = true;[m
[32m+[m[32m          resolve();[m
[32m+[m[32m        }[m
[32m+[m[32m      };[m
[32m+[m[32m      img.src = getFramePath2(i);[m
[32m+[m[32m    }[m
   });[m
 }[m
 [m
 // Initialize components[m
 async function init() {[m
[31m-  // 1. Start preloading Section 1 frames (batched, in the background)[m
[31m-  const { firstReady, allLoaded } = preloadImages();[m
[31m-[m
[31m-  // 2. Show the page as soon as the FIRST frame is ready (~19 KB)[m
[31m-  //    instead of waiting for all 210 frames (~4.6 MB) → fast LCP/FCP/SI[m
[31m-  await firstReady;[m
[32m+[m[32m  // 1. Load Section 1 first to make page immediately interactive[m
[32m+[m[32m  await preloadImages();[m
 [m
[31m-  // 3. Hide loading overlay[m
[32m+[m[32m  // 2. Hide loading overlay[m
   loader.classList.add('loader--hidden');[m
 [m
[31m-  // 4. Trigger initial sizing and render first frame of Section 1[m
[32m+[m[32m  // 3. Trigger initial sizing and render first frame of Section 1[m
   resizeCanvas();[m
 [m
   // 4. Canvas 1 + Hero visible from the start[m
[36m@@ -305,24 +291,7 @@[m [masync function init() {[m
     onUpdate: render,[m
   });[m
 [m
[31m-  // 5. Remaining Section 1 frames keep loading in the background;[m
[31m-  //    re-render once everything is available (no visible change needed)[m
[31m-  allLoaded.then(() => {[m
[31m-    render();[m
[31m-  });[m
[31m-[m
[31m-  // 6. Section 3 images are preloaded ONLY when the user scrolls toward them,[m
[31m-  //    to avoid decoding 240 extra frames at startup[m
[31m-  ScrollTrigger.create({[m
[31m-    trigger: '#seq-wrapper-2',[m
[31m-    start: 'top bottom',[m
[31m-    once: true,[m
[31m-    onEnter: setupSection3,[m
[31m-  });[m
[31m-}[m
[31m-[m
[31m-// Preload and set up Section 3 (canvas 2) when it's about to enter the viewport[m
[31m-function setupSection3() {[m
[32m+[m[32m  // 5. Preload Section 3 images in the background[m
   preloadImages2().then(() => {[m
     // Redraw Canvas 2 with first frame of Section 3 once preloaded[m
     render2();[m

#!/usr/bin/env node
/**
 * Inlines angel-silhouette-pixelated.svg, two-figures-pixelated.svg, and logo-pixelated.svg
 * into pixel-reveal.html so the page works when opened via file:// (no server).
 * Run: node build-pixel-reveal.js
 */

const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname);
const angelSvg = fs.readFileSync(path.join(dir, 'angel-silhouette-pixelated.svg'), 'utf8');
const twoFigsSvg = fs.readFileSync(path.join(dir, 'two-figures-pixelated.svg'), 'utf8');
const logoSvg = fs.readFileSync(path.join(dir, 'logo-pixelated.svg'), 'utf8');

function stripXmlDeclaration(text) {
  return text.replace(/^\s*<\?xml[\s\S]*?\?>\s*/i, '').trim();
}

const angelInline = stripXmlDeclaration(angelSvg);
const twoFigsInline = stripXmlDeclaration(twoFigsSvg);
const logoInline = stripXmlDeclaration(logoSvg);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel Reveal</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            background: #1a1a1a;
            color: #e0e0e0;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        a.back {
            position: absolute;
            top: 1rem;
            left: 1rem;
            color: #888;
            text-decoration: none;
        }
        a.back:hover { color: #fff; }
        h1 {
            font-size: 1rem;
            font-weight: 500;
            color: #666;
            margin-bottom: 1rem;
        }
        .stage {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
            justify-content: center;
            align-items: flex-start;
        }
        .stage rect {
            opacity: 0;
        }
        .figure {
            flex: 0 0 auto;
        }
        .figure svg {
            display: block;
            width: min(90vw, 480px);
            height: auto;
        }
        .figure span {
            display: block;
            text-align: center;
            font-size: 0.85rem;
            color: #555;
            margin-top: 0.5rem;
        }
        .controls {
            margin-top: 2rem;
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        button {
            padding: 0.5rem 1rem;
            background: #333;
            color: #e0e0e0;
            border: 1px solid #555;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        button:hover { background: #444; }
        #status { color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <a href="index.html" class="back">&larr; Back to Macro Tracker</a>
    <h1>Pixel reveal (5s)</h1>
    <div class="stage">
        <div class="figure" id="fig1">
${angelInline}
            <span>Angel silhouette</span>
        </div>
        <div class="figure" id="fig2">
${twoFigsInline}
            <span>Two figures</span>
        </div>
        <div class="figure" id="figLogo">
${logoInline}
            <span>Logo</span>
        </div>
    </div>
    <div class="controls">
        <button id="replay">Replay</button>
        <span id="status"></span>
    </div>

    <script>
(function () {
    const DURATION_MS = 5000;
    const statusEl = document.getElementById('status');
    const replayBtn = document.getElementById('replay');
    const fig1 = document.getElementById('fig1');
    const fig2 = document.getElementById('fig2');
    const figLogo = document.getElementById('figLogo');

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    let allRects = [];
    let revealTimes = [];
    let animationId = null;

    function hideAll() {
        allRects.forEach(function (r) { r.style.opacity = '0'; });
    }

    function runReveal() {
        if (animationId != null) cancelAnimationFrame(animationId);
        hideAll();
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            for (var i = 0; i < allRects.length; i++) {
                if (revealTimes[i] <= elapsed) allRects[i].style.opacity = '1';
            }
            if (elapsed < DURATION_MS) animationId = requestAnimationFrame(tick);
            else { animationId = null; statusEl.textContent = 'Done.'; }
        }
        statusEl.textContent = 'Revealing…';
        animationId = requestAnimationFrame(tick);
    }

    function start() {
        var angelRects = Array.from(fig1.querySelectorAll('rect'));
        var twoFigsRects = Array.from(fig2.querySelectorAll('rect'));
        var logoRects = Array.from(figLogo.querySelectorAll('rect'));
        if (angelRects.length === 0 && twoFigsRects.length === 0 && logoRects.length === 0) {
            statusEl.textContent = 'No pixels found.';
            return;
        }
        allRects = shuffle(angelRects.concat(twoFigsRects).concat(logoRects));
        revealTimes = [];
        for (var i = 0; i < allRects.length; i++) revealTimes.push((DURATION_MS * i) / allRects.length);
        statusEl.textContent = allRects.length + ' pixels.';
        hideAll();
        setTimeout(runReveal, 150);
    }

    replayBtn.addEventListener('click', function () {
        if (allRects.length) runReveal();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
    <\/script>
</body>
</html>
`;

fs.writeFileSync(path.join(dir, 'pixel-reveal.html'), html, 'utf8');
console.log('Wrote pixel-reveal.html (SVGs inlined). Open it directly in the browser.');

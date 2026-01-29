#!/usr/bin/env node
/**
 * Inlines logo (martechtext), angel-silhouette-pixelated.svg, and man on boat (two-figures-pixelated.svg).
 * Logo at top, then ample vertical space, then man on boat (left) and angel (right) with ample horizontal gap.
 * Page filled heartily; white bg, blue pixels. Responsive.
 * Run: node build-pixel-reveal.js
 */

const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname);
const angelSvg = fs.readFileSync(path.join(dir, 'angel-silhouette-pixelated.svg'), 'utf8');
const manOnBoatSvg = fs.readFileSync(path.join(dir, 'two-figures-pixelated.svg'), 'utf8');
const martechSvg = fs.readFileSync(path.join(dir, 'martechtext-pixelated.svg'), 'utf8');
const cursorSvg = fs.readFileSync(path.join(dir, 'cursor.svg'), 'utf8');
const cursorDataUrl = 'data:image/svg+xml,' + encodeURIComponent(cursorSvg);

function stripXmlDeclaration(text) {
  return text.replace(/^\s*<\?xml[\s\S]*?\?>\s*/i, '').trim();
}

const angelInline = stripXmlDeclaration(angelSvg);
const manOnBoatInline = stripXmlDeclaration(manOnBoatSvg);
const martechInline = stripXmlDeclaration(martechSvg);

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
            background: #2563eb;
            color: #fff;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0;
            cursor: url("${cursorDataUrl}") 8 2, auto;
        }
        .header {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: clamp(1.5rem, 5vw, 3rem) clamp(0.75rem, 4vw, 2rem);
        }
        .header svg {
            display: block;
            width: 100%;
            max-width: 85vw;
            height: auto;
            object-fit: contain;
        }
        .header rect,
        .stage rect {
            opacity: 0;
            fill: currentColor;
        }
        .stage {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: clamp(2.5rem, 6vw, 5rem);
            justify-items: center;
            align-items: start;
            width: 100%;
            max-width: 1600px;
            padding: clamp(7rem, 22vw, 16rem) clamp(0.75rem, 4vw, 2rem) clamp(1rem, 3vw, 2rem);
            margin: 0 auto;
        }
        .stage .figure {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .stage .figure:nth-child(1) {
            margin-top: clamp(5rem, 14vw, 10rem);
        }
        .stage .figure:nth-child(2) {
            margin-top: 0;
        }
        .stage .figure svg {
            display: block;
            width: 100%;
            max-width: min(95vw, 1872px);
            height: auto;
            object-fit: contain;
        }
        @media (max-width: 700px) {
            .stage {
                grid-template-columns: 1fr;
                gap: 2rem;
                padding-top: clamp(2rem, 5vw, 3rem);
            }
            .stage .figure:nth-child(1) {
                margin-top: 0;
            }
        }
    </style>
</head>
<body>
    <header class="header" id="figMartech">
${martechInline}
    </header>
    <div class="stage">
        <div class="figure" id="figManOnBoat">
${manOnBoatInline}
        </div>
        <div class="figure" id="figAngel">
${angelInline}
        </div>
    </div>

    <script>
(function () {
    const DURATION_MS = 5000;
    const figAngel = document.getElementById('figAngel');
    const figManOnBoat = document.getElementById('figManOnBoat');
    const figMartech = document.getElementById('figMartech');

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    var allRects = [];
    var revealTimes = [];
    var animationId = null;

    function hideAll() {
        allRects.forEach(function (r) { r.style.opacity = '0'; });
    }

    function runReveal() {
        if (animationId != null) cancelAnimationFrame(animationId);
        hideAll();
        for (var i = 0; i < allRects.length; i++) revealTimes[i] = (DURATION_MS * i) / allRects.length;
        var start = performance.now();
        function tick(now) {
            var elapsed = now - start;
            for (var i = 0; i < allRects.length; i++) {
                if (revealTimes[i] <= elapsed) allRects[i].style.opacity = '1';
            }
            if (elapsed < DURATION_MS) animationId = requestAnimationFrame(tick);
            else animationId = null;
        }
        animationId = requestAnimationFrame(tick);
    }

    function start() {
        var martechRects = Array.from(figMartech.querySelectorAll('rect'));
        var angelRects = Array.from(figAngel.querySelectorAll('rect'));
        var manOnBoatRects = Array.from(figManOnBoat.querySelectorAll('rect'));
        if (martechRects.length === 0 && angelRects.length === 0 && manOnBoatRects.length === 0) return;
        allRects = shuffle(martechRects.concat(angelRects).concat(manOnBoatRects));
        revealTimes = [];
        hideAll();
        setTimeout(runReveal, 150);
    }

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
console.log('Wrote pixel-reveal.html (logo + angel + man on boat, filled layout, ample spacing).');

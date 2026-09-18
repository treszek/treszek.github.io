import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItAttrs from "markdown-it-attrs";

/* ---------------------------------------------------------------------------
 * markdown-it plugin: turn a paragraph that is only a bare URL into an embed.
 *   - YouTube link  -> responsive iframe
 *   - video file    -> <video controls>
 *   - image file    -> <img>
 *   - anything else -> link card
 * ------------------------------------------------------------------------- */
function embedHtml(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  const path = u.pathname.toLowerCase();

  let ytId = null;
  if (host === "youtu.be") ytId = u.pathname.slice(1);
  else if (host === "youtube.com" && u.searchParams.get("v")) ytId = u.searchParams.get("v");
  else if (host === "youtube.com" && u.pathname.startsWith("/shorts/")) ytId = u.pathname.split("/")[2];
  if (ytId) {
    return `<div class="embed-video"><iframe src="https://www.youtube-nocookie.com/embed/${ytId}" title="YouTube video" loading="lazy" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`;
  }
  if (/\.(mp4|webm|mov|m4v)$/.test(path)) {
    return `<video class="embed-file" controls preload="metadata" src="${url}"></video>`;
  }
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(path)) {
    return `<p><img src="${url}" alt="" loading="lazy"></p>`;
  }
  return `<a class="linkcard" href="${url}" target="_blank" rel="noopener"><span class="linkcard-host">${host}</span><span class="linkcard-url">${url}</span></a>`;
}

function mdEmbeds(md) {
  md.core.ruler.push("bare_url_embeds", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length - 2; i++) {
      if (
        tokens[i].type !== "paragraph_open" ||
        tokens[i + 1].type !== "inline" ||
        tokens[i + 2].type !== "paragraph_close"
      )
        continue;
      const text = tokens[i + 1].content.trim();
      if (!/^https?:\/\/\S+$/.test(text)) continue;
      const html = embedHtml(text);
      if (!html) continue;
      const t = new state.Token("html_block", "", 0);
      t.content = html + "\n";
      tokens.splice(i, 3, t);
    }
  });
}

/* ---------------------------------------------------------------------------
 * Contribution graph ("grass") — GitHub-identical layout, built from post dates.
 * ------------------------------------------------------------------------- */
const DAY = 86400000;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/*
 * Vertical countdown grass: today (UTC) is the FIRST cell at the top,
 * followed by the remaining days of the current year. Nothing else.
 * 7 cells per row, row-major, month labels on the left.
 */
function grassSvg(posts) {
  const counts = {};
  for (const p of posts || []) {
    const key = p.date.toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  }

  const cell = 11;
  const gap = 3;
  const step = cell + gap;
  const cols = 7;
  const left = 28; // room for month labels
  const top = 2;

  const now = new Date();
  const year = now.getUTCFullYear();
  const start = Date.UTC(year, now.getUTCMonth(), now.getUTCDate()); // today
  const endOfYear = Date.UTC(year, 11, 31);
  const days = Math.round((endOfYear - start) / DAY) + 1;
  const rows = Math.ceil(days / cols);

  let rects = "";
  let monthLabels = "";
  const labeledRows = new Set();

  for (let i = 0; i < days; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const t = start + i * DAY;
    const d = new Date(t);
    const key = d.toISOString().slice(0, 10);
    const n = counts[key] || 0;
    const lv = n === 0 ? 0 : Math.min(n, 4);
    rects += `<rect x="${left + c * step}" y="${top + r * step}" width="${cell}" height="${cell}" rx="2" ry="2" class="g${lv}${i === 0 ? " g-today" : ""}"><title>${key}: ${n} post${n === 1 ? "" : "s"}</title></rect>`;
    if ((i === 0 || d.getUTCDate() === 1) && !labeledRows.has(r)) {
      monthLabels += `<text x="0" y="${top + r * step + cell - 2}" class="grass-label">${MONTHS[d.getUTCMonth()]}</text>`;
      labeledRows.add(r);
    }
  }

  const width = left + cols * step;
  const height = top + rows * step;

  return `<div class="grass grass-blog" role="img" aria-label="Blog — ${days} days left in ${year}">
<div class="grass-meta"><strong>Blog</strong><span>${days} days left</span></div>
<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${monthLabels}${rects}</svg>
<div class="grass-year" style="width:${width}px">/${year}</div>
</div>`;
}

/* ------------------------------------------------------------------------- */

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ linkify: true });
    md.use(markdownItAttrs);
    md.use(mdEmbeds);
  });

  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addFilter("utcDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("utcDateTime", (d) => {
    const iso = new Date(d).toISOString();
    return `${iso.slice(0, 10)} ${iso.slice(11, 16)} GMT`;
  });
  eleventyConfig.addFilter("inBoard", (posts, slug) =>
    (posts || []).filter((p) => p.data.board === slug).reverse()
  );
  eleventyConfig.addFilter("latest", (posts, n) =>
    (posts || []).slice().reverse().slice(0, n || 10)
  );

  eleventyConfig.addShortcode("grass", grassSvg);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}

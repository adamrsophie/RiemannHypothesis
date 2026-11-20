(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) {}

  var pages = [
    ["index.html", "Home"],
    ["background.html", "Background"],
    ["statements.html", "Statements"],
    ["proof.html", "Proof structure"],
    ["layout.html", "Project layout"],
    ["verify.html", "Verify"],
    ["note.html", "The note"],
    ["faq.html", "FAQ"]
  ];
  var here = location.pathname.split("/").pop() || "index.html";

  document.addEventListener("DOMContentLoaded", function () {
    // Navigation bar
    var nav = document.createElement("nav");
    nav.className = "topnav";
    nav.innerHTML =
      '<div class="inner">' +
      '<a class="brand" href="index.html">RH <span>in Lean</span></a>' +
      '<div class="navlinks" id="navlinks">' +
      pages.map(function (p) {
        return '<a href="' + p[0] + '"' + (p[0] === here ? ' class="active" aria-current="page"' : "") + ">" + p[1] + "</a>";
      }).join("") +
      "</div>" +
      '<div class="navtools">' +
      '<button class="iconbtn menubtn" id="menubtn" aria-label="Menu">Menu</button>' +
      '<button class="iconbtn" id="themebtn" aria-label="Toggle color theme">◐</button>' +
      '<a class="iconbtn" href="https://github.com/adamrsophie/RiemannHypothesis" aria-label="GitHub repository">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>' +
      '<span class="ghlabel">GitHub</span></a>' +
      "</div></div>";
    document.body.insertBefore(nav, document.body.firstChild);

    document.getElementById("menubtn").addEventListener("click", function () {
      document.getElementById("navlinks").classList.toggle("open");
    });
    document.getElementById("themebtn").addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark" ||
        (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });

    // Footer
    var foot = document.createElement("footer");
    foot.className = "site";
    foot.innerHTML =
      '<div class="inner"><span>Unofficial guide to Levent Alpöge\'s Lean 4 formalization. The Lean code is © Levent Alpöge.</span>' +
      '<span><a href="https://alpo.ge/remark.pdf">remark.pdf</a> · <a href="https://github.com/adamrsophie/RiemannHypothesis">Source</a></span></div>';
    document.body.appendChild(foot);

    // Previous and next links
    var content = document.querySelector(".content");
    var idx = pages.findIndex(function (p) { return p[0] === here; });
    if (content && idx >= 0) {
      var pager = document.createElement("div");
      pager.className = "pager";
      var html = "";
      if (idx > 0) html += '<a href="' + pages[idx - 1][0] + '"><small>Previous</small>' + pages[idx - 1][1] + "</a>";
      if (idx < pages.length - 1) html += '<a class="next" href="' + pages[idx + 1][0] + '"><small>Next</small>' + pages[idx + 1][1] + "</a>";
      pager.innerHTML = html;
      content.appendChild(pager);
    }

    // On this page table of contents
    var toc = document.querySelector(".toc");
    if (toc && content) {
      var heads = content.querySelectorAll("h2[id], h3[id]");
      var list = '<h4>On this page</h4><ul>';
      heads.forEach(function (h) {
        list += '<li class="' + (h.tagName === "H3" ? "sub" : "") + '"><a href="#' + h.id + '">' + h.textContent + "</a></li>";
      });
      toc.innerHTML = list + "</ul>";
      var links = toc.querySelectorAll("a");
      var onScroll = function () {
        var current = null;
        heads.forEach(function (h) { if (h.getBoundingClientRect().top < 120) current = h.id; });
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + current); });
      };
      document.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // Math rendering
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
      });
    }
  });
})();

import Alpine from "alpinejs";

import "./style.css";

const API_KEY = import.meta.env.VITE_NASA_API_KEY;
const TIME_BEFORE_ABORT = 4000;
const SEARCH_TEMPLATE = "https://www.google.com/search";

Alpine.data("apod", () => ({
  loading: true,
  data: null,
  error: null,

  async init() {
    // Search engine logic
    let searchInput = document.getElementById("search");
    let searchForm = document.querySelector("form");

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let query = searchInput.value;
      let type = document.querySelector('input[name="type"]:checked').value;
      let targetUrl =
        SEARCH_TEMPLATE + `?q=${encodeURIComponent(query)}&tbm=${type}`;
      window.location = targetUrl;
    });

    // Nasa fetching logic
    let savedAt = localStorage.getItem("savedAt:apod:v1");
    let needsToFetch =
      savedAt == null || Date.now() - Date.parse(savedAt) >= 60 * 60 * 1000;

    let savedTitle = localStorage.getItem("title:apod:v1");
    let savedUrl = localStorage.getItem("url:apod:v1");
    let savedExplanation = localStorage.getItem("explanation:apod:v1");
    let savedCopyright = localStorage.getItem("copyright:apod:v1");

    try {
      if (!needsToFetch) {
        this.data = {};
        this.data.title = savedTitle;
        this.data.url = savedUrl;
        this.data.explanation = savedExplanation;
        this.data.copyright = savedCopyright;
      } else {
        let response;

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            response = await fetch(
              `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`,
              { signal: AbortSignal.timeout(TIME_BEFORE_ABORT) },
            );

            if (response.ok) break;
            if (response.status < 500) break;
          } catch {
            response = undefined;
          }

          if (attempt < 2) {
            await new Promise((resolve) =>
              setTimeout(resolve, 500 * 2 ** attempt),
            );
          }
        }

        if (!response) throw new Error("No response from NASA");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        this.data = await response.json();

        if (this.data.copyright) {
          let copyright = `Image by ${this.data.copyright.trim()}`;
          this.data.copyright = copyright;
          localStorage.setItem("copyright:apod:v1", copyright);
        }

        localStorage.setItem("title:apod:v1", this.data.title);
        localStorage.setItem("url:apod:v1", this.data.url);
        localStorage.setItem("explanation:apod:v1", this.data.explanation);
        localStorage.setItem("savedAt:apod:v1", new Date().toISOString());
      }
    } catch (e) {
      if (savedTitle != null) {
        this.data = {
          title: savedTitle,
          url: savedUrl,
          explanation: savedExplanation,
          copyright: savedCopyright,
        };
      } else {
        this.error = e.message;
      }
    } finally {
      this.loading = false;
    }
  },
}));

window.Alpine = Alpine;
Alpine.start();

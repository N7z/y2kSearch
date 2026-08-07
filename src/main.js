import Alpine from "alpinejs";

import "./style.css";

const API_KEY = import.meta.env.VITE_NASA_API_KEY;

Alpine.data("apod", () => ({
  loading: true,
  data: null,
  error: null,

  async init() {
    let savedAt = localStorage.getItem("savedAt:apod:v1");
    let needsToFetch =
      savedAt == null || Date.now() - Date.parse(savedAt) >= 60 * 60 * 1000;

    let savedTitle = localStorage.getItem("title:apod:v1");
    let savedUrl = localStorage.getItem("url:apod:v1");
    let savedExplanation = localStorage.getItem("explanation:apod:v1");

    try {
      if (!needsToFetch) {
        this.data = {};
        this.data.title = savedTitle;
        this.data.url = savedUrl;
        this.data.explanation = savedExplanation;
      } else {
        const response = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`,
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        this.data = await response.json();

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
        };
      } else {
        this.error = e.message;
        await init();
      }
    } finally {
      this.loading = false;
    }
  },
}));

window.Alpine = Alpine;
Alpine.start();

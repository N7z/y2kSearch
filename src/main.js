import Alpine from "alpinejs";

import "./style.css";

const API_KEY = import.meta.env.VITE_NASA_API_KEY;

Alpine.data("apod", () => ({
  loading: true,
  data: null,
  error: null,

  async init() {
    try {
      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.data = await response.json();
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },
}));

window.Alpine = Alpine;
Alpine.start();

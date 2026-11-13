// Battle Environment - "Inside the Freezer"
// Builds a layered, animated backdrop inside #battle-screen .battle-background.
// Each of the 5 battles takes place in a different zone of the freezer.

const ENVIRONMENT_STAGES = [
  {
    // Battle 1 - Melty Mike
    name: "The Freezer Door",
    subtitle: "Warm air is leaking in...",
    theme: "door",
    particle: "snow",
    density: 40,
    speed: 0.6,
    wind: 0.15,
  },
  {
    // Battle 2 - Freezer Burn Fred
    name: "The Frost Shelf",
    subtitle: "Everything here has freezer burn.",
    theme: "frost",
    particle: "snow",
    density: 90,
    speed: 1,
    wind: 0.35,
  },
  {
    // Battle 3 - Sour Sam
    name: "The Crisper Drawer",
    subtitle: "Something smells... sour.",
    theme: "sour",
    particle: "fizz",
    density: 55,
    speed: 0.7,
    wind: 0,
  },
  {
    // Battle 4 - Rocky Road Roger
    name: "The Back Corner",
    subtitle: "Nobody has cleaned back here in years.",
    theme: "rocky",
    particle: "chunks",
    density: 45,
    speed: 1.6,
    wind: 0.1,
  },
  {
    // Battle 5 - Brain Freeze Boss
    name: "The Deep Freeze",
    subtitle: "-40° and falling.",
    theme: "deep",
    particle: "blizzard",
    density: 170,
    speed: 2.2,
    wind: 1.6,
  },
];

class Environment {
  constructor(game) {
    this.game = game;
    this.root = document.querySelector("#battle-screen .battle-background");
    this.screen = document.getElementById("battle-screen");
    this.stage = ENVIRONMENT_STAGES[0];
    this.particles = [];
    this.running = false;
    this.lastTime = 0;
    this.reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!this.root || !this.screen) return;
    this.build();
    this.watchScreen();
  }

  /** Create the layer stack */
  build() {
    this.root.innerHTML = `
      <div class="env-backdrop"></div>
      <div class="env-tint"></div>
      <div class="env-light"></div>
      <canvas class="env-particles" aria-hidden="true"></canvas>
      <div class="env-mist env-mist-back"></div>
      <div class="env-floor"></div>
      <div class="env-mist env-mist-front"></div>
      <div class="env-frost"></div>
      <div class="env-flash"></div>
    `;
    this.root.setAttribute("aria-hidden", "true");
    this.canvas = this.root.querySelector(".env-particles");
    this.ctx = this.canvas.getContext("2d");

    // Banner sits in front of the fighters, so it lives outside the backdrop
    this.banner = document.createElement("div");
    this.banner.className = "env-banner";
    this.banner.setAttribute("role", "status");
    this.banner.innerHTML =
      '<div class="env-banner-name"></div><div class="env-banner-sub"></div>';
    this.screen.appendChild(this.banner);
    this.flash = this.root.querySelector(".env-flash");

    this.resize();
    if (window.ResizeObserver) {
      new ResizeObserver(() => this.resize()).observe(this.root);
    } else {
      window.addEventListener("resize", () => this.resize());
    }
  }

  /** Only animate while the battle screen is visible */
  watchScreen() {
    const check = () => {
      if (this.screen.classList.contains("active")) this.start();
      else this.stop();
    };
    new MutationObserver(check).observe(this.screen, {
      attributes: true,
      attributeFilter: ["class"],
    });
    check();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Switch to the zone for a battle number (1-based)
   */
  setStage(battleNumber) {
    if (!this.root) return;
    const index = Math.min(
      Math.max(battleNumber - 1, 0),
      ENVIRONMENT_STAGES.length - 1
    );
    this.stage = ENVIRONMENT_STAGES[index];
    this.root.dataset.theme = this.stage.theme;

    // Reseed particles for the new zone
    this.resize();
    const count = this.reducedMotion
      ? Math.round(this.stage.density / 4)
      : this.stage.density;
    this.particles = Array.from({ length: count }, () =>
      this.makeParticle(true)
    );

    this.showBanner(battleNumber);
  }

  showBanner(battleNumber) {
    if (!this.banner) return;
    this.banner.querySelector(".env-banner-name").textContent =
      `Zone ${battleNumber}: ${this.stage.name}`;
    this.banner.querySelector(".env-banner-sub").textContent =
      this.stage.subtitle;
    this.banner.classList.remove("show");
    void this.banner.offsetWidth; // restart animation
    this.banner.classList.add("show");
  }

  makeParticle(anywhere) {
    const s = this.stage;
    const w = this.width || 800;
    const h = this.height || 600;
    const p = {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      phase: Math.random() * Math.PI * 2,
      depth: 0.4 + Math.random() * 0.6, // farther = slower + smaller
    };

    switch (s.particle) {
      case "fizz":
        // Sour bubbles rising from the floor
        p.y = anywhere ? Math.random() * h : h + 10;
        p.r = (2 + Math.random() * 5) * p.depth;
        p.vy = -(0.3 + Math.random() * 0.6) * s.speed;
        break;
      case "chunks":
        // Falling bits of rocky road
        p.r = (2 + Math.random() * 4) * p.depth;
        p.vy = (0.6 + Math.random()) * s.speed * p.depth;
        p.rot = Math.random() * Math.PI;
        p.spin = (Math.random() - 0.5) * 0.08;
        p.color = Math.random() < 0.5 ? "#6b4226" : "#f3e6d8";
        break;
      default:
        // snow / blizzard
        p.r = (0.8 + Math.random() * 2.4) * p.depth;
        p.vy = (0.4 + Math.random() * 0.8) * s.speed * p.depth;
        break;
    }
    return p;
  }

  start() {
    if (this.running || !this.ctx) return;
    this.running = true;
    this.resize();
    this.lastTime = performance.now();
    const loop = (t) => {
      if (!this.running) return;
      const dt = Math.min((t - this.lastTime) / 16.67, 3);
      this.lastTime = t;
      this.tick(dt, t);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }

  tick(dt, t) {
    const ctx = this.ctx;
    const s = this.stage;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const sway = Math.sin(t / 900 + p.phase) * 0.4;
      p.x += (s.wind * p.depth + sway) * dt;
      p.y += p.vy * dt;

      const offscreen =
        p.y > h + 12 || p.y < -14 || p.x > w + 14 || p.x < -14;
      if (offscreen) {
        // respawn: falling particles from the top, rising ones from the bottom
        const np = this.makeParticle(false);
        if (s.wind > 0.5 && Math.random() < 0.5) {
          np.x = -10;
          np.y = Math.random() * h;
        }
        this.particles[i] = np;
        continue;
      }

      if (s.particle === "fizz") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220, 255, 120, ${0.35 + p.depth * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = "rgba(240, 255, 170, 0.12)";
        ctx.fill();
      } else if (s.particle === "chunks") {
        p.rot += p.spin * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.5 + p.depth * 0.5;
        ctx.fillRect(-p.r, -p.r * 0.8, p.r * 2, p.r * 1.6);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + p.depth * 0.55})`;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Hit feedback: shake the stage and kick up a burst of particles
   * @param {boolean} heavy - stronger shake for heavy hits
   */
  impact(heavy = false) {
    if (!this.root) return;
    if (!this.reducedMotion) {
      const cls = heavy ? "env-shake-heavy" : "env-shake";
      this.root.classList.remove("env-shake", "env-shake-heavy");
      void this.root.offsetWidth;
      this.root.classList.add(cls);
      setTimeout(() => this.root.classList.remove(cls), 450);
    }

    // Burst: briefly speed up existing particles
    const boost = heavy ? 4 : 2;
    this.particles.forEach((p) => {
      p.x += (Math.random() - 0.5) * boost * 6;
      p.y += (Math.random() - 0.5) * boost * 4;
    });

    if (heavy && this.flash) {
      this.flash.classList.remove("show");
      void this.flash.offsetWidth;
      this.flash.classList.add("show");
    }
  }
}

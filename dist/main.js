// CONST & UTILITIES
const SELECTORS = {
  playerInput: "#player-name-input",
  addPlayerButton: "#add-player-btn",
  resetScoreButton: "#reset-score-btn",
  clearAllBtn: "#remove-all-btn",
  toggleThemeBtn: "#toggle-theme-btn",

  playersContainer: "#players-container",
  statsContainer: "#stats-container",

  totalPlayers: "#total-players",
  highestScorer: "#highest-scorer",
  totalScore: "#total-score",

  mainTitle: "#main-title",
};

const CSS_CLASSES = {
  playerCard: ["bg-white", "rounded-lg", "shadow-lg", "p-6", "player-card"],
  darkCard: ["bg-gray-800", "text-white"],
  lightTheme: ["bg-gradient-to-br", "from-blue-50", "to-indigo-100"],
  darkTheme: ["bg-gradient-to-br", "from-gray-800", "to-gray-900"],
  animation: ["animation-pulse"],
};

// DOM Utility Functions

class DOMUtils {
  static getElementById(id) {
    return document.getElementById(id);
  }

  static querySelector(selector) {
    return document.querySelector(selector);
  }

  static querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  static getElementsByTagName(tagName) {
    return document.getElementsByTagName(tagName);
  }

  static getElementsByClassName(className) {
    return document.getElementsByClassName(className);
  }

  static createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);
    if (classes.length > 0) {
      element.classList.add(...classes);
    }
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  static setTextContent(element, text) {
    if (element) {
      element.textContent = text;
    }
  }

  static setInnerHTML(element, html) {
    if (element) {
      element.innerHTML = html;
    }
  }

  static appendChild(parent, child) {
    if (parent && child) {
      parent.appendChild(child);
    }
  }

  static append(parent, child) {
    if (parent && child) {
      parent.append(child);
    }
  }

  static removeElement(element) {
    if (element) {
      element.remove();
    }
  }

  static getAttribute(element, attribute) {
    return element ? element.getAttribute(attribute) : null;
  }

  static setAttribute(element, attribute, value) {
    if (element) {
      element.setAttribute(attribute, value);
    }
  }
}

// Manage Player
class PlayerManager {
  constructor() {
    this.players = [];
  }

  addPlayer(name) {
    const player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      score: 0,
    };
    this.players.push(player);
    return player;
  }

  removePlayer(playerId) {
    this.players = this.players.filter((player) => player.id !== playerId);
  }

  updatePlayerScore(playerId, action) {
    const playerIndex = this.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return;

    if (action === "increase") {
      this.players[playerIndex].score++;
    } else if (action === "decrease") {
      this.players[playerIndex].score--;
    }

    return this.players[playerIndex];
  }

  resetAllscores() {
    this.players.forEach((player) => {
      player.score = 0;
    });
  }

  clearAllPlayers() {
    this.players = [];
  }

  getStats() {
    const totalPlayers = this.players.length;
    const totalScore = this.players.reduce(
      (sum, player) => sum + player.score,
      0
    );
    const highestScorer =
      this.players.length > 0
        ? this.players.reduce((prev, curr) =>
            prev.score > curr.score ? prev : curr
          )
        : null;

    return {
      totalPlayers,
      totalScore,
      highestScorer,
    };
  }
}

class UIManager {
  constructor(playerManager) {
    this.playerManager = playerManager;
    this.isDarkMode = false;
  }

  // Disini menerapkan : querySelector, createElement, innerHTML, dan appendChild
  renderPlayer(player) {
    const container = DOMUtils.getElementById(
      SELECTORS.playersContainer.substring(1)
    );
    // sama aja seperti document.getElementById('players-container') substring tu buat ngilangin # aja

    let cardClasses = [...CSS_CLASSES.playerCard]; // Salin array agar tidak mengubah konstanta asli
    let playerNameClass = "text-gray-800"; // Default mode terang

    if (this.isDarkMode) {
      // Jika mode gelap, sesuaikan kelas untuk kartu dan nama pemain
      cardClasses = cardClasses.filter((cls) => cls !== "bg-white"); // Hapus bg-white
      cardClasses.push(...CSS_CLASSES.darkCard); // Tambahkan kelas kartu gelap
      playerNameClass = "text-gray-100"; // Warna teks terang untuk nama pemain
    }

    const playerCard = DOMUtils.createElement("div", cardClasses, {
      // Use cardClasses here
      "data-player-id": player.id,
    });

    const playerHTML = `
        <div class="text-center">
            <h3 class="text-xl font-semibold ${playerNameClass} mb-4 player-name">${player.name}</h3>
            <div class="text-4xl font-bold text-indigo-600 mb-4 player-score">${player.score}</div>
            <div class="flex gap-2 mb-4">
                <button class="score-btn flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors" data-action="increase">
                    +1
                </button>
                <button class="score-btn flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" data-action="decrease">
                    -1
                </button>
            </div>
            <button class="remove-btn w-full px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                Hapus Pemain
            </button>
        </div>
    `;

    DOMUtils.setInnerHTML(playerCard, playerHTML);
    DOMUtils.appendChild(container, playerCard);

    this.attachPlayerEventListeners(playerCard, player.id);
  }

  // Disini ada querySelectorAll, addEventListener
  attachPlayerEventListeners(playerCard, playerId) {
    const scoreButtons = playerCard.getElementsByClassName("score-btn"); //HTMLCollection harus diconvert ke array

    Array.from(scoreButtons).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = DOMUtils.getAttribute(e.target, "data-action");
        this.handleScoreUpdate(playerId, action);
      });
    });

    const removeBtn = playerCard.querySelector(".remove-btn");
    if (removeBtn) {
      // Good practice to check if element exists
      removeBtn.addEventListener("click", () => {
        this.handleRemovePlayer(playerId);
      });
    }
  }

  // Disini ada querySelector, textContent, classList
  handleScoreUpdate(playerId, action) {
    const updatedPlayer = this.playerManager.updatePlayerScore(
      playerId,
      action
    );
    if (!updatedPlayer) return;

    const playerCard = DOMUtils.querySelector(`[data-player-id="${playerId}"]`);
    const scoreDisplay = playerCard.querySelector(".player-score");

    DOMUtils.setTextContent(scoreDisplay, updatedPlayer.score);

    // Animation tipis2
    scoreDisplay.classList.add(...CSS_CLASSES.animation);
    setTimeout(() => {
      scoreDisplay.classList.remove(...CSS_CLASSES.animation);
    }, 300);

    this.updateStats();
  }

  // disini ada querySelector, dan removeElement
  handleRemovePlayer(playerId) {
    this.playerManager.removePlayer(playerId);

    const playerCard = DOMUtils.querySelector(`[data-player-id="${playerId}"]`);
    DOMUtils.removeElement(playerCard);

    this.updateStats();
  }

  // ada fitur DOM: textContent, getElementById
  updateStats() {
    const stats = this.playerManager.getStats();

    const totalPlayersElement = DOMUtils.getElementById("total-players");
    const highestScorerElement = DOMUtils.getElementById("highest-scorer");
    const totalScoreElement = DOMUtils.getElementById("total-score");

    DOMUtils.setTextContent(totalPlayersElement, stats.totalPlayers);
    DOMUtils.setTextContent(totalScoreElement, stats.totalScore);

    const highestScorerText = stats.highestScorer
      ? `${stats.highestScorer.name} (${stats.highestScorer.score})`
      : "-";
    DOMUtils.setTextContent(highestScorerElement, highestScorerText);

    const statsContainerElement = DOMUtils.getElementById(
      SELECTORS.statsContainer.substring(1)
    );
    // disini kita traversing parent/child
    if (statsContainerElement) {
      const statsContentElement =
        statsContainerElement.querySelector("#stats-content");

      if (statsContentElement) {
        // Add a check if statsContent exists
        statsContentElement.classList.add(...CSS_CLASSES.animation);
        setTimeout(() => {
          statsContentElement.classList.remove(...CSS_CLASSES.animation);
        }, 300);
      }
    }
  }

  // disini terdapat querySelectorAll dan textContent
  resetAllScoresUI() {
    this.playerManager.resetAllScores();

    const scoreDisplays = DOMUtils.getElementsByClassName("player-score");
    Array.from(scoreDisplays).forEach((display) => {
      DOMUtils.setTextContent(display, "0");
    });

    this.updateStats();
  }

  // ada querySelector dan innerHTML
  clearAllPlayersUI() {
    if (this.playerManager.players.length === 0) return;

    if (confirm("Apakah Anda yakin ingin menghapus semua pemain?")) {
      this.playerManager.clearAllPlayers();

      const playersContainer = DOMUtils.querySelector(
        SELECTORS.playersContainer
      );
      DOMUtils.setInnerHTML(playersContainer, "");

      this.updateStats();
    }
  }

  // ada getElementByTagName, classList
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    const body = DOMUtils.getElementsByTagName("body")[0];

    if (this.isDarkMode) {
      body.classList.remove(...CSS_CLASSES.lightTheme);
      body.classList.add(...CSS_CLASSES.darkTheme);

      const cards = DOMUtils.getElementsByClassName("bg-white");
      Array.from(cards).forEach((card) => {
        card.classList.remove("bg-white");
        card.classList.add(...CSS_CLASSES.darkCard);

        const headings = card.querySelectorAll(
          "h2.text-gray-800, h3.text-gray-800"
        );
        headings.forEach((heading) => {
          heading.classList.remove("text-gray-800");
          heading.classList.add("text-gray-100");
        });
      });
    } else {
      body.classList.remove(...CSS_CLASSES.darkTheme);
      body.classList.add(...CSS_CLASSES.lightTheme);

      const cards = DOMUtils.getElementsByClassName("bg-gray-800");
      Array.from(cards).forEach((card) => {
        card.classList.remove(...CSS_CLASSES.darkCard);
        card.classList.add("bg-white");

        const headings = card.querySelectorAll(
          "h2.text-gray-100, h3.text-gray-100"
        );
        headings.forEach((heading) => {
          heading.classList.remove("text-gray-100");
          heading.classList.add("text-gray-800");
        });
      });
    }
  }
}

class ScorekeeperApp {
  constructor() {
    this.playerManager = new PlayerManager();
    this.uiManager = new UIManager(this.playerManager);
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.uiManager.updateStats();
    this.initializeUI();
  }

  //disini ada querySelector dan addEventListener
  setupEventListeners() {
    const addPlayerBtn = DOMUtils.querySelector(SELECTORS.addPlayerButton);
    const playerInput = DOMUtils.querySelector(SELECTORS.playerInput);
    const resetScoresBtn = DOMUtils.querySelector(SELECTORS.resetScoreButton);
    const clearAllBtn = DOMUtils.querySelector(SELECTORS.clearAllBtn);
    const toggleThemeBtn = DOMUtils.querySelector(SELECTORS.toggleThemeBtn);

    if (addPlayerBtn) {
      // Tambahkan pengecekan untuk memastikan elemen ada
      addPlayerBtn.addEventListener("click", () => this.handleAddPlayer());
    }
    if (playerInput) {
      playerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleAddPlayer();
      });
    }
    if (resetScoresBtn) {
      // Tambahkan pengecekan
      resetScoresBtn.addEventListener("click", () =>
        this.uiManager.resetAllScoresUI()
      );
    }
    if (clearAllBtn) {
      // Tambahkan pengecekan
      clearAllBtn.addEventListener("click", () =>
        this.uiManager.clearAllPlayersUI()
      );
    }
    if (toggleThemeBtn) {
      // Tambahkan pengecekan
      toggleThemeBtn.addEventListener("click", () =>
        this.uiManager.toggleTheme()
      );
    }
  }

  // ada querySelector dan textContent
  handleAddPlayer() {
    const input = DOMUtils.querySelector(SELECTORS.playerInput);
    const name = input.value;

    if (!name.trim()) {
      alert("Nama pemain tidak boleh kosong!");
      return;
    }

    const player = this.playerManager.addPlayer(name);
    input.value = "";
    this.uiManager.renderPlayer(player);
    this.uiManager.updateStats();
  }

  initializeUI() {
    const title = DOMUtils.getElementById("main-title");
    DOMUtils.setTextContent(title, "Score Keeper App");
  }
}

// Initialize the APP !!!
document.addEventListener("DOMContentLoaded", () => {
  // Initialize main application
  new ScorekeeperApp();

  // ========== FITUR DOM: createElement, innerHTML, append ==========
  const footer = DOMUtils.createElement("footer");
  DOMUtils.setInnerHTML(
    footer,
    `
        <div class="text-center py-8 text-gray-600">
            <p>OTI ACAD GACORRR!</p>
        </div>
    `
  );

  const body = DOMUtils.querySelector("body");
  DOMUtils.append(body, footer);
});

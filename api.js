// ============================================
// SUPER LEAGUE SOCCER - API PLACEHOLDER
// ============================================
//
// IMPORTANT:
// Do NOT put an API key directly into this file
// when the project is public on GitHub.
//
// A public browser game can expose JavaScript
// and any API key placed inside it.
//
// This file is prepared for a future secure
// backend/API connection.

const API = {

  enabled: false,

  // Change this later if you add a secure backend.
  baseURL: "",

  async getTeams() {
    if (!this.enabled || !this.baseURL) {
      return CONFIG.premierLeagueTeams;
    }

    try {
      const response = await fetch(
        `${this.baseURL}/teams`
      );

      if (!response.ok) {
        throw new Error("Could not load teams.");
      }

      return await response.json();

    } catch (error) {
      console.error("API error:", error);

      return CONFIG.premierLeagueTeams;
    }
  },

  async getPlayers(team) {
    if (!this.enabled || !this.baseURL) {
      return getPlayersFromTeam(team);
    }

    try {
      const response = await fetch(
        `${this.baseURL}/players?team=${encodeURIComponent(team)}`
      );

      if (!response.ok) {
        throw new Error("Could not load players.");
      }

      return await response.json();

    } catch (error) {
      console.error("API error:", error);

      return getPlayersFromTeam(team);
    }
  }

};

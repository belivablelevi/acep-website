// Leaderboard Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const rankingsBody = document.getElementById('rankingsBody');
  const filterButtons = document.querySelectorAll('.leaderboard-filters .filter-btn');
  
  let currentPeriod = 'all-time';
  let leaderboardData = [];

  // Load leaderboard
  function loadLeaderboard() {
    leaderboardData = StorageManager.getLeaderboard();
    renderLeaderboard();
    renderPodium();
    renderCategoryLeaders();
    renderYourRank();
  }

  // Filter functionality
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentPeriod = this.dataset.period;
      // For demo purposes, we'll just reload the same data
      // In production, you'd filter by date
      loadLeaderboard();
    });
  });

  // Render podium (top 3)
  function renderPodium() {
    if (leaderboardData.length === 0) return;

    const firstPlace = document.getElementById('firstPlace');
    const secondPlace = document.getElementById('secondPlace');
    const thirdPlace = document.getElementById('thirdPlace');

    if (leaderboardData[0]) {
      firstPlace.querySelector('.podium-name').textContent = leaderboardData[0].name;
      firstPlace.querySelector('.podium-points').textContent = `${leaderboardData[0].points.toLocaleString()} pts`;
      firstPlace.querySelector('.podium-avatar').innerHTML = `
        <div style="font-size: 1.5rem;">${leaderboardData[0].name[0]}</div>
      `;
    }

    if (leaderboardData[1]) {
      secondPlace.querySelector('.podium-name').textContent = leaderboardData[1].name;
      secondPlace.querySelector('.podium-points').textContent = `${leaderboardData[1].points.toLocaleString()} pts`;
      secondPlace.querySelector('.podium-avatar').innerHTML = `
        <div style="font-size: 1.25rem;">${leaderboardData[1].name[0]}</div>
      `;
    }

    if (leaderboardData[2]) {
      thirdPlace.querySelector('.podium-name').textContent = leaderboardData[2].name;
      thirdPlace.querySelector('.podium-points').textContent = `${leaderboardData[2].points.toLocaleString()} pts`;
      thirdPlace.querySelector('.podium-avatar').innerHTML = `
        <div style="font-size: 1.25rem;">${leaderboardData[2].name[0]}</div>
      `;
    }
  }

  // Render full leaderboard table
  function renderLeaderboard() {
    if (leaderboardData.length === 0) {
      rankingsBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
            No rankings data available.
          </td>
        </tr>
      `;
      return;
    }

    rankingsBody.innerHTML = leaderboardData.map((user, index) => {
      const rank = index + 1;
      return `
        <tr>
          <td>
            <span class="rank-badge" style="background: ${rank <= 3 ? '#f59e0b' : rank <= 10 ? '#059669' : '#6b7280'};">
              #${rank}
            </span>
          </td>
          <td>
            <div class="user-info">
              <div class="user-avatar">${user.name[0]}</div>
              <span style="font-weight: 600;">${user.name}</span>
            </div>
          </td>
          <td style="font-weight: 700; color: #059669;">${user.points.toLocaleString()}</td>
          <td>${user.challengesCompleted}</td>
          <td class="badge-icon">${user.badge}</td>
        </tr>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Render category leaders
  function renderCategoryLeaders() {
    const categories = ['industrial', 'wastewater', 'harmful', 'eutrophication'];
    
    categories.forEach(category => {
      const leader = leaderboardData.reduce((max, user) => {
        return user.categoryPoints[category] > (max.categoryPoints[category] || 0) ? user : max;
      }, leaderboardData[0]);

      if (leader) {
        const leaderNameEl = document.getElementById(`${category}Leader`);
        const leaderPointsEl = document.getElementById(`${category}Points`);
        
        if (leaderNameEl && leaderPointsEl) {
          leaderNameEl.textContent = leader.name;
          leaderPointsEl.textContent = `${leader.categoryPoints[category].toLocaleString()} pts`;
        }
      }
    });
  }

  // Render user's rank
  function renderYourRank() {
    const user = StorageManager.getUser();
    const userRank = leaderboardData.findIndex(u => u.name === user.name) + 1;
    
    const yourRank = document.getElementById('yourRank');
    const yourPoints = document.getElementById('yourPoints');
    const pointsToNext = document.getElementById('pointsToNext');

    if (userRank > 0) {
      yourRank.textContent = `#${userRank}`;
      yourPoints.textContent = user.points.toLocaleString();

      if (userRank > 1 && leaderboardData[userRank - 2]) {
        const nextRankPoints = leaderboardData[userRank - 2].points;
        const difference = nextRankPoints - user.points;
        pointsToNext.textContent = `${difference} pts`;
      } else if (userRank === 1) {
        pointsToNext.textContent = '🏆 #1!';
      } else {
        pointsToNext.textContent = '-';
      }
    } else {
      yourRank.textContent = 'Not Ranked';
      yourPoints.textContent = user.points.toLocaleString();
      pointsToNext.textContent = '-';
    }
  }

  // Initialize
  loadLeaderboard();

  // Refresh leaderboard every 30 seconds (in case of updates)
  setInterval(loadLeaderboard, 30000);
});

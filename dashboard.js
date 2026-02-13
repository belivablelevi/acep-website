// Dashboard Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const userName = document.getElementById('userName');
  const totalPoints = document.getElementById('totalPoints');
  const challengesCompleted = document.getElementById('challengesCompleted');
  const globalRank = document.getElementById('globalRank');
  const currentBadge = document.getElementById('currentBadge');
  const levelProgress = document.getElementById('levelProgress');
  const levelProgressBar = document.getElementById('levelProgressBar');
  const badgesGrid = document.getElementById('badgesGrid');
  const activeChallengesList = document.getElementById('activeChallengesList');
  const activityFeed = document.getElementById('activityFeed');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const profileForm = document.getElementById('profileForm');

  let user = {};

  // Load dashboard data
  function loadDashboard() {
    user = StorageManager.getUser();
    const leaderboard = StorageManager.getLeaderboard();
    const challenges = StorageManager.getChallenges();

    // Update header
    userName.textContent = user.name;

    // Update stats
    totalPoints.textContent = user.points.toLocaleString();
    challengesCompleted.textContent = user.challengesCompleted;
    
    const userRank = leaderboard.findIndex(u => u.name === user.name) + 1;
    globalRank.textContent = userRank > 0 ? `#${userRank}` : 'Unranked';
    
    const badge = StorageManager.getBadge(user.points);
    currentBadge.textContent = badge;

    // Update progress bar
    const currentLevel = Math.floor(user.points / 100);
    const nextLevelPoints = (currentLevel + 1) * 100;
    const currentLevelPoints = currentLevel * 100;
    const progressPoints = user.points - currentLevelPoints;
    const progressPercent = (progressPoints / 100) * 100;
    
    levelProgress.textContent = `${progressPoints}/100 XP`;
    levelProgressBar.style.width = `${progressPercent}%`;

    // Update category breakdown
    updateCategoryBreakdown();

    // Render badges
    renderBadges();

    // Render active challenges
    renderActiveChallenges(challenges);

    // Render activity feed
    renderActivityFeed();
  }

  // Update category breakdown
  function updateCategoryBreakdown() {
    const categories = ['industrial', 'wastewater', 'harmful', 'eutrophication', 'pollution'];
    const maxPoints = Math.max(...Object.values(user.categoryPoints), 1);

    categories.forEach(category => {
      const points = user.categoryPoints[category];
      const percentage = (points / maxPoints) * 100;
      
      const pointsEl = document.getElementById(`${category}Points`);
      const barEl = document.getElementById(`${category}Bar`);
      
      if (pointsEl && barEl) {
        pointsEl.textContent = `${points} pts`;
        barEl.style.width = `${percentage}%`;
      }
    });
  }

  // Render badges
  function renderBadges() {
    const allBadges = [
      { id: 'first_challenge', name: 'First Steps', emoji: '🌱', requirement: user.challengesCompleted >= 1 },
      { id: 'five_challenges', name: 'Committed', emoji: '🌿', requirement: user.challengesCompleted >= 5 },
      { id: 'ten_challenges', name: 'Dedicated', emoji: '🌳', requirement: user.challengesCompleted >= 10 },
      { id: 'points_500', name: 'Rising Star', emoji: '⭐', requirement: user.points >= 500 },
      { id: 'points_1000', name: 'Champion', emoji: '🏅', requirement: user.points >= 1000 },
      { id: 'points_2500', name: 'Hero', emoji: '🦸', requirement: user.points >= 2500 },
      { id: 'industrial_master', name: 'Industry Expert', emoji: '🏭', requirement: user.categoryPoints.industrial >= 500 },
      { id: 'water_warrior', name: 'Water Warrior', emoji: '💧', requirement: user.categoryPoints.wastewater >= 500 }
    ];

    badgesGrid.innerHTML = allBadges.map(badge => {
      const earned = user.badges.includes(badge.id) || badge.requirement;
      return `
        <div class="badge-item ${earned ? 'earned' : ''}">
          <div class="badge-emoji">${badge.emoji}</div>
          <div class="badge-name">${badge.name}</div>
        </div>
      `;
    }).join('');
  }

  // Render active challenges
  function renderActiveChallenges(challenges) {
    const activeChallenges = challenges.filter(c => user.activeChallenges.includes(c.id));

    if (activeChallenges.length === 0) {
      activeChallengesList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
          <p>No active challenges.</p>
          <a href="challenges.html" class="btn-link" style="margin-top: 0.5rem; display: inline-block;">
            Browse Challenges →
          </a>
        </div>
      `;
      return;
    }

    activeChallengesList.innerHTML = activeChallenges.map(challenge => {
      const categoryIcons = {
        industrial: 'factory',
        wastewater: 'droplets',
        harmful: 'flask-conical',
        eutrophication: 'waves',
        pollution: 'trash-2'
      };

      return `
        <div class="active-challenge-item">
          <h4 style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="${categoryIcons[challenge.category]}" width="20" height="20"></i>
            ${challenge.title}
          </h4>
          <div class="active-challenge-meta">
            <span><i data-lucide="award" width="14" height="14"></i> ${challenge.points} pts</span>
            <span><i data-lucide="clock" width="14" height="14"></i> ${challenge.duration}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 30%"></div>
          </div>
          <div style="margin-top: 0.75rem;">
            <a href="challenges.html" class="btn-link">Continue →</a>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Render activity feed
  function renderActivityFeed() {
    if (!user.activityHistory || user.activityHistory.length === 0) {
      activityFeed.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
          <p>No recent activity.</p>
        </div>
      `;
      return;
    }

    const recentActivity = user.activityHistory.slice(0, 10);

    activityFeed.innerHTML = recentActivity.map(activity => {
      const iconColors = {
        trophy: '#f59e0b',
        target: '#3b82f6',
        award: '#10b981',
        star: '#8b5cf6'
      };

      const icon = activity.icon || 'activity';
      const color = iconColors[icon] || '#6b7280';

      const activityDate = new Date(activity.time);
      const timeAgo = getTimeAgo(activityDate);

      return `
        <div class="activity-item">
          <div class="activity-icon" style="background: ${color}20; color: ${color};">
            <i data-lucide="${icon}" width="20" height="20"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            ${activity.points ? `<div style="color: #059669; font-weight: 600; font-size: 0.875rem;">+${activity.points} points</div>` : ''}
            <div class="activity-time">${timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Get time ago string
  function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  // Edit profile modal
  editProfileBtn.addEventListener('click', function() {
    document.getElementById('displayName').value = user.name;
    document.getElementById('location').value = user.location || '';
    document.getElementById('bio').value = user.bio || '';
    profileModal.classList.add('show');
    
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 10);
  });

  closeProfileModal.addEventListener('click', function() {
    profileModal.classList.remove('show');
  });

  profileModal.addEventListener('click', function(e) {
    if (e.target === profileModal) {
      profileModal.classList.remove('show');
    }
  });

  // Save profile
  profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    user.name = document.getElementById('displayName').value;
    user.location = document.getElementById('location').value;
    user.bio = document.getElementById('bio').value;
    
    StorageManager.saveUser(user);
    StorageManager.updateLeaderboard(user);
    
    profileModal.classList.remove('show');
    loadDashboard();
    
    showNotification('Profile updated successfully! ✅', 'success');
  });

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#3b82f6'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize
  loadDashboard();

  // Refresh dashboard every 30 seconds
  setInterval(loadDashboard, 30000);
});

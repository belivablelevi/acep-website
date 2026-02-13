// Challenges Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const challengesGrid = document.getElementById('challengesGrid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('challengeModal');
  const closeModal = document.getElementById('closeModal');
  
  let currentFilter = 'all';
  let challenges = [];

  // Load challenges
  function loadChallenges() {
    challenges = StorageManager.getChallenges();
    renderChallenges(currentFilter);
  }

  // Render challenges based on filter
  function renderChallenges(filter) {
    const filteredChallenges = filter === 'all' 
      ? challenges 
      : challenges.filter(c => c.category === filter);

    if (filteredChallenges.length === 0) {
      challengesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #6b7280;">
          <i data-lucide="inbox" style="width: 64px; height: 64px; margin-bottom: 1rem; color: #d1d5db;"></i>
          <p style="font-size: 1.125rem;">No challenges found in this category.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    challengesGrid.innerHTML = filteredChallenges.map(challenge => {
      const categoryColors = {
        industrial: '#ef4444',
        wastewater: '#3b82f6',
        harmful: '#8b5cf6',
        eutrophication: '#10b981',
        pollution: '#f59e0b'
      };

      const user = StorageManager.getUser();
      const isActive = user.activeChallenges.includes(challenge.id);
      const isCompleted = user.completedChallenges.includes(challenge.id);

      return `
        <div class="challenge-card" data-id="${challenge.id}">
          <div class="challenge-header" style="background: linear-gradient(135deg, ${categoryColors[challenge.category]}, ${categoryColors[challenge.category]}dd);">
            <span class="challenge-category">${challenge.category.toUpperCase()}</span>
            <h3>${challenge.title}</h3>
            <div class="challenge-points">
              <i data-lucide="award" width="20" height="20"></i>
              <span>${challenge.points} Points</span>
            </div>
          </div>
          <div class="challenge-body">
            <p class="challenge-description">${challenge.description}</p>
            <div class="challenge-meta">
              <span><i data-lucide="clock" width="16" height="16"></i> ${challenge.duration}</span>
              <span><i data-lucide="users" width="16" height="16"></i> ${challenge.participants} participating</span>
            </div>
            <div class="challenge-meta">
              <span><i data-lucide="signal" width="16" height="16"></i> ${challenge.difficulty}</span>
            </div>
            ${isActive ? `
              <div class="challenge-progress">
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.25rem;">
                  <span>In Progress</span>
                  <span>0%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 0%"></div>
                </div>
              </div>
            ` : ''}
            <div class="challenge-actions">
              ${!isCompleted && !isActive ? `
                <button class="btn-challenge btn-accept" onclick="acceptChallenge('${challenge.id}')">
                  Accept Challenge
                </button>
              ` : ''}
              ${isActive ? `
                <button class="btn-challenge btn-accept" onclick="completeChallenge('${challenge.id}')">
                  Complete Challenge
                </button>
              ` : ''}
              ${isCompleted ? `
                <button class="btn-challenge" style="background: #10b981; color: white;" disabled>
                  <i data-lucide="check" width="16" height="16"></i> Completed
                </button>
              ` : ''}
              <button class="btn-challenge btn-view" onclick="viewChallenge('${challenge.id}')">
                View Details
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Filter functionality
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.category;
      renderChallenges(currentFilter);
    });
  });

  // Accept challenge
  window.acceptChallenge = function(challengeId) {
    const user = StorageManager.getUser();
    if (!user.activeChallenges.includes(challengeId)) {
      user.activeChallenges.push(challengeId);
      
      // Add activity
      const challenge = challenges.find(c => c.id === challengeId);
      user.activityHistory.unshift({
        type: 'challenge_accepted',
        title: `Accepted "${challenge.title}"`,
        time: new Date().toISOString(),
        icon: 'target'
      });
      
      StorageManager.saveUser(user);
      renderChallenges(currentFilter);
      
      // Show success message
      showNotification('Challenge accepted! Good luck! 🎯');
    }
  };

  // Complete challenge
  window.completeChallenge = function(challengeId) {
    const user = StorageManager.getUser();
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (user.activeChallenges.includes(challengeId)) {
      // Remove from active
      user.activeChallenges = user.activeChallenges.filter(id => id !== challengeId);
      
      // Add to completed
      user.completedChallenges.push(challengeId);
      user.challengesCompleted++;
      
      // Add points
      StorageManager.addPoints(challenge.category, challenge.points);
      
      // Add activity
      user.activityHistory.unshift({
        type: 'challenge_completed',
        title: `Completed "${challenge.title}"`,
        points: challenge.points,
        time: new Date().toISOString(),
        icon: 'trophy'
      });
      
      // Check for new badges
      checkBadges(user);
      
      StorageManager.saveUser(user);
      renderChallenges(currentFilter);
      
      // Show success message
      showNotification(`🎉 Challenge completed! You earned ${challenge.points} points!`, 'success');
    }
  };

  // View challenge details
  window.viewChallenge = function(challengeId) {
    const challenge = challenges.find(c => c.id === challengeId);
    const categoryColors = {
      industrial: '#ef4444',
      wastewater: '#3b82f6',
      harmful: '#8b5cf6',
      eutrophication: '#10b981',
      pollution: '#f59e0b'
    };

    const user = StorageManager.getUser();
    const isActive = user.activeChallenges.includes(challenge.id);
    const isCompleted = user.completedChallenges.includes(challenge.id);

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <div style="background: linear-gradient(135deg, ${categoryColors[challenge.category]}, ${categoryColors[challenge.category]}dd); padding: 2rem; margin: -2rem -2rem 2rem; border-radius: 16px 16px 0 0; color: white;">
        <span style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(255,255,255,0.2); border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">
          ${challenge.category.toUpperCase()}
        </span>
        <h2 style="margin-bottom: 1rem; font-size: 1.75rem;">${challenge.title}</h2>
        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="award" width="20" height="20"></i>
            <span>${challenge.points} Points</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="clock" width="20" height="20"></i>
            <span>${challenge.duration}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="signal" width="20" height="20"></i>
            <span>${challenge.difficulty}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="users" width="20" height="20"></i>
            <span>${challenge.participants} participating</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 0.75rem; color: #111827;">Description</h3>
        <p style="color: #6b7280; line-height: 1.7;">${challenge.description}</p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 0.75rem; color: #111827;">Requirements</h3>
        <ul style="list-style: none; padding: 0;">
          ${challenge.requirements.map(req => `
            <li style="display: flex; align-items: start; gap: 0.75rem; margin-bottom: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 8px;">
              <i data-lucide="check-circle" width="20" height="20" style="color: #10b981; flex-shrink: 0; margin-top: 0.125rem;"></i>
              <span style="color: #4b5563;">${req}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        ${!isCompleted && !isActive ? `
          <button class="btn btn-primary" style="flex: 1;" onclick="acceptChallenge('${challenge.id}'); closeModalFunc();">
            Accept Challenge
          </button>
        ` : ''}
        ${isActive ? `
          <button class="btn btn-primary" style="flex: 1;" onclick="completeChallenge('${challenge.id}'); closeModalFunc();">
            Complete Challenge
          </button>
        ` : ''}
        ${isCompleted ? `
          <div style="flex: 1; padding: 1rem; background: #d1fae5; border-radius: 8px; text-align: center; color: #059669; font-weight: 700;">
            <i data-lucide="check-circle" width="20" height="20"></i> Challenge Completed
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.add('show');
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  };

  // Close modal
  window.closeModalFunc = function() {
    modal.classList.remove('show');
  };

  closeModal.addEventListener('click', closeModalFunc);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModalFunc();
    }
  });

  // Check and award badges
  function checkBadges(user) {
    const badges = [
      { id: 'first_challenge', name: 'First Steps', emoji: '🌱', requirement: user.challengesCompleted >= 1 },
      { id: 'five_challenges', name: 'Committed', emoji: '🌿', requirement: user.challengesCompleted >= 5 },
      { id: 'ten_challenges', name: 'Dedicated', emoji: '🌳', requirement: user.challengesCompleted >= 10 },
      { id: 'points_500', name: 'Rising Star', emoji: '⭐', requirement: user.points >= 500 },
      { id: 'points_1000', name: 'Champion', emoji: '🏅', requirement: user.points >= 1000 },
      { id: 'points_2500', name: 'Hero', emoji: '🦸', requirement: user.points >= 2500 }
    ];

    badges.forEach(badge => {
      if (badge.requirement && !user.badges.includes(badge.id)) {
        user.badges.push(badge.id);
        showNotification(`🎖️ New badge unlocked: ${badge.emoji} ${badge.name}!`, 'success');
      }
    });
  }

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
  loadChallenges();
});

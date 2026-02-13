// Main JavaScript for ACEP Website
// Common functionality across all pages

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Parallax effect for hero content
  const heroContent = document.getElementById('heroContent');
  if (heroContent) {
    function onScroll() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const scrolled = window.scrollY;
      const offset = Math.min(scrolled * 0.12, 60);
      heroContent.style.transform = `translateY(${offset}px)`;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Video compatibility handling
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    heroVideo.addEventListener('error', function() {
      console.log('Video failed to load, using fallback background image');
      heroVideo.style.display = 'none';
    });
    
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay prevented, using fallback background image');
        heroVideo.style.display = 'none';
      });
    }
  }

  // Animated counter for stats
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length > 0) {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    statNumbers.forEach(stat => observer.observe(stat));
  }

  function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    updateCounter();
  }
});

// Local Storage Manager
const StorageManager = {
  // Get user data
  getUser: function() {
    const userData = localStorage.getItem('acep_user');
    return userData ? JSON.parse(userData) : this.createDefaultUser();
  },

  // Create default user if none exists
  createDefaultUser: function() {
    const defaultUser = {
      name: 'Environmental Champion',
      email: '',
      location: '',
      bio: '',
      points: 0,
      rank: 0,
      challengesCompleted: 0,
      activeChallenges: [],
      completedChallenges: [],
      categoryPoints: {
        industrial: 0,
        wastewater: 0,
        harmful: 0,
        eutrophication: 0,
        pollution: 0
      },
      badges: [],
      activityHistory: [],
      joinDate: new Date().toISOString()
    };
    this.saveUser(defaultUser);
    return defaultUser;
  },

  // Save user data
  saveUser: function(userData) {
    localStorage.setItem('acep_user', JSON.stringify(userData));
  },

  // Get all challenges
  getChallenges: function() {
    const challenges = localStorage.getItem('acep_challenges');
    return challenges ? JSON.parse(challenges) : this.createDefaultChallenges();
  },

  // Create default challenges
  createDefaultChallenges: function() {
    const challenges = [
      {
        id: 'c1',
        title: 'Industrial Runoff Reporter',
        category: 'industrial',
        description: 'Identify and report industrial pollution sources in your area. Document discharge points and notify authorities.',
        points: 150,
        difficulty: 'Medium',
        duration: '1 week',
        participants: 234,
        requirements: ['Take photos', 'Note location', 'Report to authorities'],
        status: 'available'
      },
      {
        id: 'c2',
        title: 'Water Quality Tester',
        category: 'wastewater',
        description: 'Test local water sources for pollution indicators. Use test strips or kits to measure pH, nitrates, and other contaminants.',
        points: 200,
        difficulty: 'Hard',
        duration: '2 weeks',
        participants: 156,
        requirements: ['Obtain test kit', 'Test 3+ locations', 'Submit results'],
        status: 'available'
      },
      {
        id: 'c3',
        title: 'Hazardous Waste Hunter',
        category: 'harmful',
        description: 'Locate and properly dispose of hazardous waste in your community. Partner with local disposal facilities.',
        points: 175,
        difficulty: 'Medium',
        duration: '1 week',
        participants: 189,
        requirements: ['Identify hazardous materials', 'Coordinate with disposal center', 'Document disposal'],
        status: 'available'
      },
      {
        id: 'c4',
        title: 'Algae Bloom Monitor',
        category: 'eutrophication',
        description: 'Monitor local water bodies for signs of eutrophication. Report algae blooms and help prevent nutrient pollution.',
        points: 125,
        difficulty: 'Easy',
        duration: '3 days',
        participants: 312,
        requirements: ['Visit water body', 'Photo documentation', 'Submit report'],
        status: 'available'
      },
      {
        id: 'c5',
        title: 'Storm Drain Steward',
        category: 'pollution',
        description: 'Mark storm drains with "No Dumping" signs and educate neighbors about proper waste disposal.',
        points: 100,
        difficulty: 'Easy',
        duration: '2 days',
        participants: 567,
        requirements: ['Create or obtain signs', 'Mark 10+ drains', 'Document outreach'],
        status: 'available'
      },
      {
        id: 'c6',
        title: 'Agricultural Runoff Reducer',
        category: 'industrial',
        description: 'Work with local farms to implement buffer zones and reduce pesticide runoff into water systems.',
        points: 250,
        difficulty: 'Hard',
        duration: '3 weeks',
        participants: 87,
        requirements: ['Contact farm owners', 'Create plan', 'Implement buffer zone'],
        status: 'available'
      },
      {
        id: 'c7',
        title: 'Plastic Pollution Tracker',
        category: 'pollution',
        description: 'Conduct a microplastic survey in local waterways. Collect samples and analyze pollution levels.',
        points: 180,
        difficulty: 'Medium',
        duration: '10 days',
        participants: 203,
        requirements: ['Collect samples', 'Analyze findings', 'Submit data'],
        status: 'available'
      },
      {
        id: 'c8',
        title: 'Wastewater Education Campaign',
        category: 'wastewater',
        description: 'Create and distribute educational materials about proper wastewater management to your community.',
        points: 130,
        difficulty: 'Medium',
        duration: '1 week',
        participants: 245,
        requirements: ['Create materials', 'Distribute to 50+ homes', 'Document impact'],
        status: 'available'
      },
      {
        id: 'c9',
        title: 'Chemical Spill Response Team',
        category: 'harmful',
        description: 'Join or create a rapid response team for chemical spills. Get trained in safe cleanup procedures.',
        points: 300,
        difficulty: 'Hard',
        duration: '1 month',
        participants: 45,
        requirements: ['Complete training', 'Respond to incident', 'Document process'],
        status: 'available'
      },
      {
        id: 'c10',
        title: 'Nutrient Pollution Preventer',
        category: 'eutrophication',
        description: 'Reduce fertilizer use in your neighborhood. Educate others about eco-friendly lawn care alternatives.',
        points: 140,
        difficulty: 'Easy',
        duration: '1 week',
        participants: 389,
        requirements: ['Create guide', 'Host workshop', 'Track conversions'],
        status: 'available'
      }
    ];
    this.saveChallenges(challenges);
    return challenges;
  },

  // Save challenges
  saveChallenges: function(challenges) {
    localStorage.setItem('acep_challenges', JSON.stringify(challenges));
  },

  // Get leaderboard
  getLeaderboard: function() {
    const leaderboard = localStorage.getItem('acep_leaderboard');
    return leaderboard ? JSON.parse(leaderboard) : this.createDefaultLeaderboard();
  },

  // Create default leaderboard
  createDefaultLeaderboard: function() {
    const leaderboard = [
      { name: 'Yeabsira Russom', points: 3450, challengesCompleted: 23, badge: '🏆', categoryPoints: { industrial: 950, wastewater: 780, harmful: 690, eutrophication: 580, pollution: 450 } },
      { name: 'Deejay Sinclair', points: 3210, challengesCompleted: 21, badge: '🥇', categoryPoints: { industrial: 820, wastewater: 900, harmful: 650, eutrophication: 520, pollution: 320 } },
      { name: 'Roan Martinez', points: 2980, challengesCompleted: 19, badge: '🥈', categoryPoints: { industrial: 750, wastewater: 680, harmful: 720, eutrophication: 490, pollution: 340 } },
      { name: 'Emma Chen', points: 2750, challengesCompleted: 18, badge: '🥉', categoryPoints: { industrial: 670, wastewater: 720, harmful: 580, eutrophication: 450, pollution: 330 } },
      { name: 'Marcus Johnson', points: 2540, challengesCompleted: 17, badge: '⭐', categoryPoints: { industrial: 640, wastewater: 590, harmful: 540, eutrophication: 420, pollution: 350 } },
      { name: 'Sofia Rodriguez', points: 2320, challengesCompleted: 15, badge: '⭐', categoryPoints: { industrial: 580, wastewater: 650, harmful: 490, eutrophication: 380, pollution: 220 } },
      { name: 'Liam O\'Connor', points: 2150, challengesCompleted: 14, badge: '⭐', categoryPoints: { industrial: 550, wastewater: 520, harmful: 470, eutrophication: 360, pollution: 250 } },
      { name: 'Aisha Patel', points: 1980, challengesCompleted: 13, badge: '🌟', categoryPoints: { industrial: 490, wastewater: 480, harmful: 450, eutrophication: 340, pollution: 220 } },
      { name: 'Oliver Kim', points: 1820, challengesCompleted: 12, badge: '🌟', categoryPoints: { industrial: 460, wastewater: 440, harmful: 420, eutrophication: 310, pollution: 190 } },
      { name: 'Isabella Santos', points: 1680, challengesCompleted: 11, badge: '🌟', categoryPoints: { industrial: 430, wastewater: 410, harmful: 390, eutrophication: 290, pollution: 160 } }
    ];
    this.saveLeaderboard(leaderboard);
    return leaderboard;
  },

  // Save leaderboard
  saveLeaderboard: function(leaderboard) {
    localStorage.setItem('acep_leaderboard', JSON.stringify(leaderboard));
  },

  // Add points to user
  addPoints: function(category, points) {
    const user = this.getUser();
    user.points += points;
    user.categoryPoints[category] += points;
    this.saveUser(user);
    this.updateLeaderboard(user);
  },

  // Update leaderboard with user data
  updateLeaderboard: function(user) {
    const leaderboard = this.getLeaderboard();
    const userIndex = leaderboard.findIndex(u => u.name === user.name);
    
    if (userIndex !== -1) {
      leaderboard[userIndex] = {
        name: user.name,
        points: user.points,
        challengesCompleted: user.challengesCompleted,
        badge: this.getBadge(user.points),
        categoryPoints: user.categoryPoints
      };
    } else {
      leaderboard.push({
        name: user.name,
        points: user.points,
        challengesCompleted: user.challengesCompleted,
        badge: this.getBadge(user.points),
        categoryPoints: user.categoryPoints
      });
    }
    
    leaderboard.sort((a, b) => b.points - a.points);
    this.saveLeaderboard(leaderboard);
  },

  // Get badge based on points
  getBadge: function(points) {
    if (points >= 3000) return '🏆';
    if (points >= 2500) return '🥇';
    if (points >= 2000) return '🥈';
    if (points >= 1500) return '🥉';
    if (points >= 1000) return '⭐';
    if (points >= 500) return '🌟';
    return '🌱';
  }
};

// Export for use in other scripts
window.StorageManager = StorageManager;

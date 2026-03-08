// =============================================
//  BULLDOG WEALTH - Main JS
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // ── 검색 토글 ──────────────────────────────
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');
  const searchInput = document.getElementById('searchInput');

  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', function () {
      searchBar.classList.toggle('open');
      if (searchBar.classList.contains('open')) {
        searchInput && searchInput.focus();
      }
    });
  }

  // ── 모바일 메뉴 ──────────────────────────────
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  // ── 카테고리 필터 ──────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const postCards = document.querySelectorAll('.post-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      postCards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── 전체 검색 데이터 로드 (공통) ──────────────────────────────
  let searchData = [];

  function loadSearchData(callback) {
    if (searchData.length > 0) { callback(); return; }
    // baseurl을 고려한 경로
    const basePath = (window.location.pathname.match(/^(\/[^/]+)/) || [''])[0];
    const searchUrl = (basePath && basePath !== '/') ? basePath + '/search.json' : '/search.json';
    fetch(searchUrl)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        searchData = data;
        callback();
      })
      .catch(function() {
        // fallback: root에서 재시도
        fetch('/search.json')
          .then(function(res) { return res.json(); })
          .then(function(data) { searchData = data; callback(); })
          .catch(function() { console.log('Search data load failed'); });
      });
  }

  function renderResults(results, container) {
    if (!container) return;
    if (results.length === 0) {
      container.innerHTML = '<div class="search-result-item search-no-result">검색 결과가 없습니다</div>';
      return;
    }
    container.innerHTML = results.map(function(post) {
      return '<a href="' + post.url + '" class="search-result-item">'
        + '<span class="search-result-cat">' + (post.category || '') + '</span>'
        + '<div class="search-result-title">' + post.title + '</div>'
        + '</a>';
    }).join('');
  }

  // ── 헤더 검색 ──────────────────────────────
  if (searchInput) {
    loadSearchData(function() {});

    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      const resultsEl = document.getElementById('searchResults');
      if (!resultsEl) return;

      if (query.length < 2) {
        resultsEl.innerHTML = '';
        resultsEl.style.display = 'none';
        return;
      }

      const results = searchData
        .filter(function(post) {
          return post.title.toLowerCase().includes(query) ||
                 (post.content && post.content.toLowerCase().includes(query));
        })
        .slice(0, 6);

      resultsEl.style.display = 'block';
      renderResults(results, resultsEl);
    });

    // 외부 클릭 시 결과 닫기
    document.addEventListener('click', function(e) {
      const resultsEl = document.getElementById('searchResults');
      if (resultsEl && !resultsEl.contains(e.target) && e.target !== searchInput) {
        resultsEl.style.display = 'none';
      }
    });
  }

  // ── 사이드바 검색 ──────────────────────────────
  const sidebarSearch = document.getElementById('sidebarSearch');
  const sidebarResults = document.getElementById('sidebarSearchResults');

  if (sidebarSearch && sidebarResults) {
    loadSearchData(function() {});

    sidebarSearch.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();

      if (query.length < 2) {
        sidebarResults.innerHTML = '';
        sidebarResults.style.display = 'none';
        return;
      }

      loadSearchData(function() {
        const results = searchData
          .filter(function(post) {
            return post.title.toLowerCase().includes(query) ||
                   (post.content && post.content.toLowerCase().includes(query));
          })
          .slice(0, 5);

        sidebarResults.style.display = 'block';
        renderResults(results, sidebarResults);
      });
    });

    // 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
      if (!sidebarSearch.contains(e.target) && !sidebarResults.contains(e.target)) {
        sidebarResults.style.display = 'none';
      }
    });
  }

  // ── 목차(TOC) 자동 생성 ──────────────────────────────
  const tocEl = document.getElementById('toc');
  const postContent = document.querySelector('.post-content');

  if (tocEl && postContent) {
    const headings = postContent.querySelectorAll('h2, h3');

    if (headings.length === 0) {
      tocEl.closest('.toc-box').style.display = 'none';
    } else {
      const tocList = document.createElement('ul');
      tocList.style.cssText = 'list-style:none;padding:0;margin:0;';

      headings.forEach(function (heading, i) {
        const id = 'heading-' + i;
        heading.id = id;

        const li = document.createElement('li');
        li.style.cssText = heading.tagName === 'H3' ? 'padding-left:14px' : '';

        const a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = heading.textContent;
        a.style.cssText = heading.tagName === 'H3' ? 'color:var(--text-muted);font-size:13px' : '';

        li.appendChild(a);
        tocList.appendChild(li);
      });

      tocEl.appendChild(tocList);
    }
  }

  // ── 태그 클라우드 클릭 (사이드바) ──────────────────────────────
  document.addEventListener('click', function (e) {
    var tagLink = e.target.closest('.tag-cloud-item');
    if (!tagLink) return;
    var href = tagLink.getAttribute('href');
    if (href && href.startsWith('/tags/')) {
      // 태그 페이지로 이동 (기본 동작 허용 — 새 페이지 로드)
      return;
    }
  });
  const cards = document.querySelectorAll('.post-card, .featured-post, .widget');

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(function (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(card);
  });

});

// CSS 애니메이션
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

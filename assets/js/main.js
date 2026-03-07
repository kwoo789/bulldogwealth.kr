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

  // ── 검색 기능 (사이드바) ──────────────────────────────
  const sidebarSearch = document.getElementById('sidebarSearch');

  if (sidebarSearch) {
    sidebarSearch.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      if (query.length < 2) return;
      // Jekyll 검색 데이터가 있을 경우 여기서 필터링
    });
  }

  // ── 전체 검색 (search.json 기반) ──────────────────────────────
  let searchData = [];

  async function loadSearchData() {
    try {
      const res = await fetch('/search.json');
      searchData = await res.json();
    } catch (e) {
      console.log('Search data not loaded yet');
    }
  }

  if (searchInput) {
    loadSearchData();

    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      const resultsEl = document.getElementById('searchResults');
      if (!resultsEl) return;

      if (query.length < 2) {
        resultsEl.innerHTML = '';
        return;
      }

      const results = searchData
        .filter(post =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
        )
        .slice(0, 5);

      if (results.length === 0) {
        resultsEl.innerHTML = '<div class="search-result-item" style="color:var(--text-muted)">검색 결과가 없습니다</div>';
        return;
      }

      resultsEl.innerHTML = results.map(post => `
        <a href="${post.url}" class="search-result-item" style="display:block">
          <span style="color:var(--accent);font-size:11px;font-weight:700">${post.category || ''}</span>
          <div style="font-size:14px;margin-top:2px">${post.title}</div>
        </a>
      `).join('');
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

  // ── 스크롤 페이드인 ──────────────────────────────
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

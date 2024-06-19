addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch('https://raw.githubusercontent.com/196180/some-stars/main/data.json');
  const data = await response.json();
  const html = generateHTML(data);
  return new Response(html, { headers: { 'content-type': 'text/html' } });
}

function generateHTML(data) {
  const repoCardsHtml = (repos) => repos.map(repo => `
    <div class="repo-card bg-white rounded-lg shadow-md p-4 mb-4 dark:bg-gray-800">
      <h3 class="text-xl font-bold mb-2">
        <a href="${repo.url}" target="_blank" class="text-blue-500 hover:underline dark:text-blue-300">${repo.name}</a>
      </h3>
      <p class="text-gray-600 dark:text-gray-400">${repo.description}</p>
      <div class="mt-4 flex items-center justify-between">
        <div>
          ${repo.topics.map(topic => `<span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 dark:bg-gray-700 dark:text-gray-300">${topic}</span>`).join('')}
        </div>
        <div>
          <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 dark:bg-gray-700 dark:text-gray-300">${repo.stars} stars</span>
          <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">${repo.forks} forks</span>
        </div>
      </div>
    </div>
  `).join('');

  const categoriesHtml = Object.entries(data).map(([language, repos]) => `
    <div id="${language}" class="mb-8">
      <h2 class="text-2xl font-bold mb-4 dark:text-white">${language}</h2>
      <div class="flex flex-wrap -mx-4">${repoCardsHtml(repos)}</div>
    </div>
  `).join('');

  const sidebarLinks = Object.keys(data).map(language => `
    <li class="mb-2"><a href="#${language}" class="text-blue-500 hover:underline dark:text-blue-300">${language}</a></li>`).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>XNIC github Star 导航</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
        .container {
          margin-left: auto;
          margin-right: auto;
          max-width: 1380px;
          padding-left: 20px;
          padding-right: 20px;
          overflow-x: hidden;
        }
        .repo-card {
          flex-basis: calc(25% - 1rem);
          min-width: 300px;
        }
        @media (max-width: 1024px) {
          .repo-card {
            flex-basis: calc(50% - 1rem);
          }
        }
        @media (max-width: 640px) {
          .repo-card {
            flex-basis: calc(100% - 1rem);
          }
        }
        .highlight {
          background-color: yellow;
        }
        .sticky-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          background-color: white;
        }
        #sidebar {
          position: fixed;
          top: 80px;
          left: 80px;
          bottom: 0;
          overflow-y: auto;
          width: 200px;
        }
        #main-content {
          margin-left: 300px;
        }
        #back-to-top {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #1a202c;
          color: white;
          padding: 10px 15px;
          border-radius: 50%;
          display: none;
          cursor: pointer;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          transition: opacity 0.3s;
        }
        #back-to-top:hover {
          background-color: #2d3748;
        }
        #theme-toggle {
          position: fixed;
          bottom: 80px;
          right: 20px;
          background-color: #1a202c;
          color: white;
          padding: 10px 15px;
          border-radius: 50%;
          display: block;
          cursor: pointer;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          transition: opacity 0.3s;
        }
        #theme-toggle:hover {
          background-color: #2d3748;
        }
      </style>
    </head>
    <body>
      <div class="sticky-header flex justify-between items-center px-4 py-2 bg-white shadow-md">
        <h1 class="text-2xl font-bold">
          <a href="/">XNIC github Star 导航</a>
        </h1>
        <input id="search" type="text" placeholder="Search repositories..." class="p-2 border rounded w-1/3 mx-auto">
      </div>
      <div class="container mx-auto p-4">
        <div class="flex">
          <div id="sidebar">
            <h2 class="text-xl font-bold mb-4">语言分类</h2>
            <ul>${sidebarLinks}</ul>
          </div>
          <div id="main-content">
            <div id="categories-container">${categoriesHtml}</div>
          </div>
        </div>
      </div>
      <button id="back-to-top">↑</button>
      <button id="theme-toggle">切换背景</button>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const categoriesContainer = document.getElementById('categories-container');
          const searchInput = document.getElementById('search');
          const backToTopButton = document.getElementById('back-to-top');
          const allRepoCards = document.querySelectorAll('.repo-card');
          const themeToggle = document.getElementById('theme-toggle');
          const body = document.body;

          window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
              backToTopButton.style.display = 'block';
            } else {
              backToTopButton.style.display = 'none';
            }
          });

          backToTopButton.addEventListener('click', () => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          });

          searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();

            allRepoCards.forEach(card => {
              const cardText = card.textContent.toLowerCase();
              if (cardText.includes(searchTerm)) {
                card.style.display = 'block';
                highlightText(card, searchTerm);
              } else {
                card.style.display = 'none';
              }
            });
          });

          function highlightText(element, searchTerm) {
            const regex = new RegExp(searchTerm, 'gi');
            element.innerHTML = element.innerHTML.replace(regex, (match) => `<span class="highlight">${match}</span>`);
          }

          async function fetchBackground() {
            try {
              const response = await fetch('https://tuapi.eees.cc/api.php?category=dongman&type=302');
              const data = await response.json();
              const imageUrl = data.url; 

              body.style.backgroundImage = `url(${imageUrl})`;
              body.style.backgroundSize = 'cover'; 
            } catch (error) {
              console.error('获取背景图片失败：', error);
            }
          }

          themeToggle.addEventListener('click', fetchBackground);

          fetchBackground();
        });
      </script>
    </body>
    </html>
  `;
}

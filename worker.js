addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch('https://raw.githubusercontent.com/Nuyoah965/some-stars/refs/heads/main/data.json');   //这里的xxx修改为自己仓库的json raw文件
  const data = await response.json();

  const html = generateHTML(data);

  return new Response(html, {
    headers: { 'content-type': 'text/html' },
  });
}

function generateHTML(data) {
  const repoCardsHtml = (repos, language) => {
    return repos.map((repo) => {
      const truncatedDescription = repo.description && repo.description.length > 200 ? repo.description.slice(0, 200) + '...' : repo.description;
      const topics = repo.topics.map(topic => topic.toLowerCase());
      if (!topics.includes(language.toLowerCase())) {
        topics.push(language.toLowerCase());
      }
      return `
        <div class="repo-card max-w-sm rounded-2xl overflow-hidden shadow-lg m-4 bg-white transition-transform transform hover:scale-105">
          <div class="h-48 overflow-hidden flex items-center justify-center mt-4 rounded-t-2xl">
            <img class="object-contain h-full w-full rounded-t-2xl" src="${repo.owner.avatar_url}">
          </div>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2">
              <a href="${repo.html_url}" class="text-blue-500">${repo.full_name}</a>
            </div>
            <p class="text-gray-700 text-base">${truncatedDescription}</p>
          </div>
          <div class="px-6 pt-4 pb-2">
            ${topics.map(topic => `<span class="topic inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#${topic}</span>`).join('')}
          </div>
          <div class="px-6 pt-4 pb-2">
            <span class="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Stars: ${repo.stargazers_count}</span>
            <span class="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Watchers: ${repo.watchers_count}</span>
          </div>
        </div>`;
    }).join('');
  };

  const categoriesHtml = Object.keys(data).map(language => `
    <div id="${language}" class="mb-8 category">
      <h2 class="text-2xl font-bold mb-4">${language} Repositories</h2>
      <div class="flex flex-wrap justify-center">
        ${repoCardsHtml(data[language], language)}
      </div>
    </div>`).join('');

  const sidebarLinks = Object.keys(data).map(language => `
    <li class="mb-2"><a href="#${language}" class="text-blue-500 hover:underline">${language}</a></li>`).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <link rel="icon" href="https://jerryz.com.cn/favicon.png">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jerry Zhou GitHub Stars 导航</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      
      <style>
        .container {
          margin-left: auto;
          margin-right: auto;
          max-width: 1800px;
          padding-left: 20px;
          padding-right: 20px;
          overflow-x: hidden;
        }
        
        .repo-card {
          flex-basis: calc(25% - 1rem);
          min-width: 300px;
          max-width: 350px;
        }
        #sidebar {
          position: fixed;
          top: 80px;
          left: 20px; /* Adjust left position as needed */
          bottom: 0;
          overflow-y: auto;
          width: 200px;
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
          
          .container{
            padding: 0;
          }
          #main-content {
            margin-left: 0 !important; /* Ensure no margin for main content on mobile */
            padding-left: 8px; /* Add padding to adjust for fixed sidebar */
          }
          #categories-container{
            padding-top:76px;
          }
          .sticky-header h1 {
            display: none; /* Hide header title on mobile */
          }
          #search {
            width: 100%; /* Make search input full width on mobile */
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
        #main-content {
          margin-left: 200px;
        }
       
        #back-to-top {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #1a202c;
          color: white;
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 50%;
          display: none;
          cursor: pointer;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          transition: opacity 0.3s;
        }
        #back-to-top:hover {
          background-color: #2d3748;
        }
        
      </style>
    </head>
    <body class="bg-gray-100">
      <div class="sticky-header flex justify-between items-center px-4 py-2 bg-white shadow-md">
        <h1 class="text-2xl font-bold">
          <a href="https://jerryz.com.cn" class="hidden md:block">Jerry Zhou GitHub Stars 导航</a>
        </h1>
        <input id="search" type="text" placeholder="Search repositories..." class="p-2 border rounded md:w-1/3 w-full mx-auto">
      </div>
      <div class="container mx-auto p-4 py-16">
        <div class="block md:flex">
          <div id="sidebar" class="hidden md:block">
            <h2 class="text-xl font-bold mb-4">语言分类</h2>
            <ul>${sidebarLinks}</ul>
          </div>
          <div id="main-content">
            <div id="categories-container">${categoriesHtml}</div>
          </div>
        </div>
      </div>
      <div class="text-center py-4">
        Copyright © 2024 <a href="https://jerryz.com.cn" class="text-blue-500 hover:underline">Jerry Zhou</a> . All Rights Reserved.
      </div>
      <button id="back-to-top">↑</button>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const searchInput = document.getElementById('search');
          const categoriesContainer = document.getElementById('categories-container');
          const backToTopButton = document.getElementById('back-to-top');
          const data = ${JSON.stringify(data)};

          function repoCardsHtml(repos, language) {
            return repos.map(function(repo) {
              const truncatedDescription = repo.description && repo.description.length > 200 ? repo.description.slice(0, 200) + '...' : repo.description;
              const topics = repo.topics.map(topic => topic.toLowerCase());
              if (!topics.includes(language.toLowerCase())) {
                topics.push(language.toLowerCase());
              }

              return \`
                <div class="repo-card max-w-sm rounded-2xl overflow-hidden shadow-lg m-4 bg-white transition-transform transform hover:scale-105">
                  <div class="h-48 overflow-hidden flex items-center justify-center mt-4 rounded-t-2xl">
                    <img class="object-contain h-full w-full rounded-t-2xl" src="\${repo.owner.avatar_url}">
                  </div>
                  <div class="px-6 py-4">
                    <div class="font-bold text-xl mb-2">
                      <a href="\${repo.html_url}" class="text-blue-500">\${repo.full_name}</a>
                    </div>
                    <p class="text-gray-700 text-base">\${truncatedDescription}</p>
                  </div>
                  <div class="px-6 pt-4 pb-2">
                    \${topics.map(topic => \`<span class="topic inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#\${topic}</span>\`).join('')}
                  </div>
                  <div class="px-6 pt-4 pb-2">
                    <span class="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Stars: \${repo.stargazers_count}</span>
                    <span class="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Watchers: \${repo.watchers_count}</span>
                  </div>
                </div>\`;
            }).join('');
          }

          window.addEventListener('scroll', function() {
            if (window.scrollY > 200) {
              backToTopButton.style.display = 'block';
            } else {
              backToTopButton.style.display = 'none';
            }
          });

          backToTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });

          function highlightText(text, query) {
            const regex = new RegExp('(' + query + ')', 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
          }

          function searchRepositories(query) {
            const normalizedQuery = query.toLowerCase();
            return Object.entries(data).flatMap(([language, repos]) => 
              repos.filter(repo => {
                repo.language = language;
                return repo.full_name.toLowerCase().includes(normalizedQuery) ||
                       (repo.description && repo.description.toLowerCase().includes(normalizedQuery)) ||
                       repo.topics.some(topic => topic.toLowerCase().includes(normalizedQuery));
              })
            );
          }
          
          searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query) {
              const matchedRepos = searchRepositories(query);
              const highlightedHtml = matchedRepos.map(repo => 
                repoCardsHtml([repo], repo.language).replace(new RegExp('(?<=^|>)[^<]*?(' + escapeRegExp(query) + ')(?=<|$)', 'gi'), function(match) {
                  return match.replace(new RegExp(escapeRegExp(query), 'gi'), '<span class="highlight">$&</span>');
                })
              ).join('');
          
              categoriesContainer.innerHTML = '<div class="mb-8"><h2 class="text-2xl font-bold mb-4">Search Results</h2><div class="flex flex-wrap justify-center">' + highlightedHtml + '</div></div>';
            } else {
              const categoriesHtml = Object.keys(data).map(function(language) {
                return '<div id="' + language + '" class="mb-8 category">' +
                  '<h2 class="text-2xl font-bold mb-4">' + language + ' Repositories</h2>' +
                  '<div class="flex flex-wrap justify-center">' +
                    repoCardsHtml(data[language], language) +
                  '</div>' +
                '</div>';
              }).join('');
              
              categoriesContainer.innerHTML = categoriesHtml;
            }
          });
          

          function escapeRegExp(string) {
            return string.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
          }
        });
      </script>
    </body>
    </html>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
  // 从你的仓库获取 JSON 数据
  fetch('https://raw.githubusercontent.com/196180/some-stars/main/data.json')
    .then(response => response.json())
    .then(data => {
      // ... (之前的 JavaScript 代码)
      const sidebarLinksContainer = document.getElementById('sidebar-links');
      const categoriesContainer = document.getElementById('categories-container');

      // 生成侧边栏链接
      sidebarLinksContainer.innerHTML = Object.keys(data).map(language => `
        <li class="mb-2"><a href="#${language}" class="text-blue-500 hover:underline">${language}</a></li>`).join('');

      // 生成初始的分类内容
      let categoriesHtml = '';
      Object.keys(data).forEach(language => {
        categoriesHtml += '<div id="' + language + '" class="mb-8 category">';
        categoriesHtml += '<h2 class="text-2xl font-bold mb-4">' + language + ' Repositories</h2>';
        categoriesHtml += '<div class="flex flex-wrap justify-center">';
        categoriesHtml += repoCardsHtml(data[language]); // 使用 repoCardsHtml 函数
        categoriesHtml += '</div></div>';
      });
      categoriesContainer.innerHTML = categoriesHtml;

      // ... (其他 JavaScript 代码，例如搜索功能)
    });
});

// repoCardsHtml 函数定义
function repoCardsHtml(repos) {
  // ... (函数代码，如步骤 1 所示)
}

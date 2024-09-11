const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>幽梦导航</title>
<style>
body {
    font-family: Arial, sans-serif;
    background-color: #f0f4f8; /* 浅灰蓝色背景 */
    margin: 0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: background-color 0.3s ease;
}

.card-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
}

.card {
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #ffffff; /* 白色卡片背景 */
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 柔和的浅灰色阴影 */
    cursor: grab;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    width: 200px;
    height: auto;
}

.card.dragging {
    opacity: 0.8;
    transform: scale(1.05);
    cursor: grabbing;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* 加深悬停时的阴影 */
}

.card-title {
    font-size: 16px;
    font-weight: bold;
    color: #212529; /* 深灰色文字 */
}

.card-url {
    color: #6c757d; /* 中性灰色 */
    font-size: 12px;
    word-break: break-all;
}

.delete-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #dc3545; /* 红色删除按钮 */
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    text-align: center;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    display: none;
}

.admin-controls {
    position: fixed;
    top: 10px;
    right: 10px;
    font-size: 60%;
}

.admin-controls input {
    padding: 5px;
    font-size: 60%;
}

.admin-controls button {
    padding: 5px 10px;
    font-size: 60%;
    margin-left: 10px;
    background-color: #007bff; /* 蓝色按钮 */
    color: white;
    border: none;
    border-radius: 5px;
}

.add-remove-controls {
    display: none;
    margin-top: 10px;
}

.round-btn {
    background-color: #17a2b8; /* 青色按钮 */
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: 24px;
    line-height: 40px;
    cursor: pointer;
    margin: 0 10px;
}

#theme-toggle {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background-color: #007bff; /* 蓝色主题切换按钮 */
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: 24px;
    line-height: 40px;
    cursor: pointer;
}

#dialog-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
}

#dialog-box {
    background: #ffffff; /* 对话框背景白色 */
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

#dialog-box label {
    display: block;
    margin-bottom: 5px;
    color: #212529; /* 深灰色文字 */
}

#dialog-box input, #dialog-box select {
    width: 100%;
    padding: 5px;
    margin-bottom: 10px;
    background-color: #f8f9fa; /* 非常浅的灰色输入框 */
    color: #212529; /* 深灰色文字 */
}

#dialog-box button {
    padding: 5px 10px;
    margin-right: 10px;
    background-color: #007bff; /* 蓝色按钮 */
    color: white;
    border: none;
    border-radius: 5px;
}

.section {
    margin-bottom: 20px;
}

.section-title {
    font-size: 24px;
    font-weight: bold;
    color: #333; /* 深灰色文字 */
    margin-bottom: 10px;
}
</style>
</head>
<body>
<h1>幽梦导航</h1>

<div class="admin-controls">
<input type="password" id="admin-password" placeholder="输入密码">
<button id="admin-mode-btn" onclick="toggleAdminMode()">进入管理模式</button>
</div>

<div class="add-remove-controls">
<button class="round-btn" onclick="showAddDialog()">+</button>
<button class="round-btn" onclick="toggleRemoveMode()">-</button>
</div>

<div id="sections-container">
<!-- 分类将在这里动态生成 -->
</div>

<button id="theme-toggle" onclick="toggleTheme()">&#9681;</button>

<div id="dialog-overlay">
<div id="dialog-box">
<label for="name-input">名称</label>
<input type="text" id="name-input">
<label for="url-input">地址</label>
<input type="text" id="url-input">
<label for="category-select">选择分类</label>
<select id="category-select">
<!-- 分类选项将在这里动态生成 -->
</select>
<button onclick="addLink()">确定</button>
<button onclick="hideAddDialog()">取消</button>
</div>
</div>

<script>
let isAdmin = false; 
let removeMode = false; 
let isDarkTheme = false; 
let links = []; 
const categories = {
"搜索引擎": [],
"常用网站": [],
"工具导航": [],
"游戏娱乐": [],
"影音视听": [],
"技术论坛": []
};

async function loadLinks() {
    const response = await fetch('/api/getLinks?userId=testUser');
    links = await response.json();

    Object.keys(categories).forEach(key => {
        categories[key] = [];
    });

    links.forEach(link => {
        if (categories[link.category]) {
            categories[link.category].push(link);
        }
    });

    loadSections();
    updateCategorySelect();
}

function loadSections() {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';

    Object.keys(categories).forEach(category => {
        const section = document.createElement('div');
        section.className = 'section';

        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = category;

        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.id = category;

        section.appendChild(title);
        section.appendChild(cardContainer);

        categories[category].forEach(link => {
            createCard(link, cardContainer);
        });

        container.appendChild(section);
    });
}

function createCard(link, container) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('draggable', isAdmin);

    const cardTop = document.createElement('div');
    cardTop.className = 'card-top';

    const icon = document.createElement('img');
    icon.className = 'card-icon';
    icon.src = 'https://favicon.zhusl.com/ico?url=' + link.url;
    icon.alt = 'Website Icon';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = link.name;

    cardTop.appendChild(icon);
    cardTop.appendChild(title);

    const url = document.createElement('div');
    url.className = 'card-url';
    url.textContent = link.url;

    card.appendChild(cardTop);
    card.appendChild(url);

    function correctUrl(url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        } else {
            return 'http://' + url;
        }
    }

    let correctedUrl = correctUrl(link.url);

    if (!isAdmin) {
        card.addEventListener('click', () => {
            window.open(correctedUrl, '_blank');
        });
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '–';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function (event) {
        event.stopPropagation();
        removeCard(card);
    };
    card.appendChild(deleteBtn);

    if (isDarkTheme) {
        card.style.backgroundColor = '#343a40'; /* 深灰色卡片背景 */
        card.style.color = '#f8f9fa'; /* 浅灰色文字 */
        card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)'; /* 深色阴影 */
    } else {
        card.style.backgroundColor = '#ffffff'; /* 白色卡片背景 */
        card.style.color = '#333'; /* 深灰色文字 */
        card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'; /* 浅灰色阴影 */
    }

    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragover', dragOver);
    card.addEventListener('dragend', dragEnd);
    card.addEventListener('drop', drop);

    if (isAdmin && removeMode) {
        deleteBtn.style.display = 'block';
    }

    container.appendChild(card);
}

function updateCategorySelect() {
    const categorySelect = document.getElementById('category-select');
    categorySelect.innerHTML = '';

    Object.keys(categories).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

async function saveLinks() {
    let links = [];
    for (const category in categories) {
        links = links.concat(categories[category]);
    }

    await fetch('/api/saveOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'testUser', links }),
    });
}

function addLink() {
    const name = document.getElementById('name-input').value;
    const url = document.getElementById('url-input').value;
    const category = document.getElementById('category-select').value;

    if (name && url && category) {
        const newLink = { name, url, category };

        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(newLink);

        const container = document.getElementById(category);
        createCard(newLink, container);

        saveLinks();

        document.getElementById('name-input').value = '';
        document.getElementById('url-input').value = '';
        hideAddDialog();
    }
}

function removeCard(card) {
    const url = card.querySelector('.card-url').textContent;
    let category;
    for (const key in categories) {
        const index = categories[key].findIndex(link => link.url === url);
        if (index !== -1) {
            categories[key].splice(index, 1);
            category = key;
            break;
        }
    }
    card.remove();

    saveLinks();
}

let draggedCard = null;

function dragStart(event) {
    if (!isAdmin) return;
    draggedCard = event.target;
    draggedCard.classList.add('dragging');
    event.dataTransfer.effectAllowed = "move";
}

function dragOver(event) {
    if (!isAdmin) return;
    event.preventDefault();
    const target = event.target.closest('.card');
    if (target && target !== draggedCard) {
        const container = target.parentElement;
        const mousePositionX = event.clientX;
        const targetRect = target.getBoundingClientRect();

        if (mousePositionX < targetRect.left + targetRect.width / 2) {
            container.insertBefore(draggedCard, target);
        } else {
            container.insertBefore(draggedCard, target.nextSibling);
        }
    }
}

function drop(event) {
    if (!isAdmin) return;
    event.preventDefault();
    draggedCard.classList.remove('dragging');
    draggedCard = null;
    saveCardOrder();
}

function dragEnd(event) {
    if (draggedCard) {
        draggedCard.classList.remove('dragging');
    }
}

async function saveCardOrder() {
    if (!isAdmin) return;
    const containers = document.querySelectorAll('.card-container');
    let newLinks = [];

    containers.forEach(container => {
        const category = container.id;
        categories[category] = [];
        [...container.children].forEach(card => {
            const url = card.querySelector('.card-url').textContent;
            const name = card.querySelector('.card-title').textContent;
            const link = { name, url, category };
            categories[category].push(link);
            newLinks.push(link);
        });
    });

    links = newLinks;

    await fetch('/api/saveOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'testUser', links: newLinks }),
    });
}

function toggleAdminMode() {
    const passwordInput = document.getElementById('admin-password');
    const adminBtn = document.getElementById('admin-mode-btn');
    const addRemoveControls = document.querySelector('.add-remove-controls');

    if (!isAdmin) {
        verifyPassword(passwordInput.value)
        .then(isValid => {
            if (isValid) {
                isAdmin = true;
                adminBtn.textContent = "退出管理模式";
                alert('已进入管理模式');
                addRemoveControls.style.display = 'block';
                reloadCardsAsAdmin();
            } else {
                alert('密码错误');
            }
        });
    } else {
        isAdmin = false;
        removeMode = false;
        adminBtn.textContent = "进入管理模式";
        alert('已退出管理模式');
        addRemoveControls.style.display = 'none';
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => btn.style.display = 'none');
        reloadCardsAsAdmin();
    }

    passwordInput.value = '';
}

function reloadCardsAsAdmin() {
    document.querySelectorAll('.card-container').forEach(container => {
        container.innerHTML = '';
    });
    loadLinks().then(() => {
        if (isDarkTheme) {
            applyDarkTheme();
        }
    });
}

function applyDarkTheme() {
    document.body.style.backgroundColor = '#2b2b2b'; // 深灰色背景
    document.body.style.color = '#f8f9fa'; // 浅灰色文字
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.backgroundColor = '#343a40'; // 深灰色卡片背景
        card.style.color = '#f8f9fa'; // 浅灰色文字
        card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)'; // 深色阴影
    });
    
    const dialogBox = document.getElementById('dialog-box');
    dialogBox.style.backgroundColor = '#343a40'; // 深灰色对话框背景
    dialogBox.style.color = '#f8f9fa'; // 浅灰色文字

    const inputs = dialogBox.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.backgroundColor = '#495057'; // 深色输入框背景
        input.style.color = '#f8f9fa'; // 浅灰色文字
    });
}

function showAddDialog() {
    document.getElementById('dialog-overlay').style.display = 'flex';
}

function hideAddDialog() {
    document.getElementById('dialog-overlay').style.display = 'none';
}

function toggleRemoveMode() {
    removeMode = !removeMode;
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.style.display = removeMode ? 'block' : 'none';
    });
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.style.backgroundColor = isDarkTheme ? '#2b2b2b' : '#f0f4f8';
    document.body.style.color = isDarkTheme ? '#f8f9fa' : '#333';

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.backgroundColor = isDarkTheme ? '#343a40' : '#ffffff';
        card.style.color = isDarkTheme ? '#f8f9fa' : '#333';
        card.style.boxShadow = isDarkTheme
            ? '0 4px 8px rgba(0, 0, 0, 0.4)'
            : '0 4px 8px rgba(0, 0, 0, 0.1)';
    });

    const dialogBox = document.getElementById('dialog-box');
    dialogBox.style.backgroundColor = isDarkTheme ? '#343a40' : '#ffffff';
    dialogBox.style.color = isDarkTheme ? '#f8f9fa' : '#333';

    const inputs = dialogBox.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.backgroundColor = isDarkTheme ? '#495057' : '#ffffff';
        input.style.color = isDarkTheme ? '#f8f9fa' : '#333';
    });
}

async function verifyPassword(inputPassword) {
    const response = await fetch('/api/verifyPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPassword }),
    });
    const result = await response.json();
    return result.valid;
}

loadLinks();
</script>
</body>
</html>
`;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/') {
            return new Response(HTML_CONTENT, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        if (url.pathname === '/api/getLinks') {
            const userId = url.searchParams.get('userId');
            const links = await env.CARD_ORDER.get(userId); 
            return new Response(links || JSON.stringify([]), { status: 200 });
        }

        if (url.pathname === '/api/saveOrder' && request.method === 'POST') {
            const { userId, links } = await request.json();
            await env.CARD_ORDER.put(userId, JSON.stringify(links));
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        if (url.pathname === '/api/verifyPassword' && request.method === 'POST') { 
            const { password } = await request.json();
            const isValid = password === env.ADMIN_PASSWORD; // 从环境变量中获取密码
            return new Response(JSON.stringify({ valid: isValid }), {
                status: isValid ? 200 : 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response('Not Found', { status: 404 });
    }
};

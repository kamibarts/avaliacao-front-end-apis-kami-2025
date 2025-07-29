let allPosts = [];
let filteredPosts = [];


document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = './login.html';
        return;
    }
    
    loadPosts();
    setupEventListeners();
});


function setupEventListeners() {
  
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
 
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
  
    document.querySelector('.close').addEventListener('click', closeModal);
    
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('postModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}


async function loadPosts() {
    const loading = document.getElementById('loading');
    const postsContainer = document.getElementById('postsContainer');
    
    try {
        loading.style.display = 'block';
        postsContainer.innerHTML = '';
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar posts');
        }
        
        allPosts = await response.json();
        filteredPosts = [...allPosts];
        
        displayPosts(filteredPosts);
        
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        postsContainer.innerHTML = '<p style="color: white; text-align: center;">Erro ao carregar posts. Tente novamente.</p>';
    } finally {
        loading.style.display = 'none';
    }
}


function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Nenhum post encontrado.</p>';
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="post-card" onclick="openPostModal(${post.id})">
            <div class="post-id">Post #${post.id}</div>
            <h3>${post.title}</h3>
        </div>
    `).join('');
}


function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm)
        );
    }
    
    displayPosts(filteredPosts);
}


async function openPostModal(postId) {
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    try {
        
        const post = allPosts.find(p => p.id === postId);
        
        if (post) {
            modalTitle.textContent = post.title;
            modalBody.textContent = post.body;
        } else {
          
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
            const postData = await response.json();
            
            modalTitle.textContent = postData.title;
            modalBody.textContent = postData.body;
        }
        
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do post:', error);
        modalTitle.textContent = 'Erro';
        modalBody.textContent = 'Não foi possível carregar os detalhes do post.';
        modal.style.display = 'block';
    }
}


function closeModal() {
    const modal = document.getElementById('postModal');
    modal.style.display = 'none';
}


function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.clear();
        window.location.href = './login.html';
    }
}


async function handleTokenExpiration() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
        logout();
        return;
    }
    
    try {
        const response = await fetch('https://dummyjson.com/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: refreshToken,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
        } else {
            logout();
        }
    } catch (error) {
        console.error('Erro ao renovar token:', error);
        logout();
    }
}

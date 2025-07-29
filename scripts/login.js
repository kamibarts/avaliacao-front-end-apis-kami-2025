
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    if (token) {
  
        verifyToken(token);
    }
});


function verifyToken(token) {

    if (token) {
        window.location.href = './posts.html';
    }
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    

    errorMessage.textContent = '';
    
    try {
        const response = await fetch('https://dummyjson.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
         
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userData', JSON.stringify({
                id: data.id,
                username: data.username,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName
            }));
            
          
            window.location.href = './posts.html';
        } else {
          
            errorMessage.textContent = data.message || 'Erro ao fazer login. Verifique suas credenciais.';
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        errorMessage.textContent = 'Erro de conexão. Tente novamente.';
    }
});


async function refreshAuthToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
     
        window.location.href = './login.html';
        return null;
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
            return data.token;
        } else {
         
            localStorage.clear();
            window.location.href = './login.html';
            return null;
        }
    } catch (error) {
        console.error('Erro ao renovar token:', error);
        localStorage.clear();
        window.location.href = './login.html';
        return null;
    }
}

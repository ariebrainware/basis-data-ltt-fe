function greetUser() {
    const greeting = document.createElement('h1');
    greeting.textContent = 'Welcome to Basis Data Lee Tit Tar!';
    document.body.appendChild(greeting);
}

function setupButton() {
    const button = document.createElement('button');
    button.textContent = 'Click Me!';
    button.addEventListener('click', () => {
        alert('Button was clicked!');
    });
    document.body.appendChild(button);
}

document.addEventListener('DOMContentLoaded', () => {
    greetUser();
    setupButton();
});
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    setTimeout(() => {
        const theme = e.target.checked ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, 400)
}

toggleSwitch.addEventListener('change', switchTheme, false);
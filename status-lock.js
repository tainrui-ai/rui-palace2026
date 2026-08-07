document.addEventListener("DOMContentLoaded", function() {
    fetch('/status.json?t=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            Object.keys(data).forEach(url => {
                if (data[url].locked) {
                    document.querySelectorAll(`a[href="${url}"], a[href$="${url}"]`).forEach(link => {
                        link.addEventListener('click', e => {
                            e.preventDefault();
                            alert('蕊宫安全提示：该链接当前处于安全锁死状态，无法访问。');
                        });
                        link.style.pointerEvents = 'none';
                        link.style.opacity = '0.3';
                        link.style.cursor = 'not-allowed';
                        link.style.filter = 'grayscale(100%)';
                    });
                }
            });
        });
});
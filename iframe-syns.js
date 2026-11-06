(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // 親ページからのテーマ変更を受け取る
        window.addEventListener('message', function(e) {
            // セキュリティ: 送信元のオリジンを検証
            if (e.origin !== 'https://nekomiyanatuki.github.io') {
                return;
            }
            
            if (e.data && e.data.type === 'themeChange') {
                document.body.classList.toggle('dark-mode', e.data.dark);
                
                // ページ固有のテーマ更新関数があれば呼び出す
                if (typeof window.onThemeChange === 'function') {
                    window.onThemeChange(e.data.dark);
                }
            }
        });
        
        // 初期テーマを親ページから取得
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'requestTheme' }, '*');
        }
    }
})();
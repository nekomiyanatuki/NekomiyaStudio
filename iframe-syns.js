(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // 親ページからのテーマ変更を受け取る
        window.addEventListener('message', function(e) {
            // 同一オリジンまたは許可されたオリジンのみ受け付ける
            const allowedOrigins = [
                'https://nekomiyanatuki.github.io',
                window.location.origin
            ];
            
            if (!allowedOrigins.includes(e.origin)) {
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
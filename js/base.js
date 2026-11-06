(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const SITE_CONFIG = {
            nameJa: '猫宮のアトリエ',
            nameEn: 'NekomiyaStudio',
            homeUrl: 'https://nekomiyanatuki.github.io/NekomiyaStudio/',
            logoUrl: 'https://nekomiyanatuki.github.io/NekomiyaStudio/pic-image/icon/share.png'
        };

        // ===== ルート定義（拡張可能） =====
        const ROUTES = {
            // メインページ
            'home': {
                src: 'home.html',
                titleJa: '猫宮のアトリエ',
                titleEn: 'NekomiyaStudio',
                status: 'active'
            },
            // エラーコンテンツ
            '404': {
                src: 'error.html?error=404',
                titleJa: '404 Not Found',
                titleEn: '404 Not Found',
                status: 'error'
            },
            '503': {
                src: 'error.html?error=503',
                titleJa: '503 Service Unavailable',
                titleEn: '503 Service Unavailable',
                status: 'error'
            },
            // 追加コンテンツ
            'cpc': {
                src: 'cpc/index.html',
                titleJa: 'カスタムサークルチャート',
                titleEn: 'CustomPieChart',
                status: 'active'
            },
        };

        // 言語判定
        const userLang = navigator.language || navigator.userLanguage;
        const isJapanese = userLang.startsWith('ja');

        const siteLogo = document.getElementById('siteLogo');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        const menuList = document.getElementById('menuList');
        const themeToggle = document.getElementById('themeToggle');
        const linkShareBtn = document.getElementById('linkShareBtn');
        const toast = document.getElementById('toast');
        const pageFrame = document.getElementById('pageFrame');

        // ===== 端末判定 =====
        function detectDevice() {
            const ua = navigator.userAgent;
            if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
            if (/Android/.test(ua)) return 'android';
            if (/Mobile|BlackBerry|IEMobile/.test(ua)) return 'sp';
            return 'pc';
        }

        // ===== 日時パラメータ生成 =====
        function generateTimeParam() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            const dateStr = year + month + day + hours + minutes + seconds;
            
            const start = new Date(year, 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = String(Math.floor(diff / oneDay)).padStart(3, '0');
            
            return dateStr + '&' + dayOfYear;
        }

        // ===== 共有 URL 生成 =====
        function buildShareUrl(baseUrl) {
            const timeParam = generateTimeParam();
            const device = detectDevice();
            const separator = baseUrl.includes('?') ? '&' : '?';
            return baseUrl + separator + 'time=' + timeParam + '&dvice=' + device;
        }

        // ===== ルーティング処理 =====
        function handleRoute() {
            // URL パスから判定
            const path = window.location.pathname;
            
            // エラーパラメータがある場合
            const urlParams = new URLSearchParams(window.location.search);
            const errorCode = urlParams.get('error');
            
            let routeKey;
            
            if (errorCode === '404' || errorCode === '503') {
                routeKey = errorCode;
            } else if (path === '/' || path === '/index.html' || path === '/NekomiyaStudio/') {
                routeKey = 'home';
            } else if (path.includes('/cpc')) {
                routeKey = 'cpc';
            } else {
                routeKey = '404';
            }
            
            navigateTo(routeKey);
        }

        // ===== ページ遷移関数 =====
        function navigateTo(routeKey) {
            const route = ROUTES[routeKey];
            if (!route) return;
            
            // iframe の src を変更
            pageFrame.src = route.src;
            pageFrame.title = isJapanese ? route.titleJa : route.titleEn;
            // ページタイトルの更新
            document.title = isJapanese ? route.titleJa : route.titleEn;
            
            // メニューのアクティブ状態を更新
            updateMenuActive(routeKey);
            
            // サイドメニューを閉じる
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
        }

        // ===== メニュー生成 =====
        function buildMenu() {
            menuList.innerHTML = '';
            Object.keys(ROUTES).forEach(function(key) {
                const route = ROUTES[key];
                if (route.status === 'error') return; // エラーページはメニュー非表示
                
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = isJapanese ? route.titleJa : route.titleEn;
                a.dataset.route = key;
                
                // クリックイベントで iframe の src を変更
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    navigateTo(key);
                });
                
                li.appendChild(a);
                menuList.appendChild(li);
            });
        }

        // ===== メニューのアクティブ状態更新 =====
        function updateMenuActive(currentRoute) {
            const links = menuList.querySelectorAll('a');
            links.forEach(function(link) {
                if (link.dataset.route === currentRoute) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        // ===== サイトロゴクリック → ホームへ遷移 =====
        siteLogo.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('home');
        });

        // ===== ハンバーガーメニュー =====
        hamburgerBtn.addEventListener('click', function() {
            sideMenu.classList.toggle('open');
            menuOverlay.classList.toggle('show');
        });

        menuOverlay.addEventListener('click', function() {
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
        });

        // ===== テーマ管理 =====
        let isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        function applyTheme() {
            document.body.classList.toggle('dark-mode', isDarkMode);
            themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
            localStorage.setItem('darkMode', isDarkMode);
            if (pageFrame && pageFrame.contentWindow) {
                pageFrame.contentWindow.postMessage({ type: 'themeChange', dark: isDarkMode }, '*');
            }
        }

        themeToggle.addEventListener('click', function() {
            isDarkMode = !isDarkMode;
            applyTheme();
        });

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode')) {
            isDarkMode = true;
        }

        // ===== トースト表示 =====
        function showToast(message) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(function() {
                toast.classList.remove('show');
            }, 3000);
        }

        // ===== iframe からのメッセージに応答 =====
        window.addEventListener('message', function(e) {
            // セキュリティ: 送信元のオリジンを検証
            if (e.origin !== 'https://nekomiyanatuki.github.io') {
                return;
            }
    
            // iframe からのテーマ要求
            if (e.data && e.data.type === 'requestTheme') {
                e.source.postMessage({ 
                    type: 'themeChange', 
                    dark: isDarkMode 
                }, e.origin);
            }
    
            // iframe からのトースト要求
            if (e.data && e.data.type === 'showToast') {
                showToast(e.data.message);
            }
        });
        
        // リンク共有ボタンの処理
        linkShareBtn.addEventListener('click', function() {
            const shareUrl = buildShareUrl(window.location.href);
            
            // クリップボードコピーを優先
            navigator.clipboard.writeText(shareUrl).then(function() {
                showToast(isJapanese ? '🔗 URL をコピーしました' : '🔗 URL copied');
            }).catch(function() {
                // クリップボード失敗時のみ共有ダイアログを表示
                if (navigator.share) {
                    navigator.share({
                        title: isJapanese ? SITE_CONFIG.nameJa : SITE_CONFIG.nameEn,
                        url: shareUrl
                    }).catch(function(err) {
                        if (err.name !== 'AbortError') {
                            showToast('⚠️ 共有に失敗しました');
                        }
                    });
                }
            });
        });

        // ===== 初回読み込み =====
        buildMenu();
        applyTheme();
        handleRoute();
    }
})();
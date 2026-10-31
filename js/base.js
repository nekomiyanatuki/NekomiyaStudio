(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const SITE_CONFIG = {
            nameJa: '猫宮のアトリエwith猫宮の街',
            nameEn: 'NekomiyaStudio-with-NekomiyaCity',
            homeUrl: 'https://nekomiyanatuki.github.io/NekomiyaStudio-with-NekomiyaCity/',
            logoUrl: 'https://nekomiyanatuki.github.io/NekomiyaStudio-with-NekomiyaCity/images/icons/logo.png'
        };

        // ===== ルート定義（拡張可能） =====
        const ROUTES = {
            '': {
                src: 'index.html',
                titleJa: '猫宮のアトリエwith猫宮の街',
                titleEn: 'NekomiyaStudio-with-NekomiyaCity',
                status: '503'  // ホーム(メインページ)は未作成
            },
            'Home': {
                src: 'index.html',
                titleJa: '猫宮のアトリエwith猫宮の街',
                titleEn: 'NekomiyaStudio-with-NekomiyaCity',
                status: '503'  // ホーム(メインページ)は未作成
            },
            'cpc': {
                src: 'cpc.html',
                titleJa: 'カスタムサークルチャート',
                titleEn: 'CustomPieChart',
                status: 'active'
            },
            // エラーページ
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
            }
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
            const separator = baseUrl.includes('?') ? '?' : '&' ;
            return baseUrl + separator + 'time=' + timeParam + '&' + 'dvice=' + device;
        }

        // ===== ルーティング処理 =====
        function handleRoute() {
            // URL からハッシュを取得（例: /cpc）
            let hash = window.location.hash.replace('/', '') || 'Home';
            
            // エラーパラメータがある場合はエラーページに強制遷移
            const urlParams = new URLSearchParams(window.location.search);
            const errorCode = urlParams.get('error');
            if (errorCode === '404' || errorCode === '503') {
                hash = 'Error=' + errorCode;
            }
            
            // ルートが存在しない場合は 404
            const route = ROUTES[hash] || ROUTES['404'];
            
            // iframe の src を変更
            pageFrame.src = route.src;
            pageFrame.title = isJapanese ? route.titleJa : route.titleEn;
            
            // ページタイトルも更新
            document.title = isJapanese ? route.titleJa : route.titleEn;
            
            // メニューのアクティブ状態を更新
            updateMenuActive(hash);
        }

        // ===== メニュー生成 =====
        function buildMenu() {
            menuList.innerHTML = '';
            Object.keys(ROUTES).forEach(function(key) {
                const route = ROUTES[key];
                if (route.status === 'error') return; // エラーページはメニューに表示しない
                
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '/' + key;
                a.textContent = isJapanese ? route.titleJa : route.titleEn;
                a.dataset.route = key;
                
                if (route.status === '503') {
                    a.classList.add('unavailable');
                }
                
                li.appendChild(a);
                menuList.appendChild(li);
            });
        }

        // ===== メニューのアクティブ状態更新 =====
        function updateMenuActive(currentHash) {
            const links = menuList.querySelectorAll('a');
            links.forEach(function(link) {
                if (link.dataset.route === currentHash) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        // ===== ハッシュ変更監視 =====
        window.addEventListener('hashchange', handleRoute);

        // ===== サイトロゴクリック → ホームへ遷移 =====
        siteLogo.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = '' || 'Home';
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

        // ===== リンク共有 =====
        linkShareBtn.addEventListener('click', function() {
            const shareUrl = buildShareUrl(window.location.href);
            
            if (navigator.share) {
                navigator.share({
                    title: isJapanese ? SITE_CONFIG.nameJa : SITE_CONFIG.nameEn,
                    text: isJapanese ? SITE_CONFIG.nameJa : SITE_CONFIG.nameEn,
                    url: shareUrl
                }).then(function() {
                    showToast(isJapanese ? '🔗 共有しました' : '🔗 Shared');
                }).catch(function(err) {
                    if (err.name !== 'AbortError') {
                        showToast(isJapanese ? '⚠️ 共有に失敗しました' : '⚠️ Share failed');
                    }
                });
            } else {
                navigator.clipboard.writeText(shareUrl).then(function() {
                    showToast(isJapanese ? '🔗 URL をコピーしました' : '🔗 URL copied');
                }).catch(function() {
                    showToast(isJapanese ? '⚠️ コピーに失敗しました' : '⚠️ Copy failed');
                });
            }
        });

        // ===== 初回読み込み =====
        buildMenu();
        applyTheme();
        handleRoute();
    }
})();
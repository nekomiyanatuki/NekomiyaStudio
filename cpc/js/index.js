(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const DEFAULT_CHART_DATA = [
            { label: '項目 1', value: 30 },
            { label: '項目 2', value: 35 },
            { label: '項目 3', value: 30 },
            { label: '項目 4', value: 45 },
            { label: '項目 5', value: 50 }
        ];

        const STORAGE_KEY = 'cpcState';
        const LOGO_URL = 'https://nekomiyanatuki.github.io/NekomiyaStudio/pic-image/icon/share.png';

        const colorThemes = {
            blue: { line: 'rgba(54, 162, 235, 1)', bg: 'rgba(54, 162, 235, 0.2)', point: 'rgba(54, 162, 235, 1)' },
            red: { line: 'rgba(255, 99, 132, 1)', bg: 'rgba(255, 99, 132, 0.2)', point: 'rgba(255, 99, 132, 1)' },
            green: { line: 'rgba(75, 192, 192, 1)', bg: 'rgba(75, 192, 192, 0.2)', point: 'rgba(75, 192, 192, 1)' },
            orange: { line: 'rgba(255, 159, 64, 1)', bg: 'rgba(255, 159, 64, 0.2)', point: 'rgba(255, 159, 64, 1)' }
        };

        const inputsContainer = document.getElementById('valueInputs');
        const canvas = document.getElementById('customRadarChart');
        const ctx = canvas.getContext('2d');
        const loadingOverlay = document.getElementById('loadingOverlay');
        const addBtn = document.getElementById('addBtn');
        const resetBtn = document.getElementById('resetBtn');
        const saveBtn = document.getElementById('saveBtn');
        const chartShareBtn = document.getElementById('chartShareBtn');
        const gridStyleSelect = document.getElementById('gridStyle');
        const colorThemeSelect = document.getElementById('colorTheme');
        const colorPickerGroup = document.getElementById('colorPickerGroup');
        const customColorInput = document.getElementById('customColor');
        const colorPreview = document.getElementById('colorPreview');
        const chartTitleInput = document.getElementById('chartTitle');

        const userLang = navigator.language || navigator.userLanguage;
        const isJapanese = userLang.startsWith('ja');

        let isDarkMode = false;

        // ===== テーマ変更コールバック（iframe-sync.js から呼ばれる） =====
        window.onThemeChange = function(dark) {
            isDarkMode = dark;
            updateChartColors();
        };

        // 状態管理
        let chartData = [];
        let currentGridStyle = 'polygon';
        let currentColorTheme = 'blue';
        let customColor = '#36a2eb';
        let currentTitle = 'CustomPieChart';

        function saveState() {
            const state = {
                chartData: chartData,
                gridStyle: currentGridStyle,
                colorTheme: currentColorTheme,
                customColor: customColor,
                title: currentTitle
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }

        function loadState() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    chartData = state.chartData || JSON.parse(JSON.stringify(DEFAULT_CHART_DATA));
                    currentGridStyle = state.gridStyle || 'polygon';
                    currentColorTheme = state.colorTheme || 'blue';
                    customColor = state.customColor || '#36a2eb';
                    currentTitle = state.title || 'CustomPieChart';
                } catch (e) {
                    chartData = JSON.parse(JSON.stringify(DEFAULT_CHART_DATA));
                }
            } else {
                chartData = JSON.parse(JSON.stringify(DEFAULT_CHART_DATA));
            }
        }

        // ===== HEX を RGBA に変換 =====
        function hexToRgba(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
        }

        // ===== 現在のテーマカラーを取得 =====
        function getCurrentTheme() {
            if (currentColorTheme === 'custom') {
                return {
                    line: customColor,
                    bg: hexToRgba(customColor, 0.2),
                    point: customColor
                };
            }
            return colorThemes[currentColorTheme];
        }

        // ===== タイトル付きチャート画像を生成 =====
        function createChartImageWithTitle() {
            return new Promise(function(resolve) {
                const logoImg = new Image();
                logoImg.crossOrigin = 'anonymous';
                logoImg.onload = function() {
                    const titleHeight = 60;
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height + titleHeight;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // 背景を白で塗りつぶし
                    tempCtx.fillStyle = '#ffffff';
                    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    
                    // タイトルを上部に描画
                    tempCtx.fillStyle = '#333333';
                    tempCtx.font = 'bold 24px "Helvetica Neue", Arial, sans-serif';
                    tempCtx.textAlign = 'center';
                    tempCtx.textBaseline = 'middle';
                    tempCtx.fillText(currentTitle, tempCanvas.width / 2, titleHeight / 2);
                    
                    // ロゴを左上に描画
                    const logoSize = 40;
                    tempCtx.drawImage(logoImg, 10, 10, logoSize, logoSize);
                    
                    // チャートを描画
                    tempCtx.drawImage(canvas, 0, titleHeight);
                    
                    tempCanvas.toBlob(function(blob) {
                        resolve(blob);
                    }, 'image/png');
                };
                logoImg.onerror = function() {
                    // ロゴ読み込み失敗時はタイトルのみ
                    const titleHeight = 60;
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height + titleHeight;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    tempCtx.fillStyle = '#ffffff';
                    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    
                    tempCtx.fillStyle = '#333333';
                    tempCtx.font = 'bold 24px "Helvetica Neue", Arial, sans-serif';
                    tempCtx.textAlign = 'center';
                    tempCtx.textBaseline = 'middle';
                    tempCtx.fillText(currentTitle, tempCanvas.width / 2, titleHeight / 2);
                    
                    tempCtx.drawImage(canvas, 0, titleHeight);
                    
                    tempCanvas.toBlob(function(blob) {
                        resolve(blob);
                    }, 'image/png');
                };
                logoImg.src = LOGO_URL;
            });
        }

        // ===== グラフ描画（余白を追加） =====
        const myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: chartData.map(function(d) { return d.label; }),
                datasets: [{
                    data: chartData.map(function(d) { return d.value; }),
                    backgroundColor: getCurrentTheme().bg,
                    borderColor: getCurrentTheme().line,
                    borderWidth: 2,
                    pointBackgroundColor: getCurrentTheme().point,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 30  // チャートに余白を追加
                },
                plugins: { 
                    legend: { display: false }
                },
                animation: { duration: 150 },
                scales: {
                    r: {
                        min: 0,
                        max: 300,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            circular: currentGridStyle === 'circle'
                        },
                        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                        ticks: {
                            stepSize: 20,
                            backdropColor: 'transparent',
                            color: '#666'
                        }
                    }
                }
            },
            plugins: [{
                id: 'custom_canvas_background_color',
                beforeDraw: function(chart) {
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = isDarkMode ? '#1a1a1a' : '#ffffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            }]
        });

        setTimeout(function() {
            loadingOverlay.style.display = 'none';
        }, 500);

        function updateChartColors() {
            const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
            const angleColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
            const tickColor = isDarkMode ? '#aaa' : '#666';
            
            myChart.options.scales.r.grid.color = gridColor;
            myChart.options.scales.r.angleLines.color = angleColor;
            myChart.options.scales.r.ticks.color = tickColor;
            myChart.update();
        }

        // ===== 入力フォーム生成（数値クリック編集対応） =====
        function renderInputs() {
            inputsContainer.innerHTML = ''; 
            
            chartData.forEach(function(item, index) {
                const row = document.createElement('div');
                row.className = 'input-row';
                
                row.innerHTML = 
                    '<input type="text" value="' + item.label + '" data-index="' + index + '" class="item-name-input" placeholder="項目名">' +
                    '<div class="slider-container">' +
                        '<input type="range" value="' + item.value + '" data-index="' + index + '" class="item-slider" min="0" max="300">' +
                        '<input type="number" value="' + item.value + '" data-index="' + index + '" class="slider-val-input" min="0" max="300" id="val-' + index + '">' +
                    '</div>' +
                    '<button class="btn btn-delete" data-index="' + index + '">削除</button>';
                
                inputsContainer.appendChild(row);
            });

            if (chartData.length >= 8) {
                inputsContainer.classList.add('scrollable');
            } else {
                inputsContainer.classList.remove('scrollable');
            }

            myChart.data.labels = chartData.map(function(d) { return d.label; });
            myChart.data.datasets[0].data = chartData.map(function(d) { return d.value; });
            myChart.update();
            saveState();
        }

        // ===== 入力イベント（スライダー + 数値直接入力） =====
        inputsContainer.addEventListener('input', function(e) {
            const index = parseInt(e.target.dataset.index);
            
            if (e.target.classList.contains('item-name-input')) {
                chartData[index].label = e.target.value;
                myChart.data.labels = chartData.map(function(d) { return d.label; });
                myChart.update();
                saveState();
            } else if (e.target.classList.contains('item-slider')) {
                const val = parseInt(e.target.value);
                chartData[index].value = val;
                document.getElementById('val-' + index).value = val;
                myChart.data.datasets[0].data[index] = val;
                myChart.update();
                saveState();
            } else if (e.target.classList.contains('slider-val-input')) {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 0;
                if (val < 0) val = 0;
                if (val > 300) val = 300;
                
                chartData[index].value = val;
                e.target.value = val;
                
                // スライダーも同期
                const slider = inputsContainer.querySelector('.item-slider[data-index="' + index + '"]');
                if (slider) slider.value = val;
                
                myChart.data.datasets[0].data[index] = val;
                myChart.update();
                saveState();
            }
        });

        inputsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-delete')) {
                const index = parseInt(e.target.dataset.index);
                if (chartData.length <= 5) {
                    alert(isJapanese ? "これ以上項目を減らすことはできません（最低 5 項目必要です）" : "Cannot reduce below 5 items");
                    return;
                }
                chartData.splice(index, 1); 
                renderInputs(); 
            }
        });

        addBtn.addEventListener('click', function() {
            const newNum = chartData.length + 1;
            chartData.push({ label: isJapanese ? '項目' + newNum : 'Item ' + newNum, value: 50 }); 
            renderInputs(); 
        });

        resetBtn.addEventListener('click', function() {
            if (confirm(isJapanese ? '初期状態（5 項目）にリセットしますか？' : 'Reset to initial state (5 items)?')) {
                chartData = JSON.parse(JSON.stringify(DEFAULT_CHART_DATA));
                currentGridStyle = 'polygon';
                currentColorTheme = 'blue';
                customColor = '#36a2eb';
                currentTitle = 'CustomPieChart';
                
                gridStyleSelect.value = 'polygon';
                colorThemeSelect.value = 'blue';
                colorPickerGroup.style.display = 'none';
                customColorInput.value = customColor;
                colorPreview.style.backgroundColor = customColor;
                chartTitleInput.value = currentTitle;
                
                myChart.options.scales.r.grid.circular = false;
                const theme = getCurrentTheme();
                myChart.data.datasets[0].backgroundColor = theme.bg;
                myChart.data.datasets[0].borderColor = theme.line;
                myChart.data.datasets[0].pointBackgroundColor = theme.point;
                
                renderInputs();
            }
        });

        gridStyleSelect.addEventListener('change', function(e) {
            currentGridStyle = e.target.value;
            myChart.options.scales.r.grid.circular = (currentGridStyle === 'circle');
            myChart.update();
            saveState();
        });

        colorThemeSelect.addEventListener('change', function(e) {
            currentColorTheme = e.target.value;
            
            // カスタム選択時に RGB パネルを表示
            if (currentColorTheme === 'custom') {
                colorPickerGroup.style.display = 'block';
            } else {
                colorPickerGroup.style.display = 'none';
            }
            
            const theme = getCurrentTheme();
            myChart.data.datasets[0].backgroundColor = theme.bg;
            myChart.data.datasets[0].borderColor = theme.line;
            myChart.data.datasets[0].pointBackgroundColor = theme.point;
            myChart.update();
            saveState();
        });

        customColorInput.addEventListener('input', function(e) {
            customColor = e.target.value;
            colorPreview.style.backgroundColor = customColor;
            
            const theme = getCurrentTheme();
            myChart.data.datasets[0].backgroundColor = theme.bg;
            myChart.data.datasets[0].borderColor = theme.line;
            myChart.data.datasets[0].pointBackgroundColor = theme.point;
            myChart.update();
            saveState();
        });

        chartTitleInput.addEventListener('input', function(e) {
            currentTitle = e.target.value || 'CustomPieChart';
            saveState();
        });

        // ===== 画像保存 =====
        saveBtn.addEventListener('click', function() {
            loadingOverlay.style.display = 'none';
            
            createChartImageWithTitle().then(function(blob) {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = currentTitle + '.png';
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            });
        });

        // ===== チャート画像共有（クリップボードコピーのみ） =====
        chartShareBtn.addEventListener('click', function() {
            createChartImageWithTitle().then(function(blob) {
                if (blob) {
                    navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob
                        })
                    ]).then(function() {
                        showToast(isJapanese ? '📋 チャート画像をコピーしました' : '📋 Chart copied');
                    }).catch(function(err) {
                        console.error('Clipboard write failed:', err);
                        showToast(isJapanese ? '⚠️ コピーに失敗しました' : '⚠️ Copy failed');
                        // ダウンロードは行わない
                    });
                }
            });
        });

        // ===== トースト表示 =====
        function showToast(message) {
            // トースト要素が親ページにある場合は親に通知
            if (window.parent !== window) {
                window.parent.postMessage({ 
                    type: 'showToast', 
                    message: message 
                }, '*');
            }
        }

        loadState();
        gridStyleSelect.value = currentGridStyle;
        colorThemeSelect.value = currentColorTheme;
        
        if (currentColorTheme === 'custom') {
            colorPickerGroup.style.display = 'block';
        }
        
        customColorInput.value = customColor;
        colorPreview.style.backgroundColor = customColor;
        chartTitleInput.value = currentTitle;
        renderInputs();
    }
})();
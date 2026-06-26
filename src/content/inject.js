(function() {
    // 确保只注入一次
    if (window.__douyin_url_extractor_injected) return;
    window.__douyin_url_extractor_injected = true;

    console.log('DouyinURL提取Pro: inject.js已成功在MAIN环境启动');

    // 统一的 API 端点匹配列表
    const API_PATTERNS = [
        '/aweme/v1/web/search/item',
        '/aweme/v1/web/aweme/post',
        '/aweme/v1/web/discover/feed',
        '/aweme/v1/feed',
        '/aweme/v1/web/tab/feed',
        '/aweme/v1/web/relation/follow/feed',
        '/aweme/v1/web/mix/aweme',
        '/aweme/v1/web/general/search/single',
        '/aweme/v1/web/challenge/aweme',
        '/aweme/v1/web/hot/search/video/list',
        '/aweme/v1/web/music/aweme'
    ];

    function shouldIntercept(url) {
        return url && API_PATTERNS.some(pattern => url.includes(pattern));
    }

    // 拦截 fetch 请求
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        const response = await originalFetch.apply(this, arguments);
        let url = '';
        if (typeof input === 'string') {
            url = input;
        } else if (input && typeof input === 'object') {
            url = input.url || '';
        }

        if (shouldIntercept(url)) {
            try {
                const clone = response.clone();
                const json = await clone.json();
                window.postMessage({ type: 'DOUYIN_API_DATA', data: json }, '*');
            } catch (e) {
                // 静默失败
            }
        }
        return response;
    };

    // 拦截 XMLHttpRequest 请求
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', function() {
            const url = this._url;
            if (shouldIntercept(url)) {
                try {
                    const json = JSON.parse(this.responseText);
                    window.postMessage({ type: 'DOUYIN_API_DATA', data: json }, '*');
                } catch (e) {
                    // 静默失败
                }
            }
        });
        return originalSend.apply(this, arguments);
    };
})();

(function() {
    // 确保只注入一次
    if (window.__douyin_url_extractor_injected) return;
    window.__douyin_url_extractor_injected = true;

    console.log('DouyinURL提取Pro: inject.js已成功在MAIN环境启动');

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

        if (url && (
            url.includes('/aweme/v1/web/search/item') ||
            url.includes('/aweme/v1/web/aweme/post') ||
            url.includes('/aweme/v1/web/discover/feed') ||
            url.includes('/aweme/v1/feed') ||
            url.includes('/aweme/v1/web/tab/feed') ||
            url.includes('/aweme/v1/web/relation/follow/feed') ||
            url.includes('/aweme/v1/web/mix/aweme') ||
            url.includes('/aweme/v1/web/general/search/single') ||
            url.includes('/aweme/v1/web/challenge/aweme') ||
            url.includes('/aweme/v1/web/hot/search/video/list') ||
            url.includes('/aweme/v1/web/music/aweme')
        )) {
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
            if (url && (
                url.includes('/aweme/v1/web/search/item') ||
                url.includes('/aweme/v1/web/aweme/post') ||
                url.includes('/aweme/v1/web/discover/feed') ||
                url.includes('/aweme/v1/feed') ||
                url.includes('/aweme/v1/web/tab/feed') ||
                url.includes('/aweme/v1/web/relation/follow/feed') ||
                url.includes('/aweme/v1/web/mix/aweme') ||
                url.includes('/aweme/v1/web/general/search/single') ||
                url.includes('/aweme/v1/web/challenge/aweme') ||
                url.includes('/aweme/v1/web/hot/search/video/list') ||
                url.includes('/aweme/v1/web/music/aweme')
            )) {
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

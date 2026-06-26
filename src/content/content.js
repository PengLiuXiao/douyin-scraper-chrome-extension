/* DouyinURL提取Pro - content script (抖音专用) */

// ==================== 抖音数据缓存 ====================
let interceptedAwemes = new Map();
let seenOrder = [];

function extractAwemes(obj, list = []) {
    if (!obj || typeof obj !== 'object') return list;
    if (obj.aweme_id) {
        list.push(obj);
    } else if (Array.isArray(obj)) {
        for (const item of obj) {
            extractAwemes(item, list);
        }
    } else {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key === 'author' || key === 'statistics' || key === 'video') continue;
                extractAwemes(obj[key], list);
            }
        }
    }
    return list;
}

// 接收 inject.js 拦截到的 API 数据
window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'DOUYIN_API_DATA') {
        const rawList = [];
        extractAwemes(event.data.data, rawList);
        rawList.forEach(item => {
            const id = String(item.aweme_id || '');
            if (id && !interceptedAwemes.has(id)) {
                const title = item.desc || item.title || '';
                const author = item.author?.nickname || '';
                const authorId = item.author?.uid ? String(item.author.uid) : (item.author?.sec_uid || '');
                const duration = item.video?.duration ? Math.round(item.video.duration / 1000) + 's' :
                                 (item.duration ? Math.round(item.duration / 1000) + 's' : '');
                const likes = item.statistics?.digg_count || item.statistics?.like_count || 0;
                const comments = item.statistics?.comment_count || 0;
                const shares = item.statistics?.share_count || 0;
                const views = item.statistics?.play_count || 0;
                const createTime = item.create_time ? new Date(item.create_time * 1000).toLocaleString() : '';
                const coverUrl = item.video?.cover?.url_list?.[0] || '';
                
                interceptedAwemes.set(id, {
                    '视频ID': id,
                    '视频链接': `https://www.douyin.com/video/${id}`,
                    '视频标题': title,
                    '作者': author,
                    '作者ID': authorId,
                    '时长': duration,
                    '点赞数': likes,
                    '评论数': comments,
                    '分享数': shares,
                    '播放量': views,
                    '发布时间': createTime,
                    '封面链接': coverUrl
                });
                seenOrder.push(id);
            }
        });
        console.log('DouyinURL提取Pro: 已拦截并缓存了', interceptedAwemes.size, '个视频数据');
    }
});

// 解析 DOM 以便在 API 未拦截到时作为降级备用
// 策略一：优先使用 data-e2e 语义属性定位视频卡片（抖音官方属性，相对稳定）
// 策略二：降级到 a[href*="/video/"] 链接扫描
function syncDOMToCache() {
    const cardSelectors = [
        '[data-e2e="search-card-item"]',
        '[data-e2e="user-post-item"]',
        '[data-e2e="recommend-list-item-action"]',
        '[data-e2e="channel-item"]',
        '[data-e2e="mix-item"]',
        '[data-e2e*="video-item"]',
    ].join(', ');

    const cards = $(cardSelectors);

    if (cards.length > 0) {
        // 策略一：基于 data-e2e 语义卡片容器
        cards.each(function() {
            const card = $(this);
            const link = card.find('a[href*="/video/"]').first();
            const href = link.attr('href') || '';
            const match = href.match(/\/video\/(\d+)/);
            if (!match) return;

            const id = match[1];
            if (interceptedAwemes.has(id)) return;

            // 标题：优先语义属性，其次链接文字
            const titleEl = card.find('[data-e2e="search-card-video-title"], [data-e2e*="title"]').first();
            const title = titleEl.length ? titleEl.text().trim() : link.text().trim();

            // 作者：优先语义属性，其次 /user/ 链接
            const authorEl = card.find('[data-e2e="search-card-user-name"], [data-e2e*="author"], [data-e2e*="user-name"]').first();
            const author = authorEl.length ? authorEl.text().trim() :
                           card.find('a[href*="/user/"]').first().text().trim();

            // 点赞 / 评论（部分页面有展示）
            const likeEl = card.find('[data-e2e*="like-count"], [data-e2e*="digg-count"]').first();
            const likes = likeEl.length ? likeEl.text().trim() : '';
            const commentEl = card.find('[data-e2e*="comment-count"]').first();
            const comments = commentEl.length ? commentEl.text().trim() : '';

            interceptedAwemes.set(id, {
                '视频ID': id,
                '视频链接': `https://www.douyin.com/video/${id}`,
                '视频标题': title,
                '作者': author,
                '作者ID': '',
                '时长': '',
                '点赞数': likes,
                '评论数': comments,
                '分享数': '',
                '播放量': '',
                '发布时间': '',
                '封面链接': ''
            });
            seenOrder.push(id);
        });
    } else {
        // 策略二：降级到链接扫描（兜底）
        $('a[href*="/video/"]').each(function() {
            const href = $(this).attr('href') || '';
            const match = href.match(/\/video\/(\d+)/);
            if (!match) return;

            const id = match[1];
            if (interceptedAwemes.has(id)) return;

            const card = $(this).closest('li, [class*="card"], [class*="item"]');
            let title = '';
            let author = '';

            if (card.length) {
                const titleEl = card.find('p, [class*="desc"], [class*="title"]').first();
                if (titleEl.length) title = titleEl.text().trim();
                const authorEl = card.find('a[href*="/user/"]').first();
                if (authorEl.length) author = authorEl.text().trim();
            }
            if (!title) title = $(this).text().trim();

            interceptedAwemes.set(id, {
                '视频ID': id,
                '视频链接': `https://www.douyin.com/video/${id}`,
                '视频标题': title,
                '作者': author,
                '作者ID': '',
                '时长': '',
                '点赞数': '',
                '评论数': '',
                '分享数': '',
                '播放量': '',
                '发布时间': '',
                '封面链接': ''
            });
            seenOrder.push(id);
        });
    }
}

// 抖音专用的滚动机制，确保兼容各种滚动容器
function douyinScroll(t) {
    console.log("DouyinURL提取Pro: 执行滚动...");
    window.scrollBy(0, 1000);
    const scrollContainers = document.querySelectorAll('*');
    scrollContainers.forEach(el => {
        if (el.scrollHeight > el.clientHeight && (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')) {
            el.scrollBy(0, 1000);
        }
    });
    setTimeout(() => {
        t({});
    }, 1500);
}
// ==================== 抖音专用代码结束 ====================

// 响应 popup.js 的消息请求
chrome.runtime.onMessage.addListener(function(e, t, o) {
    if ("findTables" === e.action) {
        o({
            tableId: 0,
            tableSelector: "body",
            robot: {
                next_page: false
            },
            href: window.location.href,
            hostname: window.location.hostname
        });
        return true;
    } else if ("getTableData" === e.action) {
        syncDOMToCache();
        const data = seenOrder.map(id => interceptedAwemes.get(id)).filter(Boolean);
        o({
            data: data,
            tableId: 0,
            tableSelector: "body",
            goodClasses: [],
            failedToProcess: false,
            processingError: null,
            href: window.location.href,
            hostname: window.location.hostname
        });
        return true;
    } else if ("scrollDown" === e.action) {
        douyinScroll(o);
        return true;
    }

    // 未匹配的消息，返回空响应
    o({});
});
/* DouyinURL提取Pro - content script */

function e(e){return Math.max.apply(null,Object.keys(e).map(function(t){return e[t]}))}function t(e,t){return(t||".")+e.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g,"\\$&").trim()}function o(e){return(e.attr("class")||"").trim().split(/\s+/).filter(function(e){return e.length>0})}function n(e){var t=$(e).children(),n={},r={};t.each(function(){if(!["script","img","meta","style"].includes(this.nodeName.toLowerCase())&&$(this).text().trim().length){var e=o($(this)).sort(),t=e.join(" ");t in r||(r[t]=0),r[t]++,e.forEach(function(e){e in n||(n[e]=0),n[e]++})}});var l=Object.keys(r).filter(function(e){return r[e]>=t.length/2-2});if(l.length||(l=Object.keys(n).filter(function(e){return n[e]>=t.length/2-2})),$(e).width()*$(e).height()>5e4&&t.length,!l.length||1===l.length&&""===l[0])return{children:t.filter(function(){return this.nodeName?!["script","img","meta","style"].includes(this.nodeName.toLowerCase())&&!!$(this).text().trim().length:(console.log("???",this),!1)}),goodClasses:[]};return{children:t.filter(function(){var e=!1,t=$(this);return l.forEach(function(o){e|=function(e,t){for(var o=t.split(" "),n=0;n<o.length;n++)if(!e.hasClass(o[n]))return!1;return!0}(t,o)}),e}),goodClasses:l}}var r=[],l=0,s=5;function a(e){e&&e.length;var t=$("body").width()*$("body").height();$("body *").each(function(){if(area=this.offsetWidth*this.offsetHeight,!(isNaN(area)||area<.02*t)){var e=n(this),o=e.children,l=o.length;if(!(isNaN(l)||l<3)){var s=area*l*l;r.push({table:this,goodClasses:e.goodClasses,area:area,children:o,text:o.text(),score:s,selector:w(this),type:"selector"})}}}),r=r.sort((e,t)=>t.score-e.score).slice(0,s),console.log("findTables:",r)}function i(){var e=(l+r.length-1)%r.length;$(r[e].table).removeClass("tablescraper-selected-table"),$(r[e].children).removeClass("tablescraper-selected-row"),$(r[l].table).addClass("tablescraper-selected-table"),$(r[l].children).addClass("tablescraper-selected-row")}function c(){$("*").removeClass("tablescraper-selected-table"),$("*").removeClass("tablescraper-selected-row")}function u(e){return e.clone().children().remove().end().text()}var h,d,f=new Set;function g(e){var t=sha256.create();return t.update(e),t.hex()}function m(e){if(null===localStorage.getItem("visited"))return!1;{const t=g(e),o=JSON.parse(localStorage.getItem("visited"));return o[o.length-1]===t||o[o.length-2]===t}}function v(e){null===localStorage.getItem("visited")&&localStorage.setItem("visited",JSON.stringify([]));const t=JSON.parse(localStorage.getItem("visited"));t.push(g(e)),localStorage.setItem("visited",JSON.stringify(t))}function p(e){for(;e.length;){if($(e).length)return $(e);e=e.split(">").slice(1).join(">")}return null}async function b(e,t){if(t){var s=p(t);if(console.log("getTableData:",t,s),!s)return e({error:"Table not found"}),void console.log("Table not found");r.length||(r=[{}]);var a=n(s),c=a.children;return m(c.text())?(e({error:"Table not changed. If the last page was not reached, try to increase crawl delay.",errorId:"finished"}),void console.log("Table not changed")):(r[l].table=s,r[l].children=c,r[l].goodClasses=a.goodClasses,r[l].text=c.text(),v(c.text()),i(),void b(e))}var h=[];r[l].children.each(function(){var e={},t=[];function n(o,n,r){if(o){var l=n+(r?" "+r:""),s=l,a=0;t.forEach(e=>{e==n&&a++}),a>1&&(s=l+" "+a),e[s]=o}}!function e(r,l,s){if(s.nodeName){var a=l+"/"+s.nodeName.toLowerCase()+o(r).map(e=>"."+e).join("");t.push(a),n(u(r).trim(),a),n(r.prop("href"),a,"href"),n(r.prop("src"),a,"src");
// 抖音特殊字段提取 - 唯一修改点
var douyinFields={
'aweme-id':['data-item-id','data-aweme-id','aweme-id'],
'video-url':['href','data-url','data-video-url'],
'author-id':['data-author-id','data-uid','uid'],
'title':['title','data-title','alt'],
'duration':['data-duration','duration'],
'likes':['data-like','data-likes','like-count'],
'views':['data-view','data-views','view-count'],
'comments':['data-comment','data-comments','comment-count'],
'shares':['data-share','data-shares','share-count'],
'publish-time':['data-time','data-publish-time','publish-time'],
'thumbnail':['data-thumb','data-thumbnail','poster'],
'description':['data-desc','data-description','description'],
'waterfall-id':['id']
};
Object.keys(douyinFields).forEach(function(field){
douyinFields[field].forEach(function(attr){
var value=null;
if(attr==='href'){value=r.prop('href');}
else if(attr==='src'){value=r.prop('src');}
else if(attr==='title'||attr==='alt'){value=r.attr(attr);}
else if(field==='waterfall-id'&&attr==='id'){
var idValue=r.attr('id');
if(idValue&&idValue.startsWith('waterfall_item_')){
value=idValue.replace('waterfall_item_','');
}
}
else{value=r.attr(attr)||r.data(attr.replace('data-',''));}
if(value){n(value,a,field);}
});
});
// 抖音特殊字段提取结束
r.children().each(function(){e($(this),a,this)})}else console.log("what???",s)}($(this),"",this),Object.keys(e).length&&h.push(e)}),e({data:h,tableId:l,tableSelector:r[l].selector,goodClasses:r[l].goodClasses,failedToProcess:false,processingError:null,href:window.location.href,hostname:window.location.hostname})}function w(e){return $(e).trigger("mouseleave"),$(e).trigger("blur"),$(e).parents().addBack().not("html").not("body").map(function(){var e=this.tagName.toLowerCase();return"string"==typeof this.id&&this.id.trim()&&!this.id.match(/\d+/g)?e+=t(this.id,"#"):"string"==typeof this.className&&this.className.trim()&&(e+=t(this.className).replace(/\s+/g,".")),e}).get().join(">")}function x(e){window.focus(),d=function(e){$(this).is($(e.target))&&($("*").removeClass("tablescraper-hover"),$(w(this)).last().addClass("tablescraper-hover"))};h=function(t){return t.preventDefault(),function(t){$("*").off("click",h).off("mouseenter",d),$(".tablescraper-hover").removeClass("tablescraper-hover"),$(".tablescraper-next-button").removeClass("tablescraper-next-button");var o=w(t.target);$(t.target).addClass("tablescraper-next-button"),console.log("Next button selector:",o),e({selector:o})}(t),!1},$("*").click(h).on("mouseenter",d)}var y=!1;function C(e){var t=document.createEvent("MouseEvents");t.initMouseEvent("mousedown",!0,!0,window,1,e.x,e.y,e.x,e.y,!1,!1,!1,!1,0,null);var o=document.createEvent("MouseEvents");o.initMouseEvent("click",!0,!0,window,1,e.x,e.y,e.x,e.y,!1,!1,!1,!1,0,null);var n=document.createEvent("MouseEvents");n.initMouseEvent("mouseup",!0,!0,window,1,e.x,e.y,e.x,e.y,!1,!1,!1,!1,0,null),e.dispatchEvent(t),e.dispatchEvent(o),e.dispatchEvent(n)}async function N(e,t){let o=e=>{return new Promise((t,o)=>{e.scrollTop+5>=50?t(!0):(e.scrollTop=e.scrollTop+50,setTimeout(()=>{let o=e.scrollTop+5>=50;t(o)},10))})},n=(e,t)=>new Promise((o,n)=>{e.scrollTop=e.scrollTop+t,setTimeout(()=>{o()},1e3)}),r=document.querySelector(e);for(;r;){if(await o(r))break;r=r.parentElement}if(console.log("Element with scrollbar"),console.log(r),!r)return void t({error:"No element with a scrollbar found"});let l=!1,s=!1,a=$(e).children().length,i=r.scrollTop;for(;!l&&!s;)await n(r,1e3),l=a!=$(e).children().length,s=r.scrollTop==i,i=r.scrollTop;t({})}function T(){return new Promise(function(e,t){console.log("Scrolling down"),$("html, body").animate({scrollTop:$(document).height()},5e3),setTimeout(()=>{e()},5e3)})}function E(e){return new Promise(function(t,o){var n=$(e.rows),s=0,a=50;n.length*a>3e3&&(a=3e3/n.length),a<10&&(a=10),console.log("Lazy scrolling",n.length,a);var c=setInterval(function(){var o=$(e.rows);if(o.length>n.length&&r[l].robot.next_page&&((n=o).addClass("tablescraper-selected-row"),i()),s>=n.length||s*a>1e4)return clearInterval(c),void t();console.log("Scrolling to: ",n[s]),n[s].scrollIntoView(!1),s++},a)})}function S(e,t,o){var n=function(e){for(;e.length;){if($(e).length)return $(e);e=e.split(">").slice(1).join(">")}return null}(e);return n?(n.last().addClass("tablescraper-next-button"),o?t({}):($("*").off("click",h).off("mouseenter",d),void setTimeout(function(){t({}),C(n.last()[0])},100))):t(o?{error:"Next button not found",errorId:"error"}:{error:"No more next buttons: Finished crawling. Download CSV or Excel file",errorId:"finished"})}function I(e){let t=document.documentElement.innerHTML;e({html:t=t.replace(/<\/?(!--)?(html|body|StartFragment|EndFragment)-*>/g,"")})}function j(e,t,o){let n=(t=t.replace(".tablescraper-selected-row","").split(" "))[0].split("/").filter(e=>e).slice(1).map(e=>e.split(".").map(e=>$.escapeSelector(e)).join("."));for(var r=0;r<n.length;r++){let t=e+" "+n.slice(0,r+1).join(">"),o=t+':not([class]:not([class=""]))';n[r].includes(".")||selectors_equivalent(t,o)||(n[r]=n[r]+':not([class]:not([class=""]))')}n=n.join(">");let l="";isNaN(t[t.length-1])?n.length>0&&(l=":eq(0)"):l=`:eq(${+t[t.length-1]-1})`;n+=l;o({selector:n})}// ==================== 抖音特殊适配代码 ====================
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
// ==================== 抖音特殊适配代码结束 ====================

chrome.runtime.onMessage.addListener(function(e,t,o){
    if (window.location.hostname.includes('douyin.com')) {
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
    }

    // 通用逻辑（非抖音页面）
    return"nextTable"==e.action||"findTables"==e.action?("findTables"==e.action?(r=[],a(e.robots)):(r.filter(e=>!e.robot).length||a(),l=(l+1)%r.length),i(),localStorage.removeItem("visited"),o({tableId:l,tableSelector:r[l].selector,robot:r[l].robot,href:window.location.href,hostname:window.location.hostname}),!0):"getTableData"==e.action?(b(o,e.selector),!0):"getNextButton"==e.action?(x(o),!0):"clickNext"==e.action?(S(e.selector,o),!0):"scrollDown"===e.action?(c(),N(e.selector,o),!0):"markNextButton"==e.action?(S(e.selector,o,!0),!0):void o({})
});
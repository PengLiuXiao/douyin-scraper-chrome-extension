/* DouyinURL提取Pro - popup controller */

function triggerDownload(blob, filename) {
  var subfolder = (s.config && s.config.downloadFolder) ? s.config.downloadFolder.trim() : "douyin-url-extractor";
  var finalFilename = filename;
  if (subfolder) {
    var cleanSubfolder = subfolder.replace(/[\\:*?"<>|]/g, '');
    finalFilename = cleanSubfolder + "/" + filename;
  }
  
  var url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: finalFilename,
    conflictAction: 'uniquify'
  }, function(downloadId) {
    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, 10000);
  });
}

function e(e, t, n, o, r, a, i) {
  var s = {},
    c = null,
    l = !1,
    d = !1,
    f = {
      urls: ["<all_urls>"],
      tabId: n,
      types: [
        "main_frame",
        "sub_frame",
        "stylesheet",
        "script",
        "font",
        "object",
        "xmlhttprequest",
        "other",
      ],
    };
  function u() {
    !l &&
      d &&
      (
        i ||
        function (e) {
          e(!0);
        }
      )(function (e) {
        if (!e) return g();
        l ||
          ((l = !0),
          chrome.webRequest.onBeforeRequest.removeListener(p),
          chrome.webRequest.onCompleted.removeListener(h),
          chrome.webRequest.onErrorOccurred.removeListener(h),
          t());
      });
  }
  function p(e) {
    ((s[e.requestId] = 1), (c = new Date()));
  }
  function h(e) {
    c && (delete s[e.requestId], Object.keys(s).length || g());
  }
  function g() {
    setTimeout(function () {
      new Date() - c < r || Object.keys(s).length || u();
    }, r);
  }
  (chrome.webRequest.onBeforeRequest.addListener(p, f),
    chrome.webRequest.onCompleted.addListener(h, f),
    chrome.webRequest.onErrorOccurred.addListener(h, f),
    (
      e ||
      function (e) {
        e();
      }
    )(function () {
      (setTimeout(u, o),
        setTimeout(function () {
          ((d = !0), g());
        }, a));
    }));
}
function t(e, t) {
  return (
    t && (e += 1462),
    (Date.parse(e) - new Date(Date.UTC(1899, 11, 30))) / 864e5
  );
}
function n(e, n) {
  for (
    var o = {}, r = { s: { c: 1e7, r: 1e7 }, e: { c: 0, r: 0 } }, a = 0;
    a != e.length;
    ++a
  )
    for (var i = 0; i != e[a].length; ++i) {
      (r.s.r > a && (r.s.r = a),
        r.s.c > i && (r.s.c = i),
        r.e.r < a && (r.e.r = a),
        r.e.c < i && (r.e.c = i));
      var s = { v: e[a][i] };
      if (null !== s.v) {
        var c = XLSX.utils.encode_cell({ c: i, r: a });
        ("number" == typeof s.v
          ? (s.t = "n")
          : "boolean" == typeof s.v
            ? (s.t = "b")
            : s.v instanceof Date
              ? ((s.t = "n"), (s.z = XLSX.SSF._table[14]), (s.v = t(s.v)))
              : (s.t = "s"),
          (o[c] = s));
      }
    }
  return (r.s.c < 1e7 && (o["!ref"] = XLSX.utils.encode_range(r)), o);
}
function o(e, t) {
  e.data.unshift(e.fields);
  var o = new (function e() {
      if (!(this instanceof e)) return new e();
      ((this.SheetNames = []), (this.Sheets = {}));
    })(),
    r = n(e.data);
  return (
    o.SheetNames.push(t),
    (o.Sheets[t] = r),
    XLSX.write(o, { type: "binary" })
  );
}
function r(e) {
  try {
    e();
  } catch (e) {
    console.log("Error: ", e);
  }
}
var a = { fireEvent: function () {}, firePageViewEvent: function () {} };
var i = { id: null, url: null },
  s = {},
  c = 1e3,
  l = null;

// tab 状态存储
var tabStates = {};

// 从URL参数获取tab信息
function getUrlParams() {
  var params = new URLSearchParams(window.location.search);
  return {
    tabid: params.get("tabid"),
    url: decodeURIComponent(params.get("url") || ""),
  };
}

// 初始化tab信息
var urlParams = getUrlParams();
if (urlParams.tabid && urlParams.url) {
  i.id = parseInt(urlParams.tabid);
  i.url = urlParams.url;
  // 启动初始化
  d();
} else {
  // 侧边栏模式：初始化当前激活的标签页
  initActiveTab();
}

async function initActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab) {
    switchToTab(tab.id, tab.url);
  }
}

function switchToTab(tabId, url) {
  // 如果正在采集同一标签页同一 URL，不做处理
  if (i.id === tabId && i.url === url) return;

  // 保存当前 tab 状态
  if (i.id) {
    s.keyword = $("#douyinSearchKeyword").val();
    tabStates[i.id] = JSON.parse(JSON.stringify(s));
  }

  // 更新当前标签页信息
  i.id = tabId;
  i.url = url;

  // 恢复或初始化状态
  if (tabStates[tabId]) {
    s = tabStates[tabId];
    // 恢复 UI 控件
    $("#douyinSearchKeyword").val(s.keyword || "");
    $("#crawlDelay").val((s.config.crawlDelay || 1500) / 1000);
    $("#maxWait").val((s.config.maxWait || 20000) / 1000);
    $("#stopTimeLimit").val(s.config.stopTimeLimit || 15);
    $("#stopScrollLimit").val(s.config.stopScrollLimit || 3);
    $("#downloadFolder").val(s.config.downloadFolder || 'douyin-url-extractor');
  } else {
    // 初始化空状态
    s = {
      data: [],
      pages: 0,
      lastRows: 0,
      workingTime: 0,
      scraping: false,
      failedToProcess: false,
      processingError: null,
      tableSelector: "",
      startingUrl: "",
      hostName: "",
      previewLength: 0,
      configName: "",
      config: {
        headers: {},
        deletedFields: {},
        crawlDelay: 1500,
        maxWait: 20000,
        stopTimeLimit: 15,
        stopScrollLimit: 3,
        downloadFolder: 'douyin-url-extractor'
      }
    };
    $("#douyinSearchKeyword").val("");
    $("#downloadFolder").val('douyin-url-extractor');
  }

  // 启动初始化
  d();
}

// 监听标签页切换
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.active) {
      switchToTab(tab.id, tab.url);
    }
  } catch (err) {
    console.warn("Get active tab error:", err);
  }
});

// 监听标签页 URL 更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === i.id && changeInfo.url) {
    switchToTab(tabId, changeInfo.url);
  }
});

// 监听标签页关闭，释放内存
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabStates[tabId];
});

async function d() {
  if (!i.url || !i.url.toLowerCase().includes('douyin.com')) {
    $("#waitHeader").hide();
    p("DouyinURL提取Pro 仅支持抖音网站（douyin.com），请先在浏览器中打开抖音页面再使用本扩展。", "noResponseErr", false, false);
    $("#content").hide();
    $("#wait").show();
    return;
  }
  $("#noResponseErr").hide().text("");
  $("#waitHeader").hide();
  $("#wait").hide();
  $("#content").show();

  $(window).off("resize").on("resize", function () {
    v();
  });

  // 如果已经有缓存的数据，直接恢复 UI 并渲染表格，无需重新获取
  if (s.data && s.data.length > 0) {
    v();
    q();
    if (s.scraping) {
      $("#startScraping").hide();
      $("#stopScraping").show();
    } else {
      $("#startScraping").show();
      $("#stopScraping").hide();
    }
  } else {
    // 否则正常查找页面表格
    setTimeout(function () {
      console.log("no response");
      $("#waitHeader").is(":visible") && y(true);
    }, 5e4);
    R();
  }
}
function f(e, t) {
  return (t || ".") + e.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
}
function u(e) {
  for (
    var t = window.location.search.substring(1).split("&"), n = 0;
    n < t.length;
    n++
  ) {
    var o = t[n].split("=");
    if (decodeURIComponent(o[0]) == e) return decodeURIComponent(o[1]);
  }
}
function p(e, t, n, o) {
  if ("" === e) return $("#" + t).hide();
  ($("#" + t)
    .show()
    .text(e),
    n && console.log(e),
    o && a.fireEvent("Error", { url: s.startingUrl || i.url, msg: e }));
}
function h(e) {
  var t = e.length,
    n = { "": 1 / 0 },
    o = {},
    r = {},
    a = {},
    i = {};
  function c(e) {
    return e in n ? n[e] : ((n[e] = $(f(e)).length), n[e]);
  }
  (e.forEach(function (e) {
    for (var t in e) (t in o || (o[t] = 0), o[t]++);
  }),
    Object.keys(o)
      .map(function (e) {
        return [o[e], e];
      })
      .forEach(function ([n, o]) {
        var s = "",
          l = 1 / 0;
        o.split(" ")[0]
          .split("/")
          .slice(1)
          .reverse()
          .forEach(function (e) {
            e.split(".")
              .slice(1)
              .forEach(function (e) {
                l < 2 * t || c(e) >= l || ((s = e), (l = c(e)));
              });
          });
        var d = o.split(" ")[1],
          f = 0,
          u = e.map(function (e) {
            return o in e;
          });
        (d && isNaN(d) && (s += " " + d),
          s in r
            ? (r[s].forEach(function (e, t) {
                if (!f) {
                  var n = !0;
                  (e.forEach(function (e, t) {
                    n &= !(u[t] && e);
                  }),
                    n && (f = t + 1));
                }
              }),
              f
                ? (r[s][f - 1] = r[s][f - 1].map(function (e, t) {
                    return u[t] || e;
                  }))
                : (r[s].push(u), (f = r[s].length)),
              f > 1 && (s += " " + f))
            : (r[s] = [u]),
          s in a || (a[s] = []),
          a[s].push(o),
          s in i || (i[s] = 0),
          (i[s] += n));
      }));
  var l = {},
    d = {
      fields: (r = Object.keys(a).filter(function (n) {
        var o = {},
          r = [];
        return (
          !(n in s.config.deletedFields) &&
          (e.map(function (e) {
            for (var t, i = 0; i < a[n].length; i++)
              a[n][i] in e && ((t = e[a[n][i]]) in o || (o[t] = 0), o[t]++);
            r.push(t);
          }),
          Object.keys(o).length && o[Object.keys(o)[0]] == t
            ? (0, !1)
            : (r = JSON.stringify(r)) in l
              ? (0, !1)
              : ((l[r] = 1), !(i[n] < 0.2 * t) || (0, !1)))
        );
      })),
      data: e.map(function (e) {
        return r.map(function (t) {
          for (var n = 0; n < a[t].length; n++)
            if (a[t][n] in e) return e[a[t][n]];
          return "";
        });
      }),
    };
  return ((s.names = r), (s.namePaths = a), d);
}
function g(e) {
  return e.map(function (e) {
    return e in s.config.headers ? s.config.headers[e] : e;
  });
}
function w(e) {
  var t = h(e);
  return ((t.fields = g(t.fields)), t);
}
function m(e) {
  for (
    var t = new ArrayBuffer(e.length), n = new Uint8Array(t), o = 0;
    o != e.length;
    ++o
  )
    n[o] = 255 & e.charCodeAt(o);
  return t;
}
function b() {
  (a.fireEvent("Download", {
    hostName: s.hostName,
    startingUrl: s.startingUrl,
    dataLength: s.data.length,
  }),
    (() => {
      let e = (e) => {
          let t = {};
          for (let n = 0; n < 4; n++)
            void 0 !== e[n]
              ? (t[`selector${n}`] = e[n])
              : (t[`selector${n}`] = "");
          return t;
        },
        t = Object.keys(s.config.headers).length;
      t &&
        j(!0).then((n) => {
          let [o, r] = n;
          const i = (e) => r.find((t) => t.field_id === e);
          let c = {
            tableId: s.tableId,
            hostName: s.hostName,
            startingUrl: s.startingUrl,
          };
          if (t)
            for (name in s.config.headers) {
              let t = i(s.config.headers[name])
                  .selector.split(",")
                  .map((e) => e.slice(-100)),
                n = Object.assign(e(t), c, {
                  originalName: name,
                  newName: s.config.headers[name],
                });
              a.fireEvent("RenameColumn", n);
            }
        });
    })());
}
function v() {
  var e = h(s.data);
  ((e.data = e.data.slice(0, c)), (s.previewLength = e.data.length));
  var t = $(".wtHolder").scrollTop(),
    n = $(".wtHolder").scrollLeft(),
    o = !1;
  $("#hot").empty();
  new Handsontable($("#hot").get(0), {
    licenseKey: "non-commercial-and-evaluation",
    data: e.data,
    colHeaders: g(e.fields),
    wordWrap: !1,
    manualColumnResize: !0,
    width: $(window).width() - 20,
    height: $(window).height() - $("#hot").get(0).getBoundingClientRect().y,
    afterRender: function () {
      o ||
        ((o = !0), $(".wtHolder").scrollTop(t), $(".wtHolder").scrollLeft(n));
    },
    modifyColWidth: function (e, t) {
      if (e > 300) return 300;
    },
    afterGetColHeader: function (t, n) {
      if (-1 != t) {
        $(n).children().length > 1
          ? $(".hot-header", n).remove()
          : $(n).click(function () {
              var e = this;
              setTimeout(function () {
                $(".header-input", e).trigger("focus");
              }, 20);
            });
        var o = $("<div>", { class: "hot-header" }),
          r = $("<div>", { class: "header-input", contenteditable: "true" });
        (s.config.headers[e.fields[t]]
          ? r.text(s.config.headers[e.fields[t]])
          : r.text(n.firstChild.textContent),
          $(n).append(o),
          o.append(r),
          o.append(
            $("<span>", {
              class: "glyphicon glyphicon-remove remove-column",
              style: "padding-top: 2.5px",
            }).click(function () {
              ((s.config.deletedFields[e.fields[t]] = !0),
                S(),
                $("#resetColumns").show(),
                v());
            }),
          ),
          r.get(0).addEventListener("input", function (n) {
            ((s.config.headers[e.fields[t]] = r.text()), S());
          }),
          (n.firstChild.style.display = "none"));
      }
    },
    beforeOnCellMouseDown: function (e, t, n) {
      t.row < 0 && e.stopImmediatePropagation();
    },
  });
}
function S() {
  localStorage.setItem(s.configName, JSON.stringify(s.config));
}
function y(e) {
  $("#waitHeader").hide();
  p("页面响应超时，请刷新抖音页面后重试。", "noResponseErr", false, false);
  $("#douyinSearchBtn").prop("disabled", false);
  $("#startScraping").prop("disabled", false);
}
function k() {
  return localStorage.getItem("nextSelector:" + s.hostName);
}
function x(e, t) {
  if (!e)
    return i.reloaded
      ? y()
      : ((i.reloaded = !0),
        chrome.tabs.reload(i.id, {}, function () {
          chrome.tabs.onUpdated.addListener(function e(t, n) {
            "complete" === n.status &&
              t === i.id &&
              (chrome.tabs.onUpdated.removeListener(e), R());
          });
        }));
  $("#noResponseErr").hide().text("");
  ((s.tableId = e.tableId),
    (s.scraping = !1),
    (s.failedToProcess = !1),
    (s.processingError = null),
    (s.tableSelector = e.tableSelector),
    (s.startingUrl = e.href),
    (s.hostName = e.hostname),
    (s.previewLength = 0),
    (s.configName = e.hostname + "-config"),
    (() => {
      var savedConfig = JSON.parse(localStorage.getItem(s.configName)) || {};
      s.config = {
        headers: savedConfig.headers || {},
        deletedFields: savedConfig.deletedFields || {},
        crawlDelay: 1500,
        maxWait: 20000,
        stopTimeLimit: 15,
        stopScrollLimit: 3,
        downloadFolder: 'douyin-url-extractor'
      };
      S();
    })(),
    $("#crawlDelay").val(s.config.crawlDelay / 1e3),
    $("#maxWait").val(s.config.maxWait / 1e3),
    $("#stopTimeLimit").val(s.config.stopTimeLimit),
    $("#stopScrollLimit").val(s.config.stopScrollLimit),
    $("#downloadFolder").val(s.config.downloadFolder),
    r(
      t
        ? () => a.firePageViewEvent(s.hostName, s.startingUrl)
        : () =>
            a.fireEvent("AnotherTable", {
              hostName: s.hostName,
              startingUrl: s.startingUrl,
            }),
    ),
    Object.keys(s.config.deletedFields).length && $("#resetColumns").show());
  var n = N(i.url);
  if (s.hostName && s.hostName.includes("douyin.com")) {
    const searchMatch = s.startingUrl.match(/\/search\/([^/?#]+)/);
    if (searchMatch) {
      try {
        n = "douyin_search_" + decodeURIComponent(searchMatch[1]);
      } catch (e) {}
    } else if (s.startingUrl.includes("/user/")) {
      n = "douyin_user_videos";
    } else {
      n = "douyin_videos";
    }
    const now = new Date();
    const dateStr =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "_" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0");
    n += "_" + dateStr;
    $("#startScraping").show();
    $("#douyinSearchPanel").show();
    $("#douyinSearchBtn").show();
    $("#importKeywordsBtn").show();
  }
  chrome.tabs.sendMessage(i.id, { action: "getTableData" }, function (e) {
    if (chrome.runtime.lastError) {
      console.warn("x: getTableData error:", chrome.runtime.lastError.message);
      p("获取数据时出错，请刷新页面重试。", "noResponseErr", !0);
      return;
    }
    if (e && !e.error) {
      $("#noResponseErr").hide().text("");
    }
    e && e.error
      ? p("获取数据时出错，请刷新页面重试。", "noResponseErr", !0)
      : e.tableId == s.tableId &&
        (e.failedToProcess
          ? (p(
              "Failed to process rows on server. Showing raw data instead.",
              "error",
              !1,
            ),
            (s.failedToProcess = !0),
            (s.processingError = e.processingError))
          : ($("#error").hide(), (s.failedToProcess = !1)),
        s.pages || s.config.infinateScrollChecked || $("#nextButton").show(),
        s.pages ||
          ((s.nextSelector = k()),
          s.nextSelector &&
            chrome.tabs.sendMessage(
              i.id,
              { action: "markNextButton", selector: s.nextSelector },
              function (e) {
                if (chrome.runtime.lastError) {
                  console.warn("markNextButton error:", chrome.runtime.lastError.message);
                } else if (e) {
                  e.error || $("#startScraping").show();
                }
              },
            )),
        $("#wait").hide(),
        $("#content").show(),
        $("#douyinSearchBtn").prop("disabled", false),
        $("#startScraping").prop("disabled", false),
        p(
          '可点击“开始爬取”滚动采集更多数据，或直接下载已获取的数据。',
          "instructions",
        ),
        (s.data = e.data),
        (s.pages = 1),
        (s.lastRows = e.data.length),
        (s.tableSelector = e.tableSelector),
        (s.goodClasses = e.goodClasses),
        (s.workingTime = 0),
        q(),
        $(".download-button").show(),
        v(),
        s.autoStartScraping && ((s.autoStartScraping = !1), setTimeout(T, 1e3)),
        $("#csv")
          .off("click")
          .click(function () {
            (console.log("Downloading CSV..."), r(b));
            let e = w(s.data);
            (e.data.forEach((t, n) => {
              t.forEach((t, o) => {
                Array.isArray(t) &&
                  (e.data[n][o] = Papa.unparse([t], {
                    quotes: !0,
                    escapeChar: '"',
                  }));
              });
            }),
              triggerDownload(
                new Blob([Papa.unparse(e, { quotes: !0, escapeChar: '"' })], {
                  type: "application/octet-stream",
                }),
                n + ".csv",
              ));
          }),
        $("#xlsx")
          .off("click")
          .click(function () {
            (r(b),
              triggerDownload(
                new Blob([m(o(w(s.data), i.url.substring(0, 100)))], {
                  type: "application/octet-stream",
                }),
                n + ".xlsx",
              ));
          }),
        $("#copy")
          .off("click")
          .click(function () {
            (r(b),
              E(Papa.unparse(w(s.data), { delimiter: "\t" })));
          }));
  });
}
function N(e) {
  var t = new URL(e).hostname.split(".");
  return t[0].indexOf("www") > -1 ? t[1] : t[0];
}
function E(e) {
  navigator.clipboard.writeText(e).catch(function(err) {
    console.error('DouyinURL提取Pro: 复制失败', err);
  });
}
function R() {
  chrome.tabs.sendMessage(
    i.id,
    { action: "findTables", robots: l },
    function (e) {
      if (chrome.runtime.lastError) {
        console.warn("R: findTables error:", chrome.runtime.lastError.message);
        x(null, !0);
      } else {
        x(e, !0);
      }
    },
  );
}
function C() {
  return true; // 抖音模式始终使用无限滚动
}
function D(e) {
  s.data = s.data.concat(e);
  var t = new Set();
  (s.data.forEach((e) => t.add(JSON.stringify(e))),
    (s.data = Array.from(t, (e) => JSON.parse(e))));
}
function T() {
  var noNewDataCount = 0;
  var lastNewDataTime = new Date();
  $("#noResponseErr").hide().text("");
  ((s.gettingNext = !1),
    (s.scraping = !0),
    $("#startScraping").hide(),
    $("#stopScraping").show(),
    p("", "error"));
  p('正在滚动采集中，请等待或点击“停止爬取”…', "instructions");
  C() && $("#infinateScrollElement").hide();
  var t = new Date();
  !(function n() {
    const o = function (e) {
      let t = { action: "scrollDown", selector: s.tableSelector };
      chrome.tabs.sendMessage(i.id, t, function (t) {
        if (chrome.runtime.lastError) {
          console.warn("scrollDown error:", chrome.runtime.lastError.message);
          return;
        }
        if (t && t.error)
          return (p("", "instructions"), p(t.error, t.errorId || "error", !0));
        ($("#wrongTable").hide(), e());
      });
    };
    var r = function (e) {
      chrome.tabs.sendMessage(
        i.id,
        { action: "clickNext", selector: s.nextSelector },
        function (t) {
          if (chrome.runtime.lastError) {
            console.warn("clickNext error:", chrome.runtime.lastError.message);
            return;
          }
          if (t && t.error)
            return (p("", "instructions"), p(t.error, t.errorId, !0));
          ($("#wrongTable").hide(), e());
        },
      );
    };
    (C() && (r = o),
      e(
        r,
        function () {
          chrome.tabs.sendMessage(
            i.id,
            { action: "getTableData", selector: s.tableSelector },
            function (e) {
              if (chrome.runtime.lastError) {
                console.warn("getTableData error:", chrome.runtime.lastError.message);
                return;
              }
              if (e) {
                if (e.error)
                  return (
                    p("", "instructions"),
                    p(e.error, e.errorId || "error", !0)
                  );
                if (e.failedToProcess) {
                  p("Failed to process rows. Showing raw data instead.", "error", !1);
                  s.failedToProcess = !0;
                  s.processingError = e.processingError;
                } else {
                  $("#error").hide();
                  s.failedToProcess = !1;
                }
                s.lastRows = e.data.length;
                s.pages++;
                s.workingTime += new Date() - t;
                t = new Date();

                var prevLength = s.data.length;
                D(e.data);
                var currentLength = s.data.length;

                if (currentLength > prevLength) {
                  noNewDataCount = 0;
                  lastNewDataTime = new Date();
                } else {
                  noNewDataCount++;
                }

                q();
                if (s.previewLength < c) {
                  v();
                } else {
                  p("预览仅显示前 1000 条，完整数据请下载。", "previewLimit");
                }

                var secondsSinceLastNewData = (new Date() - lastNewDataTime) / 1000;
                if (noNewDataCount >= s.config.stopScrollLimit || secondsSinceLastNewData >= s.config.stopTimeLimit) {
                  s.scraping = false;
                  $("#startScraping").show();
                  $("#stopScraping").hide();
                  if (typeof batchState !== 'undefined' && batchState.running) {
                    console.log("检测到页面无新增，已自动停止采集（批量模式）。");
                  } else {
                    p("检测到页面无新增，已自动停止采集。", "instructions");
                  }
                  return;
                }

                if (s.scraping) {
                  n();
                }
              }
            },
          );
        },
        i.id,
        s.config.maxWait,
        100,
        s.config.crawlDelay,
        function (e) {
          chrome.tabs.sendMessage(i.id, {}, function (t) {
            if (chrome.runtime.lastError) {
              e(false);
            } else {
              e(void 0 !== t);
            }
          });
        },
      ));
  })();
}
function I() {
  ($("#stopScraping").click(L),
    $("#crawlDelay").bind(
      "propertychange change click keyup input paste",
      function () {
        var e = $(this).val();
        if (isNaN(e) || e < 0 || parseInt(1e3 * e) >= s.config.maxWait)
          return p("Bad min waiting value", "inputError");
        (p("", "inputError"), (s.config.crawlDelay = parseInt(1e3 * e)), S());
      },
    ),
    $("#maxWait").bind(
      "propertychange change click keyup input paste",
      function () {
        var e = $(this).val();
        if (isNaN(e) || parseInt(1e3 * e) <= s.config.crawlDelay)
          return p("Bad max waiting value", "inputError");
        (p("", "inputError"), (s.config.maxWait = parseInt(1e3 * e)), S());
      },
    ),
    $("#stopTimeLimit").bind(
      "propertychange change click keyup input paste",
      function () {
        var e = $(this).val();
        if (isNaN(e) || e < 5 || e > 60)
          return p("停止时间上限范围为 5 至 60 秒", "inputError");
        (p("", "inputError"), (s.config.stopTimeLimit = parseInt(e)), S());
      },
    ),
    $("#stopScrollLimit").bind(
      "propertychange change click keyup input paste",
      function () {
        var e = $(this).val();
        if (isNaN(e) || e < 1 || e > 10)
          return p("连续无新增次数范围为 1 至 10 次", "inputError");
        (p("", "inputError"), (s.config.stopScrollLimit = parseInt(e)), S());
      },
    ),
    $("#downloadFolder").bind(
      "propertychange change click keyup input paste",
      function () {
        var e = $(this).val().trim();
        var clean = e.replace(/[\\:*?"<>|]/g, '');
        (s.config.downloadFolder = clean, S());
      },
    ),
    $("#crawlDelay").on("blur change", function () {
      var val = parseFloat($(this).val());
      if (isNaN(val) || val < 0) {
        $(this).val(0);
        s.config.crawlDelay = 0;
        S();
        p("", "inputError");
      } else {
        var maxWaitSec = s.config.maxWait / 1000;
        if (val >= maxWaitSec) {
          var clamped = Math.max(0, maxWaitSec - 1);
          $(this).val(clamped);
          s.config.crawlDelay = Math.round(clamped * 1000);
          S();
          p("", "inputError");
        }
      }
    }),
    $("#maxWait").on("blur change", function () {
      var val = parseFloat($(this).val());
      var minWaitSec = s.config.crawlDelay / 1000;
      if (isNaN(val) || val <= minWaitSec) {
        var clamped = minWaitSec + 1;
        $(this).val(clamped);
        s.config.maxWait = Math.round(clamped * 1000);
        S();
        p("", "inputError");
      }
    }),
    $("#stopTimeLimit").on("blur change", function () {
      var val = parseInt($(this).val());
      if (isNaN(val)) {
        $(this).val(s.config.stopTimeLimit);
        p("", "inputError");
      } else if (val < 5) {
        $(this).val(5);
        s.config.stopTimeLimit = 5;
        S();
        p("", "inputError");
      } else if (val > 60) {
        $(this).val(60);
        s.config.stopTimeLimit = 60;
        S();
        p("", "inputError");
      }
    }),
    $("#stopScrollLimit").on("blur change", function () {
      var val = parseInt($(this).val());
      if (isNaN(val)) {
        $(this).val(s.config.stopScrollLimit);
        p("", "inputError");
      } else if (val < 1) {
        $(this).val(1);
        s.config.stopScrollLimit = 1;
        S();
        p("", "inputError");
      } else if (val > 10) {
        $(this).val(10);
        s.config.stopScrollLimit = 10;
        S();
        p("", "inputError");
      }
    }),
    $("#resetColumns").click(function () {
      ((s.config.deletedFields = {}), S(), $("#resetColumns").hide(), v());
    }),
    $("#douyinSearchBtn").click(function () {
      var keyword = $("#douyinSearchKeyword").val().trim();
      if (!keyword) {
        alert("请输入搜索关键词！");
        return;
      }
      $("#noResponseErr").hide().text("");
      s.autoStartScraping = !0;
      s.data = [];
      s.pages = 0;
      s.lastRows = 0;
      s.workingTime = 0;
      $("#douyinSearchBtn").prop("disabled", true);
      $("#startScraping").prop("disabled", true);
      p("正在跳转并初始化搜索，请稍候...", "instructions");

      var targetUrl = "https://www.douyin.com/search/" + encodeURIComponent(keyword) + "?type=video";

      function listener(tabId, changeInfo) {
        if (changeInfo.status === 'complete' && tabId === i.id) {
          chrome.tabs.onUpdated.removeListener(listener);
          i.url = targetUrl;
          setTimeout(function () {
            R();
          }, 1500);
        }
      }
      chrome.tabs.onUpdated.addListener(listener);
      chrome.tabs.update(i.id, { url: targetUrl });
    }),
    $("#douyinSearchKeyword").keypress(function (e) {
      13 === e.which && $("#douyinSearchBtn").click();
    }));
}
function L(e = null) {
  ((s.scraping = !1),
    console.log("Scraping stopped."),
    $("#startScraping").show(),
    $("#stopScraping").hide(),
    p(
      "已停止爬取，可下载数据或继续采集。",
      "instructions",
    ));
}
function q() {
  $("#stats")
    .empty()
    .append($("<div>", { text: "已采集页数：" + s.pages }))
    .append($("<div>", { text: "收集视频数：" + s.data.length }))
    .append($("<div>", { text: "本次新增：" + s.lastRows }))
    .append(
      $("<div>", {
        text: "已运行：" + parseInt(s.workingTime / 1e3) + "s",
      }),
    );
}
async function j(e = !1) {
  var t = s.tableSelector.replace(".tablescraper-selected-table", ""),
    n = [];
  (s.goodClasses
    .map((e) =>
      e
        .split(" ")
        .map((e) => "." + e)
        .join(""),
    )
    .forEach((e) => {
      (e = e.replace(/.tablescraper-selected-row/g, "")).length &&
        n.push(t + " " + e + ":not(:empty)");
    }),
    n.length || n.push(t + " > *:not(:empty)"));
  var o = n.join(","),
    r = [];
  let a = s.names;
  for (var i of (e && (a = a.concat(Object.keys(s.config.deletedFields))), a)) {
    var c = s.namePaths[i];
    let e = { target: "text" };
    ((e.field_id = i),
      (e.param = ""),
      s.config.headers[i] && (e.field_id = s.config.headers[i]));
    let t = [];
    for (var l of c) {
      let n = "";
      try {
        (console.log("Picking selector..."), (n = await U(o, l)));
      } catch (e) {
        console.log(e);
      }
      (console.log("Selector picked: ", n),
        t.push(n),
        (l = l.split(" ")).filter((e) => "href" == e).length &&
          ((e.target = "prop"), (e.param = "href")),
        l.filter((e) => "src" == e).length &&
          ((e.target = "prop"), (e.param = "src")));
    }
    ((e.selector = t.join(",")), r.push(e));
  }
  return [o, r];
}
function U(e, t) {
  return new Promise((n, o) => {
    chrome.tabs.sendMessage(
      i.id,
      { action: "chooseSelector", rowSelector: e, path: t },
      function (e) {
        e ? n(e.selector) : o(new Error("Could not choose selector!"));
      },
    );
  });
}
$("#startScraping").click(function () {
  var keyword = $("#douyinSearchKeyword").val().trim();
  if (keyword) {
    var decodedUrl = "";
    try {
      decodedUrl = decodeURIComponent(i.url || "");
    } catch (e) {
      decodedUrl = i.url || "";
    }
    var searchPath = "/search/" + keyword;
    if (decodedUrl.includes(searchPath)) {
      // 已经在搜索该关键词的页面，直接开始爬取
      T();
    } else {
      // 不在对应的搜索页面，触发搜索并提取
      $("#douyinSearchBtn").click();
    }
  } else {
    // 没有输入关键词，直接爬取当前页面
    T();
  }
});

/* ============================================================
   批量关键词导入搜索 — Batch Keyword Import & Search
   ============================================================ */

// ---------- 状态对象 ----------
var batchState = {
  keywords: [],          // string[]
  results: {},           // { keyword: rowArray }
  statuses: {},          // { keyword: 'pending'|'running'|'done'|'failed' }
  currentIndex: 0,
  running: false,
  saveDir: null,         // FileSystemDirectoryHandle | null
  startDate: null,
  stableCheckTimer: null,
  lastDataLen: 0,
  stableCount: 0,
};

// ---------- 文件解析 ----------
function parseKeywordFile(file) {
  return new Promise(function (resolve, reject) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: function (res) {
          resolve(extractKeywordsFromTable(res.data));
        },
        error: reject,
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          var ws = wb.Sheets[wb.SheetNames[0]];
          var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          resolve(extractKeywordsFromTable(rows));
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('不支持的文件格式，请上传 CSV 或 XLSX 文件。'));
    }
  });
}

function extractKeywordsFromTable(rows) {
  if (!rows || rows.length === 0) return [];
  var header = rows[0];
  var colIndex = 0;
  // 自动识别列
  for (var ci = 0; ci < header.length; ci++) {
    var h = String(header[ci]).trim().toLowerCase();
    if (h === '关键词' || h === 'keyword' || h === 'keywords') {
      colIndex = ci;
      break;
    }
  }
  // 判断第一行是否为表头
  var startRow = 1;
  var firstCell = String(header[colIndex]).trim().toLowerCase();
  if (firstCell === '关键词' || firstCell === 'keyword' || firstCell === 'keywords') {
    startRow = 1;
  } else {
    // 无表头，从第0行读
    startRow = 0;
  }
  var seen = {};
  var keywords = [];
  for (var r = startRow; r < rows.length; r++) {
    var kw = String(rows[r][colIndex] || '').trim();
    if (kw && !seen[kw]) {
      seen[kw] = true;
      keywords.push(kw);
    }
  }
  return keywords;
}

// ---------- 进度面板 UI ----------
function renderProgressPanel() {
  var list = $('#keywordProgressList');
  list.empty();
  batchState.keywords.forEach(function (kw) {
    var st = batchState.statuses[kw] || 'pending';
    var count = batchState.results[kw] ? batchState.results[kw].length : 0;
    var badgeText = { pending: '等待中', running: '进行中', done: '完成', failed: '失败' }[st];
    var row = $('<div class="kw-row">');
    row.append($('<span class="kw-name">').text(kw));
    row.append($('<span class="kw-badge ' + st + '">').text(badgeText));
    row.append($('<span class="kw-count">').text(count > 0 ? count + ' 条' : ''));
    var bar = $('<div class="kw-mini-bar">').append($('<div class="kw-mini-fill ' + (st === 'running' ? 'running' : '') + '">').css('width', st === 'done' ? '100%' : st === 'failed' ? '30%' : '0%'));
    row.append(bar);
    list.append(row);
  });
  updateGlobalProgress();
}

function updateGlobalProgress() {
  var total = batchState.keywords.length;
  var done = batchState.keywords.filter(function (k) { return batchState.statuses[k] === 'done' || batchState.statuses[k] === 'failed'; }).length;
  var pct = total > 0 ? Math.round(done / total * 100) : 0;
  $('#batchProgressLabel').text(done + ' / ' + total + ' 关键词完成');
  $('#batchProgressPct').text(pct + '%');
  $('#batchProgressBar').css('width', pct + '%');
  if (done === total && total > 0) {
    $('#downloadMergedBtn').prop('disabled', false).css('opacity', '1');
  }
}

// ---------- 文件名工具 ----------
function getBatchDateStr() {
  var now = batchState.startDate || new Date();
  return now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');
}

function safeFilename(kw) {
  return kw.replace(/[\\/:*?"<>|]/g, '_').substring(0, 40);
}

// ---------- 保存单关键词 CSV ----------
async function saveKeywordCSV(kw, data) {
  var tableData = w(data);
  tableData.data.forEach(function (row, ri) {
    row.forEach(function (cell, ci) {
      if (Array.isArray(cell)) tableData.data[ri][ci] = Papa.unparse([cell], { quotes: true, escapeChar: '"' });
    });
  });
  var csvStr = Papa.unparse(tableData, { quotes: true, escapeChar: '"' });
  var filename = 'douyin_' + safeFilename(kw) + '_' + getBatchDateStr() + '.csv';
  var blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });

  if (batchState.saveDir) {
    try {
      var fh = await batchState.saveDir.getFileHandle(filename, { create: true });
      var writable = await fh.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e) {
      console.warn('写入目录失败，改用浏览器下载', e);
    }
  }
  triggerDownload(blob, filename);
}

// ---------- 保存合并 CSV ----------
async function saveMergedCSV() {
  var allRows = [];
  var fields = null;
  batchState.keywords.forEach(function (kw) {
    var data = batchState.results[kw];
    if (!data || data.length === 0) return;
    var tableData = w(data);
    if (!fields) fields = ['搜索关键词'].concat(tableData.fields);
    tableData.data.forEach(function (row) {
      allRows.push([kw].concat(row));
    });
  });
  if (!fields) { alert('没有可合并的数据'); return; }
  var merged = { fields: fields, data: allRows };
  var csvStr = Papa.unparse(merged, { quotes: true, escapeChar: '"' });
  var filename = 'douyin_all_keywords_' + getBatchDateStr() + '.csv';
  var blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });

  if (batchState.saveDir) {
    try {
      var fh = await batchState.saveDir.getFileHandle(filename, { create: true });
      var writable = await fh.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e) {
      console.warn('写入合并CSV失败，改用浏览器下载', e);
    }
  }
  triggerDownload(blob, filename);
}

// ---------- 单关键词搜索 ----------
function searchOneKeyword(kw, onDone) {
  // 重置采集状态
  s.autoStartScraping = false;
  s.data = [];
  s.pages = 0;
  s.lastRows = 0;
  s.workingTime = 0;

  var targetUrl = 'https://www.douyin.com/search/' + encodeURIComponent(kw) + '?type=video';

  function listener(tabId, changeInfo) {
    if (changeInfo.status === 'complete' && tabId === i.id) {
      chrome.tabs.onUpdated.removeListener(listener);
      i.url = targetUrl;
      // 等待页面内容脚本就绪
      setTimeout(function () {
        R(); // findTables → x() → 触发 content ready
        // 等 content ready 完成后启动采集
        var waitForReady = setInterval(function () {
          if (!batchState.running) {
            clearInterval(waitForReady);
            onDone(s.data);
            return;
          }
          // x() 完成后 s.startingUrl 已设置，且 #content 可见
          var decodedUrl = "";
          try { decodedUrl = decodeURIComponent(s.startingUrl); } catch(e) { decodedUrl = s.startingUrl; }
          if (decodedUrl && decodedUrl.includes(kw)) {
            clearInterval(waitForReady);
            // 启动滚动采集
            T();
            // 监控采集完成
            watchForCompletion(onDone);
          }
        }, 500);
      }, 1500);
    }
  }
  chrome.tabs.onUpdated.addListener(listener);
  chrome.tabs.update(i.id, { url: targetUrl });
}

// ---------- 监控采集完成（检测 s.scraping 为 false 则进入下一步）----------
function watchForCompletion(onDone) {
  if (batchState.stableCheckTimer) clearInterval(batchState.stableCheckTimer);

  batchState.stableCheckTimer = setInterval(function () {
    if (!batchState.running) {
      clearInterval(batchState.stableCheckTimer);
      onDone(s.data);
      return;
    }
    if (!s.scraping) {
      // 爬取已停止（手动、自动检测或出错），结束当前关键字的采集，进入下一步
      clearInterval(batchState.stableCheckTimer);
      onDone(s.data);
      return;
    }
    // 更新进度条中的视频数
    var currentLen = s.data.length;
    var runningKw = batchState.keywords[batchState.currentIndex];
    if (runningKw) {
      $('#keywordProgressList .kw-row').eq(batchState.currentIndex).find('.kw-count').text(currentLen + ' 条');
    }
  }, 1000);
}

// ---------- 顺序批量搜索调度 ----------
async function startBatchSearch() {
  batchState.running = true;
  batchState.currentIndex = 0;
  batchState.startDate = new Date();

  async function processNext() {
    if (!batchState.running || batchState.currentIndex >= batchState.keywords.length) {
      batchState.running = false;
      updateGlobalProgress();
      if (batchState.currentIndex >= batchState.keywords.length) {
        // 全部完成，自动触发合并下载
        await saveMergedCSV();
        alert('✅ 批量搜索完成！合并文件已保存。');
      }
      return;
    }

    var kw = batchState.keywords[batchState.currentIndex];
    batchState.statuses[kw] = 'running';
    renderProgressPanel();

    searchOneKeyword(kw, async function (data) {
      if (!batchState.running) return;
      batchState.results[kw] = data || [];
      batchState.statuses[kw] = (data && data.length > 0) ? 'done' : 'failed';
      renderProgressPanel();

      // 保存单关键词 CSV
      if (data && data.length > 0) {
        try {
          await saveKeywordCSV(kw, data);
        } catch (e) {
          console.warn('保存关键词CSV失败', kw, e);
        }
      }

      batchState.currentIndex++;
      // 关键词间短暂停顿，避免过快切换
      setTimeout(processNext, 1500);
    });
  }

  processNext();
}

// ---------- 事件绑定（追加到 I() 的逻辑之外） ----------
$(document).ready(function () {
  I();
  $('#importKeywordsBtn').click(function () {
    $('#keywordFileInput').val('').click();
  });

  $('#keywordFileInput').on('change', async function (e) {
    var file = e.target.files[0];
    if (!file) return;

    var keywords;
    try {
      keywords = await parseKeywordFile(file);
    } catch (err) {
      alert('文件解析失败：' + err.message);
      return;
    }
    if (keywords.length === 0) {
      alert('未在文件中找到任何关键词，请检查文件格式。');
      return;
    }

    // 询问保存文件夹
    batchState.saveDir = null;
    if (window.showDirectoryPicker) {
      var choose = confirm(
        '找到 ' + keywords.length + ' 个关键词。\n\n' +
        '是否选择保存文件夹？\n' +
        '（点击"确定"选择文件夹，"取消"则自动下载到默认下载目录）'
      );
      if (choose) {
        try {
          batchState.saveDir = await window.showDirectoryPicker({ mode: 'readwrite' });
        } catch (e) {
          // 用户取消选择，使用默认下载
          batchState.saveDir = null;
        }
      }
    }

    // 初始化状态
    batchState.keywords = keywords;
    batchState.results = {};
    batchState.statuses = {};
    keywords.forEach(function (kw) { batchState.statuses[kw] = 'pending'; });
    batchState.currentIndex = 0;
    batchState.running = false;
    $('#downloadMergedBtn').prop('disabled', true).css('opacity', '0.5');

    // 展示进度面板
    $('#batchProgressPanel').show();
    $('#cancelBatchBtn').show();
    $('#downloadMergedBtn').show();
    renderProgressPanel();

    // 开始批量搜索
    startBatchSearch();
  });

  $('#cancelBatchBtn').click(function () {
    if (!batchState.running) return;
    batchState.running = false;
    if (batchState.stableCheckTimer) clearInterval(batchState.stableCheckTimer);
    L(); // 停止当前爬取
    // 标记剩余为失败
    for (var idx = batchState.currentIndex; idx < batchState.keywords.length; idx++) {
      var kw = batchState.keywords[idx];
      if (batchState.statuses[kw] === 'pending' || batchState.statuses[kw] === 'running') {
        batchState.statuses[kw] = 'failed';
      }
    }
    renderProgressPanel();
    alert('已取消批量搜索。');
  });

  $('#downloadMergedBtn').click(function () {
    saveMergedCSV();
  });
});

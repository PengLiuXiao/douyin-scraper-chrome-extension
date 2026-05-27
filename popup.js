/* DouyinURL提取Pro - popup controller */

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
}

async function d() {
  if (!i.url || !i.url.toLowerCase().includes('douyin.com')) {
    $("#waitHeader").hide();
    p("DouyinURL提取Pro 仅支持抖音网站（douyin.com），请先在浏览器中打开抖音页面再使用本扩展。", "noResponseErr", false, false);
    return;
  }
  I();
  setTimeout(function () {
    console.log("no response");
    $("#waitHeader").is(":visible") && y(true);
  }, 5e4);
  $(window).resize(function () {
    v();
  });
  R();
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
  ((s.tableId = e.tableId),
    (s.scraping = !1),
    (s.failedToProcess = !1),
    (s.processingError = null),
    (s.tableSelector = e.tableSelector),
    (s.startingUrl = e.href),
    (s.hostName = e.hostname),
    (s.previewLength = 0),
    (s.configName = e.hostname + "-config"),
    (s.config = JSON.parse(localStorage.getItem(s.configName)) || {
      headers: {},
      deletedFields: {},
      crawlDelay: 1e3,
      maxWait: 2e4,
    }),
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
  }
  chrome.tabs.sendMessage(i.id, { action: "getTableData" }, function (e) {
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
                e.error || $("#startScraping").show();
              },
            )),
        $("#wait").hide(),
        $("#content").show(),
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
              saveAs(
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
              saveAs(
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
      x(e, !0);
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
              if (e) {
                if (e.error)
                  return (
                    p("", "instructions"),
                    p(e.error, e.errorId || "error", !0)
                  );
                (e.failedToProcess
                  ? (p(
                      "Failed to process rows. Showing raw data instead.",
                      "error",
                      !1,
                    ),
                    (s.failedToProcess = !0),
                    (s.processingError = e.processingError))
                  : ($("#error").hide(), (s.failedToProcess = !1)),
                  (s.lastRows = e.data.length),
                  s.pages++,
                  (s.workingTime += new Date() - t),
                  (t = new Date()),
                  D(e.data),
                  q(),
                  s.previewLength < c
                    ? v()
                    : p("预览仅显示前 1000 条，完整数据请下载。", "previewLimit"),
                  s.scraping && n());
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
            e(void 0 !== t);
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
    $("#resetColumns").click(function () {
      ((s.config.deletedFields = {}), S(), $("#resetColumns").hide(), v());
    }),
    $("#douyinSearchBtn").click(function () {
      var keyword = $("#douyinSearchKeyword").val().trim();
      if (!keyword) {
        alert("请输入搜索关键词！");
        return;
      }
      s.autoStartScraping = !0;
      s.data = [];
      s.pages = 0;
      s.lastRows = 0;
      s.workingTime = 0;
      $("#content").hide();
      $("#waitHeader").text("正在跳转并初始化搜索...").show();
      $("#wait").show();
      chrome.tabs.update(
        i.id,
        {
          url:
            "https://www.douyin.com/search/" +
            encodeURIComponent(keyword) +
            "?type=video",
        },
        function (tab) {
          function listener(tabId, changeInfo) {
            "complete" === changeInfo.status &&
              tabId === i.id &&
              (chrome.tabs.onUpdated.removeListener(listener),
              (i.url =
                "https://www.douyin.com/search/" +
                encodeURIComponent(keyword) +
                "?type=video"),
              setTimeout(function () {
                R();
              }, 1500));
          }
          chrome.tabs.onUpdated.addListener(listener);
        },
      );
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
($("#startScraping").click(T));

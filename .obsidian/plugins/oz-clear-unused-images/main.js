"use strict";
var e = require("obsidian");
function t(e, t, i, s) {
  return new (i || (i = Promise))(function (n, a) {
    function o(e) {
      try {
        d(s.next(e));
      } catch (e) {
        a(e);
      }
    }
    function l(e) {
      try {
        d(s.throw(e));
      } catch (e) {
        a(e);
      }
    }
    function d(e) {
      var t;
      e.done
        ? n(e.value)
        : ((t = e.value),
          t instanceof i
            ? t
            : new i(function (e) {
                e(t);
              })).then(o, l);
    }
    d((s = s.apply(e, t || [])).next());
  });
}
const i = {
  deleteOption: ".trash",
  logsModal: !0,
  excludedFolders: "",
  ribbonIcon: !1,
  excludeSubfolders: !1,
};
class s extends e.PluginSettingTab {
  constructor(e, t) {
    super(e, t), (this.plugin = t);
  }
  display() {
    let { containerEl: t } = this;
    t.empty(),
      t.createEl("h2", { text: "Clear Images Settings" }),
      new e.Setting(t)
        .setName("Ribbon Icon")
        .setDesc("Turn on if you want Ribbon Icon for clearing the images.")
        .addToggle((e) =>
          e.setValue(this.plugin.settings.ribbonIcon).onChange((e) => {
            (this.plugin.settings.ribbonIcon = e),
              this.plugin.saveSettings(),
              this.plugin.refreshIconRibbon();
          }),
        ),
      new e.Setting(t)
        .setName("Delete Logs")
        .setDesc(
          "Turn off if you dont want to view the delete logs Modal to pop up after deletion is completed. It wont appear if no image is deleted",
        )
        .addToggle((e) =>
          e.setValue(this.plugin.settings.logsModal).onChange((e) => {
            (this.plugin.settings.logsModal = e), this.plugin.saveSettings();
          }),
        ),
      new e.Setting(t)
        .setName("Deleted Image Destination")
        .setDesc(
          "Select where you want images to be moved once they are deleted",
        )
        .addDropdown((e) => {
          e.addOption("permanent", "Delete Permanently"),
            e.addOption(".trash", "Move to Obsidian Trash"),
            e.addOption("system-trash", "Move to System Trash"),
            e.setValue(this.plugin.settings.deleteOption),
            e.onChange((e) => {
              (this.plugin.settings.deleteOption = e),
                this.plugin.saveSettings();
            });
        }),
      new e.Setting(t)
        .setName("Excluded Folder Full Paths")
        .setDesc(
          "Provide the FULL path of the folder names (Case Sensitive) divided by comma (,) to be excluded from clearing. \n\t\t\t\t\ti.e. For images under Personal/Files/Zodiac -> Personal/Files/Zodiac should be used for exclusion",
        )
        .addTextArea((e) =>
          e.setValue(this.plugin.settings.excludedFolders).onChange((e) => {
            (this.plugin.settings.excludedFolders = e),
              this.plugin.saveSettings();
          }),
        ),
      new e.Setting(t)
        .setName("Exclude Subfolders")
        .setDesc(
          "Turn on this option if you want to also exclude all subfolders of the folder paths provided above.",
        )
        .addToggle((e) =>
          e.setValue(this.plugin.settings.excludeSubfolders).onChange((e) => {
            (this.plugin.settings.excludeSubfolders = e),
              this.plugin.saveSettings();
          }),
        );
    const i = t.createDiv("coffee");
    i.addClass("oz-coffee-div");
    i.createEl("a", { href: "https://ko-fi.com/L3L356V6Q" }).createEl("img", {
      attr: { src: "https://cdn.ko-fi.com/cdn/kofi2.png?v=3" },
    }).height = 45;
  }
}
class n extends e.Modal {
  constructor(e, t) {
    super(t), (this.textToView = e);
  }
  onOpen() {
    let { contentEl: e } = this,
      t = this;
    const i = e.createEl("div");
    i.addClass("unused-images-center-wrapper");
    i.createEl("h1", { text: "Clear Unused Images - Logs" }).addClass(
      "modal-title",
    );
    const s = e.createEl("div");
    s.addClass("unused-images-logs"), (s.innerHTML = this.textToView);
    const n = e.createEl("div");
    n.addClass("unused-images-center-wrapper");
    const a = n.createEl("button", { text: "Close" });
    a.addClass("unused-images-button"),
      a.addEventListener("click", () => {
        t.close();
      });
  }
}
const a = (e, i, s) =>
    t(void 0, void 0, void 0, function* () {
      const t = [];
      void 0 === s && (s = yield i.vault.read(e));
      let n = s.match(/\[\[.*?\]\]/g);
      if (n) {
        let s = /(?<=\[\[).*?(?=(\]|\|))/;
        for (let a of n) {
          if (h(a)) {
            let s = u(a),
              n = i.metadataCache.getFirstLinkpathDest(s, e.path);
            if ("" !== s) {
              let i = {
                type: "wikiTransclusion",
                match: a,
                linkText: n ? n.path : s,
                sourceFilePath: e.path,
              };
              t.push(i);
              continue;
            }
          }
          let n = a.match(s);
          if (n) {
            if (n[0].startsWith("http")) continue;
            let s = i.metadataCache.getFirstLinkpathDest(n[0], e.path),
              o = {
                type: "wiki",
                match: a,
                linkText: s ? s.path : n[0],
                sourceFilePath: e.path,
              };
            t.push(o);
          }
        }
      }
      let a = s.match(/\[(^$|.*?)\]\((.*?)\)/g);
      if (a) {
        let s = /(?<=\().*(?=\))/;
        for (let n of a) {
          if (c(n)) {
            let s = u(n),
              a = i.metadataCache.getFirstLinkpathDest(s, e.path);
            if ("" !== s) {
              let i = {
                type: "mdTransclusion",
                match: n,
                linkText: a ? a.path : s,
                sourceFilePath: e.path,
              };
              t.push(i);
              continue;
            }
          }
          let a = n.match(s);
          if (a) {
            if (a[0].startsWith("http")) continue;
            let s = i.metadataCache.getFirstLinkpathDest(a[0], e.path),
              o = {
                type: "markdown",
                match: n,
                linkText: s ? s.path : a[0],
                sourceFilePath: e.path,
              };
            t.push(o);
          }
        }
      }
      return t;
    }),
  o = /\[\[(.*?)#.*?\]\]/,
  l = /(?<=\[\[)(.*)(?=#)/,
  d = /\[.*?]\((.*?)#.*?\)/,
  r = /(?<=\]\()(.*)(?=#)/,
  h = (e) => o.test(e),
  c = (e) => d.test(e),
  u = (e) => {
    let t = o.test(e),
      i = d.test(e);
    if (t || i) {
      let i = e.match(t ? l : r);
      if (i) return i[0];
    }
    return "";
  },
  g = /.*(jpe?g|png|gif|svg|bmp)/i,
  p = /!\[\[(.*?)\]\]/i,
  f = new Set(["jpeg", "jpg", "png", "gif", "svg", "bmp"]),
  m = (e, t) => {
    let i = e.vault.getFiles(),
      s = [];
    for (let e = 0; e < i.length; e++)
      ["md", "canvas"].includes(i[e].extension) ||
        ((f.has(i[e].extension.toLowerCase()) || "all" === t) && s.push(i[e]));
    return s;
  },
  v = (e) =>
    t(void 0, void 0, void 0, function* () {
      var t = new Set(),
        i = e.metadataCache.resolvedLinks;
      if (i)
        for (const [e, s] of Object.entries(i))
          for (const [s, n] of Object.entries(i[e]))
            s.endsWith(".md") || t.add(s);
      let s = e.vault.getFiles();
      for (let i = 0; i < s.length; i++) {
        let n = s[i];
        if ("md" === n.extension) {
          let i = e.metadataCache.getFileCache(n);
          if (i.frontmatter) {
            let s = i.frontmatter;
            for (let i of Object.keys(s))
              if ("string" == typeof s[i])
                if (s[i].match(p)) {
                  let a = s[i].match(p)[1],
                    o = e.metadataCache.getFirstLinkpathDest(a, n.path);
                  o && w(t, o.path);
                } else b(s[i]) && w(t, s[i]);
          }
          let s = yield a(n, e);
          for (let e of s) w(t, e.linkText);
        } else if ("canvas" === n.extension) {
          let i = yield e.vault.cachedRead(n),
            s = JSON.parse(i);
          if (s.nodes && s.nodes.length > 0)
            for (const i of s.nodes)
              if ("file" === i.type) w(t, i.file);
              else if ("text" == i.type) {
                let s = yield a(n, e, i.text);
                for (let e of s) w(t, e.linkText);
              }
        }
      }
      return t;
    }),
  b = (e) => e.match(g),
  x = (e, t) => {
    var i = t.settings.excludedFolders,
      s = t.settings.excludeSubfolders;
    if ("" === i) return !1;
    var n = new Set(i.split(",").map((e) => e.trim()));
    if (s)
      for (let t of n) {
        var a = new RegExp(t + ".*");
        if (e.parent.path.match(a)) return !0;
      }
    else if (n.has(e.parent.path)) return !0;
    return !1;
  },
  y = () =>
    new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  w = (e, t) => {
    e.has(t) || e.add(t);
  };
class C extends e.Plugin {
  constructor() {
    super(...arguments),
      (this.ribbonIconEl = void 0),
      (this.refreshIconRibbon = () => {
        var e;
        null === (e = this.ribbonIconEl) || void 0 === e || e.remove(),
          this.settings.ribbonIcon &&
            (this.ribbonIconEl = this.addRibbonIcon(
              "image-file",
              "Clear Unused Images",
              (e) => {
                this.clearUnusedAttachments("image");
              },
            ));
      }),
      (this.clearUnusedAttachments = (i) =>
        t(this, void 0, void 0, function* () {
          var s,
            a,
            o,
            l = yield ((e, i) =>
              t(void 0, void 0, void 0, function* () {
                var t,
                  s = m(e, i),
                  n = [];
                return (
                  (t = yield v(e)),
                  s.forEach((e) => {
                    t.has(e.path) || n.push(e);
                  }),
                  n
                );
              }))(this.app, i);
          if (l.length > 0) {
            let e = "";
            (e += `[+] ${y()}: Clearing started.</br>`),
              ((s = l),
              (a = this),
              (o = this.app),
              t(void 0, void 0, void 0, function* () {
                var e = a.settings.deleteOption,
                  t = 0;
                let i = "";
                for (let n of s)
                  x(n, a)
                    ? console.log("File not referenced but excluded: " + n.path)
                    : (".trash" === e
                        ? (yield o.vault.trash(n, !1),
                          (i +=
                            "[+] Moved to Obsidian Trash: " + n.path + "</br>"))
                        : "system-trash" === e
                          ? (yield o.vault.trash(n, !0),
                            (i +=
                              "[+] Moved to System Trash: " + n.path + "</br>"))
                          : "permanent" === e &&
                            (yield o.vault.delete(n),
                            (i +=
                              "[+] Deleted Permanently: " + n.path + "</br>")),
                      t++);
                return { deletedImages: t, textToView: i };
              })).then(({ deletedImages: t, textToView: i }) => {
                if (
                  ((e += i),
                  (e +=
                    "[+] " + t.toString() + " image(s) in total deleted.</br>"),
                  (e += `[+] ${y()}: Clearing completed.`),
                  this.settings.logsModal)
                ) {
                  new n(e, this.app).open();
                }
              });
          } else
            new e.Notice(
              `All ${"image" === i ? "images" : "attachments"} are used. Nothing was deleted.`,
            );
        }));
  }
  onload() {
    return t(this, void 0, void 0, function* () {
      console.log("Clear Unused Images plugin loaded..."),
        this.addSettingTab(new s(this.app, this)),
        yield this.loadSettings(),
        this.addCommand({
          id: "clear-images-obsidian",
          name: "Clear Unused Images",
          callback: () => this.clearUnusedAttachments("image"),
        }),
        this.addCommand({
          id: "clear-unused-attachments",
          name: "Clear Unused Attachments",
          callback: () => this.clearUnusedAttachments("all"),
        }),
        this.refreshIconRibbon();
    });
  }
  onunload() {
    console.log("Clear Unused Images plugin unloaded...");
  }
  loadSettings() {
    return t(this, void 0, void 0, function* () {
      this.settings = Object.assign({}, i, yield this.loadData());
    });
  }
  saveSettings() {
    return t(this, void 0, void 0, function* () {
      yield this.saveData(this.settings);
    });
  }
}
module.exports = C;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy9tb2RhbHMudHMiLCJzcmMvbGlua0RldGVjdG9yLnRzIiwic3JjL3V0aWwudHMiLCJzcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6bnVsbCwibmFtZXMiOlsiX19hd2FpdGVyIiwidGhpc0FyZyIsIl9hcmd1bWVudHMiLCJQIiwiZ2VuZXJhdG9yIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmdWxmaWxsZWQiLCJ2YWx1ZSIsInN0ZXAiLCJuZXh0IiwiZSIsInJlamVjdGVkIiwicmVzdWx0IiwiZG9uZSIsInRoZW4iLCJhcHBseSIsIkRFRkFVTFRfU0VUVElOR1MiLCJkZWxldGVPcHRpb24iLCJsb2dzTW9kYWwiLCJleGNsdWRlZEZvbGRlcnMiLCJyaWJib25JY29uIiwiZXhjbHVkZVN1YmZvbGRlcnMiLCJPemFuQ2xlYXJJbWFnZXNTZXR0aW5nc1RhYiIsIlBsdWdpblNldHRpbmdUYWIiLCJjb25zdHJ1Y3RvciIsImFwcCIsInBsdWdpbiIsInN1cGVyIiwidGhpcyIsImRpc3BsYXkiLCJjb250YWluZXJFbCIsImVtcHR5IiwiY3JlYXRlRWwiLCJ0ZXh0IiwiU2V0dGluZyIsInNldE5hbWUiLCJzZXREZXNjIiwiYWRkVG9nZ2xlIiwidG9nZ2xlIiwic2V0VmFsdWUiLCJzZXR0aW5ncyIsIm9uQ2hhbmdlIiwic2F2ZVNldHRpbmdzIiwicmVmcmVzaEljb25SaWJib24iLCJhZGREcm9wZG93biIsImRyb3Bkb3duIiwiYWRkT3B0aW9uIiwib3B0aW9uIiwiYWRkVGV4dEFyZWEiLCJjb2ZmZWVEaXYiLCJjcmVhdGVEaXYiLCJhZGRDbGFzcyIsImhyZWYiLCJhdHRyIiwic3JjIiwiaGVpZ2h0IiwiTG9nc01vZGFsIiwiTW9kYWwiLCJ0ZXh0VG9WaWV3Iiwib25PcGVuIiwiY29udGVudEVsIiwibXlNb2RhbCIsImhlYWRlcldyYXBwZXIiLCJsb2dzIiwiaW5uZXJIVE1MIiwiYnV0dG9uV3JhcHBlciIsImNsb3NlQnV0dG9uIiwiYWRkRXZlbnRMaXN0ZW5lciIsImNsb3NlIiwiZ2V0QWxsTGlua01hdGNoZXNJbkZpbGUiLCJtZEZpbGUiLCJmaWxlVGV4dCIsImxpbmtNYXRjaGVzIiwidW5kZWZpbmVkIiwidmF1bHQiLCJyZWFkIiwid2lraU1hdGNoZXMiLCJtYXRjaCIsImZpbGVSZWdleCIsIndpa2lNYXRjaCIsIm1hdGNoSXNXaWtpVHJhbnNjbHVzaW9uIiwiZmlsZU5hbWUiLCJnZXRUcmFuc2NsdXNpb25GaWxlTmFtZSIsImZpbGUiLCJtZXRhZGF0YUNhY2hlIiwiZ2V0Rmlyc3RMaW5rcGF0aERlc3QiLCJwYXRoIiwibGlua01hdGNoIiwidHlwZSIsImxpbmtUZXh0Iiwic291cmNlRmlsZVBhdGgiLCJwdXNoIiwiZmlsZU1hdGNoIiwic3RhcnRzV2l0aCIsIm1hcmtkb3duTWF0Y2hlcyIsIm1hcmtkb3duTWF0Y2giLCJtYXRjaElzTWRUcmFuc2NsdXNpb24iLCJ3aWtpVHJhbnNjbHVzaW9uUmVnZXgiLCJ3aWtpVHJhbnNjbHVzaW9uRmlsZU5hbWVSZWdleCIsIm1kVHJhbnNjbHVzaW9uUmVnZXgiLCJtZFRyYW5zY2x1c2lvbkZpbGVOYW1lUmVnZXgiLCJ0ZXN0IiwiaXNXaWtpIiwiaXNNZCIsImZpbGVOYW1lTWF0Y2giLCJpbWFnZVJlZ2V4IiwiYmFubmVyUmVnZXgiLCJpbWFnZUV4dGVuc2lvbnMiLCJTZXQiLCJnZXRBdHRhY2htZW50c0luVmF1bHQiLCJhbGxGaWxlcyIsImdldEZpbGVzIiwiYXR0YWNobWVudHMiLCJpIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJleHRlbnNpb24iLCJoYXMiLCJ0b0xvd2VyQ2FzZSIsImdldEF0dGFjaG1lbnRQYXRoU2V0Rm9yVmF1bHQiLCJhdHRhY2htZW50c1NldCIsInJlc29sdmVkTGlua3MiLCJsaW5rcyIsIk9iamVjdCIsImVudHJpZXMiLCJmaWxlUGF0aCIsIm5yIiwiZW5kc1dpdGgiLCJhZGQiLCJvYnNGaWxlIiwiZmlsZUNhY2hlIiwiZ2V0RmlsZUNhY2hlIiwiZnJvbnRtYXR0ZXIiLCJrIiwia2V5cyIsImFkZFRvU2V0IiwicGF0aElzQW5JbWFnZSIsImZpbGVSZWFkIiwiY2FjaGVkUmVhZCIsImNhbnZhc0RhdGEiLCJKU09OIiwicGFyc2UiLCJub2RlcyIsIm5vZGUiLCJmaWxlSXNJbkV4Y2x1ZGVkRm9sZGVyIiwiZXhjbHVkZWRGb2xkZXJzU2V0dGluZ3MiLCJleGNsdWRlZEZvbGRlclBhdGhzIiwic3BsaXQiLCJtYXAiLCJmb2xkZXJQYXRoIiwidHJpbSIsImV4bHVkZWRGb2xkZXJQYXRoIiwicGF0aFJlZ2V4IiwiUmVnRXhwIiwicGFyZW50IiwiZ2V0Rm9ybWF0dGVkRGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJ5ZWFyIiwibW9udGgiLCJkYXkiLCJob3VyIiwibWludXRlIiwic2Vjb25kIiwic2V0T2JqIiwiT3phbkNsZWFySW1hZ2VzIiwiUGx1Z2luIiwicmliYm9uSWNvbkVsIiwiX2EiLCJyZW1vdmUiLCJhZGRSaWJib25JY29uIiwiZXZlbnQiLCJjbGVhclVudXNlZEF0dGFjaG1lbnRzIiwiZmlsZUxpc3QiLCJ1bnVzZWRBdHRhY2htZW50cyIsInVzZWRBdHRhY2htZW50c1NldCIsImFsbEF0dGFjaG1lbnRzSW5WYXVsdCIsImZvckVhY2giLCJhdHRhY2htZW50IiwiVXRpbC5nZXRVbnVzZWRBdHRhY2htZW50cyIsIlV0aWwuZ2V0Rm9ybWF0dGVkRGF0ZSIsImRlbGV0ZWRJbWFnZXMiLCJjb25zb2xlIiwibG9nIiwidHJhc2giLCJkZWxldGUiLCJ0b1N0cmluZyIsIm9wZW4iLCJOb3RpY2UiLCJvbmxvYWQiLCJhZGRTZXR0aW5nVGFiIiwibG9hZFNldHRpbmdzIiwiYWRkQ29tbWFuZCIsImlkIiwibmFtZSIsImNhbGxiYWNrIiwib251bmxvYWQiLCJhc3NpZ24iLCJsb2FkRGF0YSIsInNhdmVEYXRhIl0sIm1hcHBpbmdzIjoidUNBcUVPLFNB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

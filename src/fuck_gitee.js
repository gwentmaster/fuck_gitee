// ==UserScript==
// @name         fuck_gitee
// @namespace    gwentmaster
// @version      0.1
// @description  fuck gitee
// @author       gwentmaster
// @match        https://gitee.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function fuck_gitee() {

        var task_panel = document.querySelector("div.ent-sidebox.active p.text-muted")
        if (task_panel === null) {
            return;
        }

        var task_ele = document.querySelector("div.ent-sidebox.active p.text-muted span.issue-number-button")
        if (task_ele === null) {
            return;
        }
        var issue_number = task_ele.textContent.replaceAll(" ", "").replaceAll("\n", "").replaceAll("#", "");

        var repo_ele = document.querySelector("div.ent-sidebox.active a[title=\"仓库\"]");
        if (repo_ele === null) {
            return;
        }
        var repo_li = repo_ele.getAttribute("href").split("/");

        var issue_url = "https://gitee.com/";
        for (var i = 0; i < repo_li.length; i++) {
            if (i >= repo_li.length - 2) {
                issue_url += (repo_li[i] + "/");
            }
        }
        issue_url += ("issues/" + issue_number + "?from=project-issue");
        

        var issue_ele = document.createElement("a");
        issue_ele.setAttribute("href", issue_url);
        issue_ele.setAttribute("class", "issue-number-button")
        issue_ele.innerText = ("#" + issue_number)

        task_panel.replaceChild(issue_ele, task_ele);
    }

    function add_listener() {

        var issues = document.querySelectorAll("a.issue-title-inner");
        issues.forEach((issue) => {
            issue.addEventListener("click", (e) => {
                setTimeout(fuck_gitee, 800);
            })
        })
    }

    function modify_label(base_url, label_map) {
        document.querySelectorAll("div.ui.label.issue-label-item").forEach((div) => {
            var label_id = label_map[div.querySelector("div.text").textContent];
            if (typeof(label_id) !== "undefined") {
                var a = document.createElement("a");
                a.setAttribute("href", base_url + "?label_ids=" + label_id);
                div.appendChild(a);
                div.style.cursor = "pointer";
                div.onclick = function() {a.click()};
            }
        })
    }

    function fuck_label() {
        var path_li = window.location.pathname.split("/");
        var issue_flag = false;
        var label_url = "https://gitee.com/"
        for (var i = 0; i < path_li.length; i++) {
            if (i >= path_li.length - 3 && i < path_li.length - 1) {
                label_url += (path_li[i] + "/")
            }
            if (i == path_li.length - 1 && path_li[i] === "issues") {
                issue_flag = true;
            }
        }

        if (!issue_flag) {
            return;
        }

        var base_url = label_url + "issues"
        label_url += "labels"
        var xhr = new XMLHttpRequest();
        xhr.open("GET", label_url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var label_map = new Object();
                JSON.parse(xhr.responseText).forEach((label) => {
                    label_map[label.name] = label.id;
                });
                modify_label(base_url, label_map);
            }
        }
        xhr.send();
    }

    function head_to_repo() {

        document.querySelectorAll("div.popover-reference").forEach((div) => {

            var issue_num = div.textContent.replaceAll(" ", "").replaceAll("\n", "").replaceAll("#", "");

            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://gitee.com/njderi/dashboard/issues/" + issue_num, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var resp = JSON.parse(xhr.responseText);
                    var repo_path = resp.project.path;

                    var issue_ele = document.createElement("a");
                    issue_ele.setAttribute("href", repo_path + "/issues/" + issue_num + "?from=project-issue");
                    issue_ele.setAttribute("class", "issue-number-button");
                    issue_ele.innerText = ("#" + issue_num);

                    div.parentElement.replaceChild(issue_ele, div);
                }
            }
            xhr.send();
        })
    }
    window.onload = function() {
        setTimeout(fuck_gitee, 500);
        setTimeout(add_listener, 1000);
        setTimeout(head_to_repo, 1000);
        fuck_label();
    }

})();
/*
NOTICE
The code herein was taken and modified in part from the Twitter open source portal - https://github.com/twitter/twitter.github.com
Modifications were made to include multiple organization accounts and display them differently
 */

(function () {

  // Put custom repo descriptions in this object, keyed by repo name.
  var repoDescriptions = {
    eas : "The Enterprise Addressing System (EAS) is an open source, web-based application that allows employees of government agencies to query, update, and retire street addresses.",
    CycleTracksWebsite : "Simple db and php code to catch data from iOS and Android CycleTracks apps."
  };

  // readOrgs() populates these three data structures from index.html.
  // Putting the raw data in index.html is more SEO-friendly since the
  // links are available in the original HTML as opposed to being
  // "injected" by the javascript at render-time.
  var orgs = [];
  var orgNameMap = {};
  var orgUrls = {};

  var repoUrls = {};

  // Extract the organization username from the URL.
  function urlToOrg(url) {
    // Remove the trailing slash, if present.
    if (url[url.length - 1] == "/") {
      url = url.slice(0, -1);
    }
    var index = url.lastIndexOf("/") + 1;
    var org = url.slice(index);

    return org;
  }

  // Read the organization data from index.html.
  function readOrgs() {
    var anchors = $("#orgs li a");
    for (var i = 0; i < anchors.length; i++) {
      var anchor = $(anchors[i]);
      var orgName = anchor.text();
      var url = anchor.attr("href");
      var org = urlToOrg(url).toLowerCase();

      orgs.push(org);
      orgNameMap[org] = orgName;
      orgUrls[org] = url;
    }
  }

  function repoUrl(repo) {
    return repoUrls[repo.name] || repo.html_url;
  }

  function repoDescription(repo) {
    return repoDescriptions[repo.name] || repo.description;
  }

  function repoToOrgName(repo) {
    return orgNameMap[repo.owner.login.toLowerCase()] || repo.name;
  }

  function addRepo(repo) {
    var description = repoDescription(repo);
    var $item = $("<div>").addClass("col-sm-4 repo");
    var $link = $("<a>").attr("href", repoUrl(repo)).attr("id",repo.id).appendTo($item);
    var $panel = $("<div>").addClass("panel panel-default " + (repo.language || '').toLowerCase()).appendTo($link);
    var $heading = $("<div>").addClass("panel-heading").appendTo($panel);
    $heading.append($("<h3>").addClass("panel-title").text(repo.name));
    $heading.append($("<small>").text(repo.language || ''));
    var $body = $("<div>").addClass("panel-body").appendTo($panel);
    var $para = $("<p>");
    if (description) {
      $para.text(description);
    } else {
      $para.append($("<em>").text("No description provided."));
    }
    $body.append($para);
    $panel.append($("<div>").addClass("panel-footer " + (repo.owner.login || '').toLowerCase()).text(repoToOrgName(repo)));
    $item.appendTo("#repos");
  }

  function mapBitbucket(result) {
    // Map required values from Bitbucket API to GitHub equivalent for easier processing
    $.each(result.values, function(i,repo){
      repo.pushed_at = repo.updated_on;
      repo.created_at = repo.created_on;
      repo.id = repo.full_name;
      repo.owner.login = repo.owner.username;
      repo.html_url = repo.links.html.href;
      $.getJSON(repo.links.watchers.href + "?callback=?", function(result){
        repo.watchers = result.values.length;
      });
    });
    return result;
  }

  function addRepos(orgIdx, repos, page, bitbucket) {
    orgIdx = orgIdx || 0;
    repos = repos || [];
    page = page || 1;
    bitbucket = bitbucket || false;

    if (!bitbucket) {
      var uri = "https://api.github.com/orgs/"+orgs[orgIdx]+"/repos?callback=?"
          + "&per_page=100"
          + "&page=" + page;
    } else {
      var uri = "https://bitbucket.org/api/2.0/repositories/" + orgs[orgIdx] +"?callback=?";
    }

    $.getJSON(uri, function (result) {
      if ((result.values && result.values.length > 0) || (result.data && result.data.length > 0)) {
        if(bitbucket) {
          result = mapBitbucket(result);
          repos = repos.concat(result.values);
          addRepos(orgIdx + 1, repos);
        } else {
          repos = repos.concat(result.data);
          addRepos(orgIdx, repos, page + 1);
        }
      }
      else if (!bitbucket && result.data.message == "Not Found") {
        addRepos(orgIdx, repos, 1, true);
      }
      else if (orgs.length > orgIdx + 1) {
        addRepos(orgIdx + 1, repos);
      }
      else {
        $(function () {
         // $("#num-repos").text(repos.length);

          // Convert pushed_at to Date.
          $.each(repos, function (i, repo) {
            repo.pushed_at = new Date(repo.pushed_at);

            var weekHalfLife = 1.146 * Math.pow(10, -9);

            var pushDelta = (new Date) - Date.parse(repo.pushed_at);
            var createdDelta = (new Date) - Date.parse(repo.created_at);

            var weightForPush = 1;
            var weightForWatchers = 1.314 * Math.pow(10, 7);

            repo.hotness = weightForPush * Math.pow(Math.E, -1 * weekHalfLife * pushDelta);
            repo.hotness += weightForWatchers * repo.watchers / createdDelta;
          });

          // Sort by highest # of watchers.
          repos.sort(function (a, b) {
            if (a.hotness < b.hotness) return 1;
            if (b.hotness < a.hotness) return -1;
            return 0;
          });

          $.each(repos, function (i, repo) {
            addRepo(repo);
          });

          // Sort by most-recently pushed to.
          repos.sort(function (a, b) {
            if (a.pushed_at < b.pushed_at) return 1;
            if (b.pushed_at < a.pushed_at) return -1;
            return 0;
          });
          /*
          $.each(repos.slice(0, 3), function (i, repo) {
            addRecentlyUpdatedRepo(repo);
          });
          */
        });
      }
    });
  }

  readOrgs();
  addRepos();
})();

/*
NOTICE
The code herein was taken and modified in part from the Twitter open source portal - https://github.com/twitter/twitter.github.com
Modifications were made to include multiple organization accounts and display them differently
 */

(function () {
  /*
  To add an organization to the portal edit orgs and orgNames below
  For example in your github URL for your organization, the username follows right after: http://www.github.com/[user]
   */
  var orgs = ["sfmoci","sfcta"];

  /*
  Put the full title of your department below, keyed by the github user name you entered above
  Don't forget to mind your commas and colons (no comma after the last entry in the list)
   */
  var orgNames = {
    sfmoci : "San Francisco Mayor's Office of Civic Innovation",
    sfcta : "San Francisco County Transportation Authority"
  }
  /*
  That's it, you only need to edit above to add your organization
   */


  function orgName(repo) {
    return orgNames[repo.owner.login.toLowerCase()] || repo.name;
  }

  var repoUrls = {
  };

  function repoUrl(repo) {
    return repoUrls[repo.name] || repo.html_url;
  }

  // Put custom repo descriptions in this object, keyed by repo name.
  var repoDescriptions = {
  };

  function repoDescription(repo) {
    return repoDescriptions[repo.name] || repo.description;
  }

  function addRepo(repo) {
    var $item = $("<div>").addClass("col-sm-4 repo");
    var $link = $("<a>").attr("href", repoUrl(repo)).appendTo($item);
    var $panel = $("<div>").addClass("panel panel-default " + (repo.language || '').toLowerCase()).appendTo($link);
    var $heading = $("<div>").addClass("panel-heading").appendTo($panel);
    $heading.append($("<h3>").addClass("panel-title").text(repo.name));
    $heading.append($("<small>").text(repo.language || ''));
    var $body = $("<div>").addClass("panel-body").appendTo($panel);
    $body.append($("<p>").text(repoDescription(repo)));
    $panel.append($("<div>").addClass("panel-footer " + (repo.owner.login || '').toLowerCase()).text(orgName(repo)));
    $item.appendTo("#repos");
  }

  function addRepos(orgIdx, repos, page) {
    orgIdx = orgIdx || 0;
    repos = repos || [];
    page = page || 1;
    console.log('hello');

    var uri = "https://api.github.com/orgs/"+orgs[orgIdx]+"/repos?callback=?"
        + "&per_page=100"
        + "&page=" + page;

    $.getJSON(uri, function (result) {
      if (result.data && result.data.length > 0) {
        repos = repos.concat(result.data);
        addRepos(orgIdx, repos, page + 1);
        console.log('add');
      }
      else if (orgs.length > orgIdx + 1) {
        addRepos(orgIdx + 1, repos);
      }
      else {
        $(function () {
          $("#num-repos").text(repos.length);

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

          $.each(repos.slice(0, 3), function (i, repo) {
            addRecentlyUpdatedRepo(repo);
          });
        });
      }
    });
  }

  addRepos();
})();
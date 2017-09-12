/*
NOTICE
The code herein was taken and modified in part from the Twitter open source portal - https://github.com/twitter/twitter.github.com
Modifications were made to include multiple organization accounts and display them differently
 */

(function () {
  /*
  To add an organization to the portal edit orgs and orgNameMap below
  For example in your github URL for your organization, the username follows right after: http://www.github.com/[user]
   */
  var orgs = ["sfgovdt","SFMOCI","sfcta","DataSF","OSVTAC"];

  /*
  Put the full title of your department below, keyed by the github user
  name you entered above, but normalized to lower-case.

  Don't forget to mind your commas and colons (no comma after the last entry in the list)
   */
  var orgNameMap = {
    sfmoci : "San Francisco Mayor's Office of Civic Innovation",
    sfcta : "San Francisco County Transportation Authority",
    sfgovdt : "San Francisco Department of Technology",
    datasf: "DataSF",
    osvtac: "San Francisco Open Source Voting System Technical Advisory Committee"
  };
  /*
  That's it, you only need to edit above to add your organization
   */

  // This stores custom organization URLs for those cases where the
  // organization does not have a standard GitHub URL.
  var orgUrls = {
    sfgovdt: "https://bitbucket.org/sfgovdt/"
  };

  // Put custom repo descriptions in this object, keyed by repo name.
  var repoDescriptions = {
    eas : "The Enterprise Addressing System (EAS) is an open source, web-based application that allows employees of government agencies to query, update, and retire street addresses.",
    CycleTracksWebsite : "Simple db and php code to catch data from iOS and Android CycleTracks apps."
  };

  var repoUrls = {
  };

  // Return the URL for an organization.
  function orgToUrl(org) {
    // First check for a non-GitHub URL.
    if (org in orgUrls) {
      return orgUrls[org.toLowerCase()];
    }
    return "https://github.com/" + org;
  }

  // Add an organization to index.html.
  function addOrg(org, orgName) {
    var anchor = $("<a>").text(orgName);
    var url = orgToUrl(org);
    anchor.attr("href", url);
    var $item = $("<li>").append(anchor);
    $("#orgs").append($item);
  }

  // Add all organizations to index.html.
  function addOrgs() {
    // First, sort the organizations by name.
    var orgNames = [];
    var orgNameToOrg = {};
    for (var i = 0; i < orgs.length; i++) {
      var org = orgs[i];
      var orgName = orgNameMap[org.toLowerCase()];
      orgNames.push(orgName);
      orgNameToOrg[orgName] = org;
    }
    orgNames.sort();

    // Then add the organizations.
    for (var i = 0; i < orgNames.length; i++) {
      var orgName = orgNames[i];
      var org = orgNameToOrg[orgName];
      addOrg(org, orgName);
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
    var $item = $("<div>").addClass("col-sm-4 repo");
    var $link = $("<a>").attr("href", repoUrl(repo)).attr("id",repo.id).appendTo($item);
    var $panel = $("<div>").addClass("panel panel-default " + (repo.language || '').toLowerCase()).appendTo($link);
    var $heading = $("<div>").addClass("panel-heading").appendTo($panel);
    $heading.append($("<h3>").addClass("panel-title").text(repo.name));
    $heading.append($("<small>").text(repo.language || ''));
    var $body = $("<div>").addClass("panel-body").appendTo($panel);
    $body.append($("<p>").text(repoDescription(repo)));
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

  addOrgs();
  addRepos();
})();

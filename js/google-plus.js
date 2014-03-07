function signinCallback(authResult) {
  if (authResult['access_token']) {
    document.getElementById('signinButton').setAttribute('style', 'display: none');
    access_token = authResult['access_token'];
    listPosts(null);
    collectPlusOneInfo();
  } else if (authResult['error']) {
    console.log("There was an error: " + authResult['error']);
  }
}

function disconnectUser() {
  var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + access_token;

  $.ajax({
    type: 'GET',
    url: revokeUrl,
    async: false,
    contentType: "application/json",
    dataType: 'jsonp',
    success: function(nullResponse) {
      document.getElementById('signinButton').setAttribute('style', 'display: inline');
      access_token = '';
      document.location = 'http://www.dear-jpn.com/google-plus/';
    },
    error: function(e) {
      console.log("There was an error: " + authResult['error']);
    }
  });
}

function toLocaleString(dt) {
    var r = / [A-Z]+$/;
    var y = '' + dt.getFullYear();
    var m = '0' + (dt.getMonth() + 1);
    var d = '0' + dt.getDate();
    var t = '0' + dt.toLocaleTimeString();
    return [ y.slice(-4), m.slice(-2), d.slice(-2) ].join( '/' ) + ' ' + t.replace(r, '').slice(-8);
}


function listPosts(page_token) {
  var revokeUrl = 'https://www.googleapis.com/plus/v1/people/me/activities/public?access_token=' + access_token + "&maxResults=" + listPostCount;
  if (page_token != null && page_token != '') {
      revokeUrl += '&pageToken=' + page_token;
  }

  document.getElementById('plusone-block').innerHTML = '';
  document.getElementById('plusone-post-block').innerHTML = '';

  $.ajax({
    type: 'GET',
    url: revokeUrl,
    async: false,
    contentType: "application/json",
    dataType: 'jsonp',
    success: function(json) {
      var html = "";
      for (var i = 0; i < json.items.length; i++) {
          var item = json.items[i];
          var dt = new Date(item.published);
          html += toLocaleString(dt) + ' <a href="#plusone" onclick="listPlusOne(\'' + item.id + '\', null, this)" title="' + item.title.substring(0, 128) + '...">' + item.title.substring(0, 10) + '...</a><br/>';
      }
      document.getElementById('post-block').innerHTML = html;
      if (json.nextPageToken == undefined) {
        document.getElementById('posts-next').innerHTML = '';
      } else {
        document.getElementById('posts-next').innerHTML = '<button onclick="listPosts(\'' + json.nextPageToken + '\')">投稿次頁</button>';
      }
    },
    error: function(e) {
      console.log("There was an error: " + authResult['error']);
    }
  });
}

function listPlusOne(activity_id, page_token, tagobj) {
  var revokeUrl = 'https://www.googleapis.com/plus/v1/activities/' + activity_id + '/people/plusoners?access_token=' + access_token + "&maxResults=" + listPlusOneCount;
  if (page_token != null && page_token != '') {
      revokeUrl += '&pageToken=' + page_token;
  }

  $.ajax({
    type: 'GET',
    url: revokeUrl,
    async: false,
    contentType: "application/json",
    dataType: 'jsonp',
    success: function(json) {
      var html = "";
      for (var i = 0; i < json.items.length; i++) {
          var item = json.items[i];
          var plusOneStatistics = '';
          var key = 'PO' + item.id;
          if (!plusOneInfo.collecting && (key in plusOneInfo.plusOner)) {
              plusOneStatistics = ' title="' + plusOneInfo.plusOner[key] + '/' + maxAnalyzePosts + '"';
          }
          html += '<img src="' + item.image.url + '" alt="' + item.displayName + '"' + plusOneStatistics + '/><a href="https://plus.google.com/' + item.id + '/posts" target="googleplus-plusone">' + item.displayName + '</a><br/>';
      }
      document.getElementById('plusone-block').innerHTML = html;
      if (json.nextPageToken == undefined) {
        document.getElementById('plusone-top').innerHTML = '';
        document.getElementById('plusone-next').innerHTML = '';
      } else {
        document.getElementById('plusone-top').innerHTML = '<button onclick="listPlusOne(\'' + activity_id + '\', null, null)">＋１先頭</button>';
        document.getElementById('plusone-next').innerHTML = '<button onclick="listPlusOne(\'' + activity_id + '\', \'' + json.nextPageToken + '\', null)">＋１次頁</button>';
      }
      if (tagobj != null) {
        document.getElementById('plusone-post-block').innerHTML = tagobj.getAttribute('title');
      }
    },
    error: function(e) {
      console.log("There was an error: " + authResult['error']);
    }
  });
}

function collectPlusOneInfo() {
  var revokeUrl = 'https://www.googleapis.com/plus/v1/people/me/activities/public?access_token=' + access_token + "&fields=items(id)&maxResults=" + maxAnalyzePosts;
  $.ajax({
    type: 'GET',
    url: revokeUrl,
    async: false,
    contentType: "application/json",
    dataType: 'jsonp',
    success: function(json) {
      var activities = [];
      for (var i = 0; i < json.items.length; i++) {
          var item = json.items[i];
          activities[i] = item.id;
      }
      plusOneInfo.activities = activities;
      collectPlusOner();
    },
    error: function(e) {
      console.log("There was an error: " + authResult['error']);
    }
  });
}

function collectPlusOner() {
  if (plusOneInfo.collecting) {
    var maxResults = 100;
    var revokeUrl = 'https://www.googleapis.com/plus/v1/activities/' + plusOneInfo.activities[plusOneInfo.postIndex] + '/people/plusoners?access_token=' + access_token + "&fields=items(id)&maxResults=" + maxResults;
    if (!(plusOneInfo.onerPageToken == undefined)) {
      revokeUrl += '&pageToken=' + plusOneInfo.onerPageToken;
    }
    $.ajax({
      type: 'GET',
      url: revokeUrl,
      async: false,
      contentType: "application/json",
      dataType: 'jsonp',
      success: function(json) {
        for (var i = 0; i < json.items.length; i++) {
            var item = json.items[i];
            var key = 'PO' + item.id;
            if (key in plusOneInfo.plusOner) {
                plusOneInfo.plusOner[key]++;
            } else {
                plusOneInfo.plusOner[key] = 1;
            }
        }
        plusOneInfo.onerPageToken = json.nextPageToken;
        if (json.nextPageToken == undefined) {
            plusOneInfo.postIndex++;
            document.getElementById('information-area').innerHTML = '' + plusOneInfo.postIndex + '/' + maxAnalyzePosts;
        }
        if (plusOneInfo.postIndex < maxAnalyzePosts) {
            collectPlusOner();
        } else {
            plusOneInfo.collecting = false;
            document.getElementById('information-area').innerHTML = '<input type="text" name="googleplus_id" id="googleplus_check_id" ondblclick="displayInfo(this)" />';
            console.log(plusOneInfo);
        }
      },
      error: function(e) {
        console.log("There was an error: " + authResult['error']);
      }
    });
  }
}

function displayInfo(element) {
    var key = 'PO' + element.value;
    if (key in plusOneInfo.plusOner) {
        document.getElementById('result-area').innerHTML = plusOneInfo.plusOner[key] + '/' + maxAnalyzePosts;
    } else {
        document.getElementById('result-area').innerHTML = '';
    }
}

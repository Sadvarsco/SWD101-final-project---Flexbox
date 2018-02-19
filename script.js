
const url = "https://api.github.com/users/GhettoMario/repos";
//const url = "https://api.github.com/users/joshvillbrandt/repos";

$(document).ready(function(){
    $("#button").click(function(){
        loadRepo(url, loadRepoCallback);
    });
              //const url = "https://api.github.com/users/GhettoMario";
    function loadRepo(url, callback) {
        const gitHubRequest = new XMLHttpRequest();
        gitHubRequest.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(this);
            }
        };
        gitHubRequest.open("GET", url, true);
        gitHubRequest.send();
       
          // Finish your request here
          // Don't forget the callback()
    };

      
      function loadRepoCallback(gitHubRequest) {
        let repolist = JSON.parse(gitHubRequest.responseText);
        //console.log(repolist);
        let nm = ""; //repolist.name; //name
        let ht = ""; //
        //console.log(repolist[0].name);
        //console.log(repolist[0].html_url);
        let printlist = "";
        for (i = 0; i < repolist.length; i++){
            nm = repolist[i].name; //repolist.name; //name
            ht = repolist[i].html_url; //
            console.log(repolist.length);
            console.log(repolist[i].name);
            console.log(repolist[i].html_url);
            printlist += "<li> Repo name: " + nm + "link: <a href=\"" + ht + "\">" + ht + "</a></li>";
            console.log(printlist);
        }

        document.getElementById('repolist').innerHTML = printlist;
        // Callback function needs to parse the JSON
        // Using the DOM get the element ID from your <ul> in your HTML
        // You will need a forEach to loop through the parsed object
        // Using the DOM create new list elements
        // Plug in the .html_url and .name from the parsed object.  To make this a link you'll need 
        // Append the new list items to the element you retrieved from HTML
      }

      $(".github").hover(function(){
          $(this).filter(':not(:animated)').animate({
                  height: '150px',
                  width: '150px'
                  });
                }, function(){
                    $(this).animate({
                        height: '60px',
                        width: '60px'
                     });
                    });
        $(".linkedin").hover(function(){
          $(this).filter(':not(:animated)').animate({
                  height: '120px',
                  width: '120px'
                  });
                }, function(){
                    $(this).animate({
                        height: '60px',
                        width: '60px'
                     });
                    });
        $(".instagram").hover(function(){
              $(this).filter(':not(:animated)').animate({
                      height: '150px',
                      width: '150px'
                  });
                }, function(){
                    $(this).animate({
                        height: '60px',
                        width: '60px'
                     });
                    });
});


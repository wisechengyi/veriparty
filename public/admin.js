/**
 * Created by yi-asus on 11/10/13.
 */
/**
 * Created by yi-asus on 11/10/13.
 */

Parse.initialize("VveomUP33i8fEQoMSW9WnTkphnqiSPavEIeTF6Rn", "U25IKmBdFY577LeGyF8LZhKMzGJfKIpY6OlSJP3P");
//var url = document.URL;
//var splitted = url.split('?');
//if (splitted.length<2 || splitted[1]==''){
//    alert('Error: no event id passed');
//    throw "Error: no event id passed";
//}
//var eventidfromurl = url.split('?').pop();


window.fbAsyncInit = function() {
    FB.init({
        appId: '582135378500426',
        status: true,
        cookie: true,
        xfbml: true,
        oauth: true
    });
    facebookLogin();
};

(function(d) {
    var js,
        id = 'facebook-jssdk';
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    d.getElementsByTagName('head')[0].appendChild(js);
} (document));


function facebookLogin() {
    FB.login(function(response) {
            console.log(response);
            if (response.authResponse) {
                console.log('Authenticated!');
                FB.api('/me', customhandle);
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        },
        {
            scope: 'email,user_checkins'
        });
};

function customhandle(myresponse){
    console.log(myresponse);
    var temp = $('<h1/>',
        {
            text: 'Your name is ' + myresponse.name + ' ' + myresponse.id
        });
    $('#name').html(temp);
    getEventInfo(myresponse);
//
//    console.log('Supplied event id: '+eventidfromurl);
//    var partycode = Parse.Object.extend("PartyCodes");
//    var query = new Parse.Query(partycode);
//    query.find({
//        success: function(results) {
////                                 alert("Successfully retrieved " + results.length + " scores.");
//            // Do something with the returned Parse.Object values
//            $('#userinfo').empty();
//            for (var i = 0; i < results.length; i++) {
//                var object = results[i];
//                var temp = $('<p/>',
//                    {
//                        text: object.get('event_id') + '-'+object.get('user_id')
//                    });
//                $('#userinfo').append(temp);
//            }
//        },
//        error: function(error) {
//            alert("Error: " + error.code + " " + error.message);
//        }
//    });
    // location.reload(); //or do whatever you want
};







function getEventInfo(user){
        FB.api('/me/events', function(events) {
        console.log('log events');
        console.log(events);
        for (var i=0;i<events.data.length;i++){
            var event_id = events.data[i].id;
            console.log(event_id);
            FB.api('/'+event_id, function(anEvent) {
//                console.log(anEvent);
                  if (anEvent.owner.id==user.id){
                      console.log(anEvent.name);
                      var eventButton= $('<p/>',
                          {
                              text: anEvent.name,
                              class: "success",
                              click: function () {
                                  showAttendingList(anEvent.id);
                              },
                              mouseenter: (function() {
                                  $(this).css('cursor','pointer');
                                  $(this).css('text-decoration','underline');
                              }),
                              mouseleave:(function() {$(this).css('text-decoration','none');})

                          });
                      $('#eventlist').append(eventButton);
                  }

            });
        }
//                var temp = $('<p/>',
//                    {
//                        text: 'matched user: ' + myresponse.data[i].name + ' in event ' + event_id
//                    });
//                $('#eventinfo').html(temp);
    });
};

function showAttendingList(event_id){
    FB.api('/'+event_id+'/attending', function(eventinfo) {
                console.log(eventinfo);
        $('#eventinfo').empty();
        $('#eventinfo').append("<table>");
        for (var i=0;i<eventinfo.data.length;i++){
            var user = eventinfo.data[i];
            queryThenPrint(event_id,user);
        }
    });
};

function queryThenPrint(event_id,user){
    //make sure the event_id, user_id
//    console.log(event_id);
//    console.log(user_id);
    var found = false;
    var Partycode = Parse.Object.extend("PartyCodes");
    var query = new Parse.Query(Partycode);
    query.equalTo("event_id", event_id);
    query.equalTo("user_id",user.id);
    query.first({
        success: function(object) {
            if (object===undefined){
                $('#eventinfo').append("<tr><td>"+user.name+"</td>"
                    + "<td>" +'false'+ "</td></tr>");
            }
            else{
                $('#eventinfo').append("<tr><td>"+user.name+"</td>"
                    + "<td>" + 'true' + "</td></tr>");
            }
        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
};

function writeToDatabase(event_id,user){

    //make sure the event_id, user_id
    var Partycode = Parse.Object.extend("PartyCodes");
    var query = new Parse.Query(Partycode);
    query.equalTo("event_id", event_id);
    query.equalTo("user_id",user.id);
    query.first({
        success: function(object) {
            if (object===undefined){
                console.log('no obejct returned, proceed to insert');
                // write it
//                     var Partycode = Parse.Object.extend("PartyCodes");
                var newEntry = new Partycode();
                newEntry.set("event_id", event_id);
                newEntry.set("user_id", user.id);
                newEntry.set("name",user.name);
                newEntry.set("is_marked",false);
                newEntry.save(null, {
                    success: function(newEntry) {
                        // Execute any logic that should take place after the object is saved.
                        alert('New object created with objectId: ' + newEntry.id);
                        makeQR(newEntry.id);

                    },
                    error: function(newEntry, error) {
                        // Execute any logic that should take place if the save fails.
                        // error is a Parse.Error with an error code and description.
                        alert('Failed to create new object, with error code: ' + error.description);
                    }
                });

            }
            else{
                var temp = $('<p/>',
                    {
                        text: 'You have already obtained a pass to this event with ID: ' + object.id
                    });
                $('#updates').html(temp);
                makeQR(object.id);

            }
//                 console.log(object);
            // Successfully retrieved the object.
        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
    return;


};

function makeQR(idstring){

    var qrtag = new QRtag();
    qrtag.data(idstring);
    qrtag.id("qrcode");
    qrtag.class_name("contactBackground");
    qrtag.size(256);
    qrtag.border(10);
    qrtag.color("#B00000");
    qrtag.bgcolor("#ffffff");
    qrtag.target();
    qrtag.print_image();
};
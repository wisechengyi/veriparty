/**
 * Created by yi-asus on 11/10/13.
 */
var url = document.URL;
var splitted = url.split('?');
//     if (splitted.length<2 || splitted[1]==''){
//         alert('Error: no event id passed');
//         throw "Error: no event id passed";
//     }
var eventidfromurl = url.split('?').pop();


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


function customhandle(myresponse){
    var temp = $('<h1/>',
        {
            text: 'Your name is ' + myresponse.name + ' ' + myresponse.id
        });
    $('#name').html(temp);
    getEventInfo(eventidfromurl,FB,myresponse.id);

    console.log('Supplied event id: '+eventidfromurl);
    var partycode = Parse.Object.extend("PartyCodes");
    var query = new Parse.Query(partycode);
    query.find({
        success: function(results) {
//                                 alert("Successfully retrieved " + results.length + " scores.");
            // Do something with the returned Parse.Object values
            $('#userinfo').empty();
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                var temp = $('<p/>',
                    {
                        text: object.get('event_id') + '-'+object.get('user_id')
                    });
                $('#userinfo').append(temp);
            }
        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
    // location.reload(); //or do whatever you want
};


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





function getEventInfo(event_id,FBhandle,userid){
    FBhandle.api('/'+event_id+'/attending', function(myresponse) {
        console.log(myresponse);
        for (var i=0;i<myresponse.data.length;i++){
            if (myresponse.data[i].id==userid) {
                var temp = $('<p/>',
                    {
                        text: 'matched user: ' + myresponse.data[i].name + ' in event ' + event_id
                    });
                $('#attendinglist').html(temp);
                writeToDatabase(event_id,userid);
                break;
            }

        }
    });

    FBhandle.api('/'+event_id, function(eventinfo) {
        console.log(eventinfo);
        var output='You are confirmed for the following event: ';
//        outupt=output+eventinfo.name+'\n\';
//        outupt=output+eventinfo.location+'\n';
//        outupt=output+eventinfo.start_time+'\n';
//        for(var key in eventinfo) {
//            if(eventinfo.hasOwnProperty(key)) {
//                output += eventinfo[key];
//            }
//        }
//        console.log(output);
//        var temp = $('<p/>',
//            {
//                text: 'You are confirmed for the following event: ' + object.id
//            });
        $('#eventinfo').append("<p>You are confirmed for the following event:</p>");
        $('#eventinfo').append("<table>");
        $('#eventinfo').append("<tr><td>name:</td><td>"+eventinfo.name+"</td></tr>");
        $('#eventinfo').append("<tr><td>location:</td><td>"+eventinfo.location+"</td></tr>");
        $('#eventinfo').append("<tr><td>time:</td><td>"+eventinfo.time+"</td></tr>");
        $('#eventinfo').append("</table>");
    });

};

function writeToDatabase(event_id,user_id){
    //make sure the event_id, user_id
    var Partycode = Parse.Object.extend("PartyCodes");
    var query = new Parse.Query(Partycode);
    query.equalTo("event_id", event_id);
    query.equalTo("user_id",user_id);
    query.first({
        success: function(object) {
            if (object===undefined){
                console.log('no obejct returned, proceed to insert');
                // write it
//                     var Partycode = Parse.Object.extend("PartyCodes");
                var gameScore = new Partycode();
                gameScore.set("event_id", event_id);
                gameScore.set("user_id", user_id);
                gameScore.set("is_marked",false);
                gameScore.save(null, {
                    success: function(gameScore) {
                        // Execute any logic that should take place after the object is saved.
                        alert('New object created with objectId: ' + gameScore.id);
//                        new QRCode(document.getElementById("qrcode"), gameScore.id);

                    },
                    error: function(gameScore, error) {
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
				//var qr = new QRCode(document.getElementById("qrcode"), {
				//	text: object.id,
				//	class: 'dropshadowclass'
				//	})
//                new QRCode(document.getElementById("qrcode"), object.id);

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
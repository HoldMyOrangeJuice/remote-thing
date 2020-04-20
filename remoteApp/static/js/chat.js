var MQ = MathQuill.getInterface(2);


function enable_draggable()
{
    console.log("enabling drag");
    $( "#draggable" ).draggable();
    $( "#draggable" ).draggable("enable");
}

function disable_draggable()
{
    console.log("disabling drag");
    $( "#draggable" ).draggable("disable");
}

function toggle(a) {
    let e = $(a);
    if (e.hasClass("hidden")) {
        e.removeClass("hidden");
        check_if_message_seen();
    }
    else
        e.addClass("hidden");

}

function add_message(msg)
{

    // PLEASE DONT FORGET TO VALIDATE INNER HTML BEFORE ADDING

    let time = msg.time;
    let text = msg.innerText;
    let latex = msg.innerLatex;
    let author = msg.author;
    let id = time;
    let cls;

    if (username===author)
    {
        // your message
        cls = msg.seen?"seen":""
    }
    else
    {
        cls = msg.seen?"saw":""
    }

    if (latex)
    {

        if ($("#here")[0])
            $("#here")[0].id = "";

        console.log("add inner latex");
        $(".messages").append(`<div id="${time}" class=\"message ${username===author?"you":"stranger"} ${cls}\"> 
        <div class="m-head"><p class="header-entry">${author} ●</p><p class="header-entry">${time}</p></div>
        <div class="m-body"><span id="here"></span></div>
        </div>`);

        let elem = $("#here")[0];
        console.log("to", elem);
        let mathField = MQ.MathField(elem,
            {
                spaceBehavesLikeTab: true, // configurable
                handlers:
                {
                    edit: function()
                    { // useful event handlers
                    }
                }
            });

        mathField.latex(latex);
        $(elem).removeClass("mq-editable-field");
    }
    else if (text)
    {
        //●
        $(".messages").append(`<div id="${time}" class=\"message ${username===author?"you":"stranger"} ${cls}\"> 
        <div class="m-head"><p class="header-entry">${author} ●</p> <p class="header-entry">${time}</p></div>
        <div class="m-body">${text}</div>
        </div>`)
    }

    // scroll

    let objDiv = document.getElementsByClassName("messages")[0];
    objDiv.scrollTop = objDiv.scrollHeight;

    check_if_message_seen();

}

function send_chat()
{
    let time = calcTime("+3.0");

    if ($('#math-field').hasClass("hidden"))
    {
        let f = $('#text-field');
        let msg = {"innerText":(f.val()), "time":time, "author": username};
        format_and_send_command({"messages":[msg]});
        f[0].value = "";
    }
    else
    {
        let latex = MQ.MathField($("#math-field")[0]).latex();
        console.log(latex);
        let msg = {};
        msg[time] = {"innerLatex":(f.val()), "time":time, "author": username};
        format_and_send_command({"messages":[msg]});
        MQ.MathField($("#math-field")[0]).latex("");
    }

}



function initialize_math_elem(e)
{
    console.log("init math");
    var mathFieldSpan = e;
    var MQ = MathQuill.getInterface(2); // for backcompat
    var mathField = MQ.MathField(mathFieldSpan, {
      spaceBehavesLikeTab: true, // configurable
      handlers: {
        edit: function() { // useful event handlers
            console.log(mathField.latex())
        }
      }
    });

}



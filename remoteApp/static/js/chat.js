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

function toggle(a, what) {
    let e = $(a);
    if (e.hasClass("hidden"))
    {
        e.removeClass("hidden");
        // show element
        console.log("show");
        if (what === "chat")
        {
            check_if_message_seen();
            format_and_send_command({"status_update": "online"});
        }

    }
    else
    {
        e.addClass("hidden");
        console.log("hide");
        if (what === "chat")
        {
            console.log("hide window add offline");
            format_and_send_command({"status_update": "offline"});
        }
    }

}

function add_message(message)
{

    // PLEASE DONT FORGET TO VALIDATE INNER HTML BEFORE ADDING

    let id = message.id;
    let time = message.time;
    let text = message.innerText;
    let latex = message.innerLatex;
    let author = message.author;

    let cls;
    console.log("whose msg", username, author);
    if (username===author)
    {
        // your message
        cls = message.seen?"seen":""
    }
    else
    {
        cls = message.seen?"saw":""
    }

    if (latex)
    {
        if ($("#here")[0])
            $("#here")[0].id = "";


        $(".messages").append(`<div id="${id}" class=\"message ${username===author?"you":"stranger"} ${cls}\"> 
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
        $(".messages").append(`<div id="${id}" class=\"message ${username===author?"you":"stranger"} ${cls}\"> 
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
    let id = `f${(+new Date).toString(16)}`;
    let time = calcTime("+3.0");

    if ($('#math-field').hasClass("hidden"))
    {
        let field = $('#text-field');

        let msg = {"id":id, "innerText":(field.val()), "time":time, "author": username};
        format_and_send_command({"messages":[msg]});
        field[0].value = "";
    }
    else
    {
        let field = $('#math-field');
        let latex = MQ.MathField(field[0]).latex();
        console.log(latex);
        let msg = {"id":id, "innerLatex":MQ.MathField(field[0]).latex(), "time":time, "author": username};
        format_and_send_command({"messages":[msg]});
        MQ.MathField(field[0]).latex("");
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



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
    if (e.hasClass("hidden"))
        e.removeClass("hidden");
    else
        e.addClass("hidden");
}

function add_message(msg)
{
    console.log("obj to add msg", msg);
    console.log("msg is mine", msg.author === IP, msg.author, IP);
    if (msg.innerLatex)
    {
        // PLEASE DONT FORGET TO VALIDATE INNER HTML BEFORE ADDING
    let mathFieldEl = document.createElement("span");
    mathFieldEl.className = `message ${msg.author === IP?"you":"stranger"}`;


     // for backcompat
    var mathField = MQ.MathField(mathFieldEl, {
      spaceBehavesLikeTab: true, // configurable
      handlers: {
        edit: function() { // useful event handlers

        }
      }
    });
    mathField.latex(msg.innerLatex);
    $(".messages").append($(mathFieldEl));
    $(mathFieldEl).removeClass("mq-editable-field");
    console.log(mathFieldEl)
    }
    else if (msg.innerText)
    {
        let e = document.createElement("p");
        e.className = `message ${msg.author === IP?"you":"stranger"}`;
        e.innerText = msg.innerText;
        $(".messages")[0].append(e);
    }

}

function send_chat()
{
    if ($('#math-field').hasClass("hidden"))
    {
        let f = $('#text-field');
        format_and_send_command({"messages":[{"innerText":(f.val()), "author":IP}]});
        f[0].value = "";
    }
    else
    {
        let latex = MQ.MathField($("#math-field")[0]).latex();
        console.log(latex);
        format_and_send_command({"messages":[{"innerLatex":latex, "author":IP}]});
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

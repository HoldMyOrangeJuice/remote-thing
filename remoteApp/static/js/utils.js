function send_action(action)
{
    socket.send(JSON.stringify({"action": action, "cookie": secret_cookie, "username": username}));
}

function handle_tool_change(tool)
{
    switch (tool)
    {
        case "line":
        case "pencil":
        case "text":
        case "erase":
            $(".movable_image").addClass("bottom");
            $(".movable_image").removeClass("top");
            break;

        case "edit background":
            $(".movable_image").addClass("top");
            $(".movable_image").removeClass("bottom");
            break;

    }
}

// increase for better performance
let x_min_ignored_dist = 20;
let y_min_ignored_dist = 20;
let ignored_line_dist = 5;


function dist(x0, y0, x1, y1) {
    return Math.sqrt(Math.pow(y1-y0, 2) + Math.pow(x1-x0, 2))
}

function toggle_math()
{
    let math_input = $("#math-field");
    let text_input = $("#text-field");

    if (math_input.hasClass("hidden"))
    {
        math_input.removeClass("hidden");
        text_input.addClass("hidden");
    }
    else
    {
    math_input.addClass("hidden");
    text_input.removeClass("hidden");
    }
}

function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
}

$(window).blur(function(){
  status = "offline";
  console.log("offline");
  format_and_send_command({"status_update": status})
});

$(window).focus(function(){
  status = "online";
  format_and_send_command({"status_update": status});
  check_if_message_seen();

});

function check_if_message_seen()
{
    for (let message of document.getElementsByClassName("message"))
    {
        if (!($(message).hasClass("saw")) && visible(message) && !($(message).hasClass("you"))
            && !$("#draggable").hasClass("hidden"))
        {
            $(message) .addClass("saw");
            console.log(message, "not seen");
            format_and_send_command({"seen":message.id})
        }
    }
}

function visible(e)
{
    let elementTop = $(e).offset().top;
    let elementBottom = elementTop + $(e).outerHeight();

    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom && document.hasFocus();

}

function add_status(t)
{
    let log = $(".log")[0];
    log.innerText += "\n" + t.toString()
}






class ClientMessage
{
    constructor(socket, data)
    {
        this.socket = socket;
        this.data = data;
        QUEUE.add(this);
    }


}

setInterval(()=>
{

    if (QUEUE.length > 0)
    {
        socket.send(JSON.stringify({"actions": QUEUE, "client": IP}));
        QUEUE = [];
    }
    if (COMMAND_QUEUE.length > 0)
    {
        socket.send(JSON.stringify({"commands": COMMAND_QUEUE, "client": IP}));
        COMMAND_QUEUE = [];
    }


}, 1000);

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
    console.log("toggle");
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

function push_line_obj_to_q(object)
{
    if (object)
    {
        console.log('line object done:', object);
        QUEUE.push({"line_obj":object})
    }

}

function push_erase_obj_to_q(object)
{
    if (object)
    {
        console.log('erase object done:', object);
        QUEUE.push({"erase_obj":object})
    }

}








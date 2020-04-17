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
}, 1000);

function handle_tool_change(tool)
{
    switch (tool)
    {

        case "erase":
            $(".movable_image").addClass("bottom");
            $(".movable_image").removeClass("top");
            break;
        case "pencil" || "text":
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

function push_line_coords_to_queue(x0, y0, x1, y1, color)
{

    if (QUEUE.length > 0)
    {
        for (let i = QUEUE.length - 1; i >= 0; i--)
    {
	    let action = QUEUE[i];
        if (action.line)
        {
            if (Math.abs(action.line.x0 - x1) < x_min_ignored_dist &&
                Math.abs(action.line.y0 - y1) < y_min_ignored_dist &&
                dist(action.line.x0, action.line.y0, action.line.x1, action.line.y1) < ignored_line_dist &&
                dist(x0, y0, x1, y1) < ignored_line_dist &&
                action.line.x1 === x0 && action.line.y1 === y0)

            {
                action.line.x1 = x1;
                action.line.y1 = y1;
            }
            else
            {
                QUEUE.push({"line":{
                    "x0":Math.round(x0),
                    "y0":Math.round(y0),
                    "x1":Math.round(x1),
                    "y1":Math.round(y1),
                    "c":color
                    }
                })
            }
            break;
        }
    }

    }
    else
    {
        QUEUE.push({"line":{
                "x0":Math.round(x0),
                "y0":Math.round(y0),
                "x1":Math.round(x1),
                "y1":Math.round(y1),
                "c":color
                }
            })
    }

}

function dist(x0, y0, x1, y1) {
    return Math.sqrt(Math.pow(y1-y0, 2) + Math.pow(x1-x0, 2))
}









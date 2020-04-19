function draw_line(x1, y1, x2, y2, color)
{


    let your_style = ctx.strokeStyle;

    if (color === "#ff1337")
    {
        ctx.strokeStyle = `rgb(${Math.random()*256}, ${Math.random()*256}, ${Math.random()*256})`;
    }
    else
        ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = your_style;

    //if (sync)
    //push_line_coords_to_queue(x1, y1, x2, y2, color);
}
function erase(x, y, thickness) {
    ctx.clearRect(x-thickness/2, y-thickness/2, thickness, thickness);
}

function clear_scene(sync_with_server)
{
    ctx.clearRect(0,0,1500, 1000);
    if (sync_with_server)
        QUEUE.push({"erase":{"x":0, "y":0, "thick": 3000}});
    console.log(document.getElementsByClassName("movable_image"));
    for (let image of document.getElementsByClassName("movable_image"))
    {
        if (sync_with_server)
            QUEUE.push({"del_image":{"id":image.id}});
    }
    $('.movable_image').remove();
}


function add_to_line_object(x0, y0, x1, y1, color, obj)
{
    let object = obj;
    if (object === undefined)
    {
        object = []
    }



    if (object.length > 0)
    {
        for (let i = object.length - 1; i >= 0; i--)
    {
	    let line = object[i];
        if (line)
        {
            if (Math.abs(line.x0 - x1) < x_min_ignored_dist &&
                Math.abs(line.y0 - y1) < y_min_ignored_dist &&
                dist(line.x0, line.y0, line.x1, line.y1) < ignored_line_dist &&
                dist(x0, y0, x1, y1) < ignored_line_dist &&
                line.x1 === x0 && line.y1 === y0)

            {
                line.x1 = x1;
                line.y1 = y1;
            }
            else
            {

                object.push({
                    "x0":Math.round(x0),
                    "y0":Math.round(y0),
                    "x1":Math.round(x1),
                    "y1":Math.round(y1),
                    "c":color

                    })
            }
            break;
        }
    }

    }
    else
    {

        object.push({
                "x0":Math.round(x0),
                "y0":Math.round(y0),
                "x1":Math.round(x1),
                "y1":Math.round(y1),
                "c":color

                })
    }

    return object


}

function add_to_erase_object(x, y, thickness, obj)
{
    console.log("add to erase", x, y);
    let object = obj;
    if (!object)
    {
        object = []
    }

    // simplify
    if(object.length > 0)
    {
        let prev_point = object[object.length-1];
        if (dist(x, y, prev_point.x, prev_point.y) > Math.min(prev_point.thick/2, thickness/2))
        {
            // significant distance between erase attempts
            object.push({"x":x, "y":y, "thick": thickness})
        }
    }
    else
    {
        object.push({"x":x, "y":y, "thick": thickness})
    }
    actions.push({"erase_obj":object});
    return object;
}

function handle_actions(actions)
{
    for (let action of actions) {

                if (action.undo || action.redo)
                {
                    clear_scene(false);
                }
                if (action.inactive)
                {

                    continue;
                }


                if (action.line_obj)
                {

                    for (let line of action.line_obj)
                    {


                        draw_line(line.x0,
                            line.y0,
                            line.x1,
                            line.y1,
                            line.c,
                            action.inactive,
                            false);
                    }

                }
                if (action.erase_obj) {
                    for (let erase_point of action.erase_obj)
                    erase(erase_point.x, erase_point.y, erase_point.thick);
                }
                if (action.add_image) {
                    let e = action.add_image;
                    add_image(e.x, e.y, e.url, e.id, false)
                }
                if (action.move_image) {
                    let e = action.move_image;
                    move_image(e.id, e.x, e.y, false);

                }
                if (action.del_image) {
                    let e = action.del_image;
                    delete_image(e.id, false)
                }
                if (action.text)
                {
                    set_text(action.text, false);
                }
                if (action.draw_text)
                {
                    add_canvas_text(action.draw_text.x, action.draw_text.y, action.draw_text.text, 0, action.draw_text.font, false);
                }
              }
}

function handle_commands(commands)
{
    for (let command of commands)
                {
                    if (command.command)
                    {
                        distribute_commands(command.command)
                    }
                    if (command.command_response)
                    {
                        command_response_handler(command);
                    }
                }
}

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


    console.log("obj before", JSON.stringify(object));
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
console.log("obj after", JSON.stringify(object));
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
    return object;
}

function handle_canvas_stuff(actions)
{

}

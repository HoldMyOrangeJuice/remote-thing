function draw_line(x1, y1, x2, y2, color, sync)
{
    let your_style = ctx.strokeStyle;

    if (color === "#ff1337")
        ctx.strokeStyle = `rgb(${Math.random()*256}, ${Math.random()*256}, ${Math.random()*256})`;
    else
        ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = your_style;

    if (sync)
    push_line_coords_to_queue(x1, y1, x2, y2, color);
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



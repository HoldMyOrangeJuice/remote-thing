function draw_line(x1, y1, x2, y2, color)
{
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function erase(x, y, thickness) {
    ctx.clearRect(x-thickness/2, y-thickness/2, thickness, thickness);
}

function clear_scene(sync_with_server)
{
    ctx.clearRect(0,0,1500, 1000);
    if (sync_with_server)
        QUEUE.push({"erase":{"x":0, "y":0, "thick": 3000}});

    for (let image of document.getElementsByClassName("movable_image"))
    {
        $(image).remove();

        if (sync_with_server)
            QUEUE.push({"del_image":{"id":image.id}});
    }
}

function set_text(t)
{

}

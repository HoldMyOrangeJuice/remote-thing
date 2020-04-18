// img class=movable_image id = UUID


function add_image(x, y, url, id, sync_with_server)
{
    let element = document.createElement("img");
    element.id = ( id===undefined?Math.random() *10**17:id ).toString();
    element.className += "movable_image noSelect";
    element.src = url;
    element.style.position = "absolute";
    element.style.left = x+"px";
    element.style.top = y+"px";
    document.getElementsByTagName("body")[0].appendChild(element);

    if (sync_with_server)
    {
        QUEUE.push({"add_image":{"x":x, "y":y, "url": url, "id":element.id}})
    }
}

function move_image(id, x, y, sync_with_server)
{
    let element = document.getElementById(id);

    if (tool === "edit background")
        $(element).addClass("top");

    element.style.left = x+"px";
    element.style.top = y+"px";
    if (sync_with_server)
    {
        QUEUE.push({"move_image":{"x":x, "y":y, "id": id}})
    }
}

function delete_image(id, sync_with_server)
{
    let element = document.getElementById(id);
    element.remove();
    if (sync_with_server)
    {
        QUEUE.push({"del_image":{"id": id}})
    }
}
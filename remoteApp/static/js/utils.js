class ClientMessage
{
    constructor(socket, initiator, data)
    {
        this.socket = socket;
        this.initiator = initiator;
        this.data = {};
        this.data["content"] = data;
        console.log(this.data)
    }

    send()
    {

        this.socket.send(JSON.stringify({
                "initiator": this.initiator,
                "data": this.data ,
                "client": IP}))

    }
}

function handle_tool_change(tool)
{
    switch (tool)
    {

        case "erase":
            $("#canvas")[0].style.zIndex = "4";
            $("#canvas-temp")[0].style.zIndex = "3";
            $("#movable-layer")[0].style.zIndex = "2";
            break;
        case "pencil" || "text":
            $("#canvas")[0].style.zIndex = "3";
            $("#canvas-temp")[0].style.zIndex = "4";
            $("#movable-layer")[0].style.zIndex = "2";
            break;
        case "edit background":
            $("#canvas")[0].style.zIndex = "2";
            $("#canvas-temp")[0].style.zIndex = "3";
            $("#movable-layer")[0].style.zIndex = "4";
            break;

    }
}

function update_canvas(data, initiator)
{
    console.log(data);

    console.log("drawing");
    let img = new Image();
    img.src = data;
    img.onload = ()=>
    {
        if (Initiator.Update.DataBaseUpdate.DeletionUpdate.client_canvas_deletion === initiator)
        {
            ctx.clearRect(0,0,1000,1000)
        }
        ctx.drawImage(img, 0, 0);
    }
}

function send_temp_canvas_data()
{
    ctx.drawImage(canvas_temp[0], 0, 0);

    ctx_temp.clearRect(0,0, 1000,1000);
    console.log("clear all now saved lines");

    let cl_msg = new ClientMessage(socket,
        Initiator.Update.DataBaseUpdate.AdditionUpdate.client_canvas_addition,
        canvas[0].toDataURL());
    cl_msg.send();

}











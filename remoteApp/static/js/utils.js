class ClientMessage
{
    constructor(socket, initiator, data, action)
    {
        this.socket = socket;
        this.initiator = initiator;
        this.data = {};
        this.data["content"] = data;
        let action_obj = {};
        action_obj[initiator] = action;
        this.data["action"] = action_obj;
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

class Action
{
    constructor(initiator, data)
    {
        this.i = initiator;
        this.d = data;
    }
    dump()
    {
        let init = this.i;
        let o = {};
        o[init] = this.d;
        return o
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

function send_canvas_update(initiator, action)
{
    let cl_msg = new ClientMessage(socket,
        initiator,
        canvas[0].toDataURL(),
        action);
    //cl_msg.send();

}

//{"context":{"erase":{x:x, y:y, w:w, h:h}}}
//{"context":{"draw":{x:x, y:y, x:x, y:y}}}











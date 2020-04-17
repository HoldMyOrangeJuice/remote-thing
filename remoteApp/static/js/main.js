let QUEUE = [];
let client_interaction=false;
let IP = Math.random()*10**17;
let eraser_thickness = 20;
const size = 1000;
    $.ajax({
  dataType: "json",
  url: 'http://gd.geobytes.com/GetCityDetails?callback=?',
  success: (data)=>
  {
      //IP = data.geobytesremoteip

  }
});



let last_image_drop = new Date().getTime();

function drop(evt)
{
    if (tool === "edit background")
        return;

    console.log(evt);
    if (new Date().getTime() - last_image_drop < 1000) {
        return;
    }

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


    img.onload = () => {
        let width = img.width;
        let height = img.height;
        add_image(page_x - width / 2, page_y - height / 2, url[1], undefined, true);

    };

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




let line_started = false;
let line_continued = false;
let cur_page = 228; // number is relative, i dont care

var tool = $("#toolbox").val();
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
        QUEUE.push({"text":t});
    Jtextarea.text(t);
}

document.addEventListener("mousemove", (e)=>
{



    let rect = canvas[0].getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;




    if (tool === "pencil" && mouseDown && e.target.tagName === "CANVAS")
    {
        if (!line_started)
        {
            line_started = {"x":x, "y":y};
        }
        else
        {
            draw_line(line_started.x, line_started.y, x, y, ctx.strokeStyle, true);
            line_started = false;
            line_continued = false;
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
        QUEUE.push({"erase":{"x":x, "y":y, "thick":eraser_thickness}});

        }

        if (e.target.id !== "canvas")
        {
            line_started = false;
            line_continued = false;
        }

});


let socket = new WebSocket("ws://"+location.host + location.pathname);

socket.onopen = function(event)
{
    console.log("socket opened!", event);
    QUEUE.push({"k":"v"})
};

socket.onmessage = function(event) {
    let data = JSON.parse(event.data);

    console.log(data);

    if (cur_page !== data.page)
    {
        clear_scene(false);
        cur_page = data.page
    }

    for (let action of data.actions) {

        if (action.line) {

            draw_line(action.line.x0,
                action.line.y0,
                action.line.x1,
                action.line.y1,
                action.line.c,
                false);
        }
        if (action.erase) {
            erase(action.erase.x, action.erase.y, action.erase.thick);
        }
        if (action.add_image) {
            let e = action.add_image;
            add_image(e.x, e.y, e.url, e.id, false)
        }
        if (action.move_image) {
            let e = action.move_image;
            move_image(e.id, e.x, e.y, false);

        }
        if (action.del_image) {
            let e = action.del_image;
            delete_image(e.id, false)
        }
        if (action.text)
        {
            set_text(action.text, false);
        }
        if (action.draw_text)
        {
            add_canvas_text(action.draw_text.x, action.draw_text.y, action.draw_text.text, 0, action.draw_text.font, false);
        }

        if (action.command) {
            if (action.command.command) {
                distribute_commands(action.command.command)
            }
            if (action.command.command_response) {
                command_response_handler(action);
                console.log(action);
            }
        }
    }

};

function clear_canvas(save)
{
    clear_scene(save)
}

function next()
{
    ctx.clearRect(0,0,1500,size);
    QUEUE.push({"page":"next"})
}
function prev()
{
    ctx.clearRect(0,0,1500,size);
    QUEUE.push({"page":"prev"})
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

    if (tool==="erase" && (ev.target.className.includes("temp") || ev.target.id==="canvas"))
    {
        erase_is_on = false;
    }

    $('div.temp.delete_on_mouse_up').remove();

    //ctx.fillText("Hello World", 10, 50);
    if (ev.target.tagName === "CANVAS")
    {
        // mouse up on canvas => line finished
        if (tool === "pencil")
        {
            line_started=false;
            line_continued=false;
            //{"client-canvas-update": "yas", "canvas-image": canvas[0].toDataURL()});

            // idk for what reason i have this one
            //let cl_msg = new ClientMessage(socket, Initiator.Update.DataBaseUpdate.AdditionUpdate.client_canvas_addition, canvas[0].toDataURL())
            //cl_msg.send()

        }
    }
    else if (line_started)
    {
        // line was started on canvas but mouse up outside
        //send_data({"client-canvas-update": "yas", "canvas-image": canvas[0].toDataURL()});
        //let cl_msg = new ClientMessage(socket, Initiator.Update.DataBaseUpdate.AdditionUpdate.client_canvas_addition, canvas[0].toDataURL());
        //cl_msg.send();
        line_started=false;
        line_continued=false;
        mouseDown=false;
    }
}


function mouse_down_handler(ev)
{
    if (tool === "erase" && (ev.target.id === "canvas" || ev.target.className.includes("temp")))
    {
        console.log("toggle erase to", !erase_is_on);
        erase_is_on = true;
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
    QUEUE.push({"draw_text":{"x":x-(parseInt(ctx.font)/4),
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



function send_your_last_interaction()
{
    QUEUE.push({"command": {"command": "send_interaction_pls"}});

}

function send_command(command_object)
{
    command_object.invoker = IP;
    QUEUE.push({"command":{"command": command_object}, "client": IP, });
    return {"command":{"command": command_object}, "client": IP, }
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


let undo_count = 0;

function undo()
{
    //undo_count ++;
}

function redo()
{
    //undo_count --;
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
let Jmsg_box = $("#chat-input");
let msg_box = Jmsg_box[0];
console.log(Jmsg_box);

let mode = "plain";



function add_overline()
{

    msg_box.innerHTML += "̅";
    placeCaretAtEnd( document.querySelector('div') );
}

function add_sqrt_sign()
{
    msg_box.innerHTML += "√";
    placeCaretAtEnd( document.querySelector('div') );
}

function add_sup()
{
    mode = "sup";
    console.log("rem sup");
    //$(".active-tag").removeClass("active-tag");
    msg_box.innerHTML += "<sub class='active-tag'>";

}

function add_sub()
{
    mode = "sub";
    console.log("rem sub");
    //$(".active-tag").removeClass("active-tag");
    msg_box.innerHTML += "<sub class='active-tag'>";


}


msg_box.addEventListener("mousedown",(e)=>
{
    placeCaretAtEnd(document.querySelector("div"));
});
msg_box.addEventListener("input", e=>
{

    let input = e.data;
    let active_tag = $('.active-tag')[0];

    if (active_tag)
    {
        let c =0;
        for(let i = msg_box.innerHTML.length; i >=0; i--)
        {
            if (msg_box.innerHTML.charAt(i) === input)
                c++;
            if (c === 2)
            {
                console.log(msg_box.innerHTML.slice(0, i), msg_box.innerHTML.slice(i+1, msg_box.innerHTML.length));
                msg_box.innerHTML = msg_box.innerHTML.slice(0, i) + msg_box.innerHTML.slice(i+1, msg_box.innerHTML.length);
                break;
            }

        }
        //msg_box.innerHTML = msg_box.innerHTML.slice(0, -1);
        console.log("removed original input");

        if (input === null)
        {
            console.log("remove", input, "from", active_tag);
            active_tag.innerHTML = active_tag.innerHTML.slice(0, -1)
        }
        else
        {
            console.log("add", input, "to", active_tag);
            active_tag.innerHTML += input;
        }

        //msg_box.innerHTML = msg_box.innerHTML.slice(0, -1)
    }
    placeCaretAtEnd(document.querySelector("div"));

});




function placeCaretAtEnd(el) {
    disable_draggable();
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
    setTimeout(enable_draggable, 100);
}


function enable_draggable()
{

    $( "#draggable" ).draggable();
    $( "#draggable" ).draggable("enable");
}

function disable_draggable()
{

    $( "#draggable" ).draggable("disable");
}

function toggle(a)
{
    let e = $(a);
    if (e.hasClass("hidden"))
        e.removeClass("hidden");
    else
        e.addClass("hidden");
}


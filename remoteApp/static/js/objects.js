


class AdditionUpdate
{
    static client_canvas_addition = "client_canvas_addition";
    static client_text_addition = "client_text_addition";
    static client_bg_addition = "client_bg_addition";
}
class DeletionUpdate
{
    static client_canvas_deletion = "client_canvas_deletion";
    static client_text_deletion = "client_text_deletion";
    static client_bg_deletion = "client_bg_deletion";
}

class DataBaseUpdate
{
    static AdditionUpdate = AdditionUpdate;
    static  DeletionUpdate = DeletionUpdate;


}

class PageUpdate
{
    static next_page = "next_page";
    static prev_page = "prev_page";
}


class ConsumerUpdate
{
    static PageUpdate = PageUpdate;
}

class Update
{
    static DataBaseUpdate = DataBaseUpdate;
    static ConsumerUpdate = ConsumerUpdate;

}








class CommandType
{
    static get_from_client = "get_from_client";
    static send_to_invoker = "send_to_invoker";
}

class Commands
{
    static play_sound = "play_sound_command";
    static last_interaction = "last_interaction_command";
    static log = "log_command"
}


class Initiator
{
    static Commands = Commands;
    static Update = Update;
}


class Field
{
    static canvas = "canvas_image";
    static text = "text";
    static bg = "bg_images";
}



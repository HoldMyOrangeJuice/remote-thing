""" тут столько оберток,
что если протянуть их вокруг земного шара,
то толщина объектно-ориентированного слоя достанет до луны """


class AdditionUpdate:
    client_canvas_update = "client_canvas_addition"
    client_text_update = "client_text_addition"
    client_bg_update = "client_bg_addition"


class DeletionUpdate:
    client_canvas_update = "client_canvas_delete"
    client_text_update = "client_text_delete"
    client_bg_delete = "client_bg_delete"


class DataBaseUpdate:
    AdditionUpdate = AdditionUpdate
    DeletionUpdate = DeletionUpdate

class PageUpdate:
    next_page = "next_page"
    prev_page = "prev_page"


class ConsumerUpdate:
    PageUpdate = PageUpdate


class Update:
    DataBaseUpdate = DataBaseUpdate
    ConsumerUpdate = ConsumerUpdate


class CommandType:
    get_from_client = "get_from_client"
    send_to_invoker = "send_to_invoker"


class Commands:
    play_sound = "play_sound"
    last_interaction = "last_interaction"
    log = "log"


class Initiator:
    Commands = Commands
    Update = Update


class Field:

    canvas = "canvas"
    text = "text"
    bg = "bg"

    @staticmethod
    def __iter__():
        return ["canvas", "text", "bg"]





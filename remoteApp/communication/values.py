"""



"""


class Update:

    client_canvas_update = "client_canvas_update"
    client_text_update = "client_text_update"
    client_bg_update = "client_bg_update"


class CommandType:
    get_from_client = "get_from_client"
    send_to_invoker = "send_to_invoker"


class Commands:
    play_sound = "play_sound"
    last_interaction = "last_interaction"


class Initiator:
    Commands = Commands
    Update = Update


class Field:

    canvas = "canvas_image"
    text = "text"
    bg = "bg_images"

    @staticmethod
    def __iter__():
        return [p for p in dir(Field) if isinstance(getattr(Field, p), property)]





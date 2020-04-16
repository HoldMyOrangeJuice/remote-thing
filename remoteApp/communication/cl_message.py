import json
from remoteApp.communication.values import Update, Field
from remoteApp.communication.sv_message import ServerMessage
from remoteApp.communication.Page import Page
from channels.db import database_sync_to_async


class ClientMessage:
    # {"initiator": .initiator, "data":.data }

    def __init__(self, obj):

        data = json.loads(obj)

        # object, contains full event data. can be multi-layered
        self.actions = data.get("actions")
        self.ip = data.get("client")

    async def handle_message(self):
        from remoteApp.consumers import Consumer
        bulk_to_add = []
        for action in self.actions:
            # action is { "action":{} }

            if list(action.keys())[0] == "line":
                bulk_to_add.append(action)

            if list(action.keys())[0] == "erase":
                bulk_to_add.append(action)

            if list(action.keys())[0] == "add_image":
                bulk_to_add.append(action)

            if list(action.keys())[0] == "move_image":
                bulk_to_add.append(action)

            if list(action.keys())[0] == "del_image":
                bulk_to_add.append(action)

            if list(action.keys())[0] == "text":
                bulk_to_add.append(action)
            if list(action.keys())[0] == "draw_text":
                bulk_to_add.append(action)


            # send update to consumers only for scene upd
            # await self.send_update_to_consumers(client_msg)
            sv_msg = ServerMessage(actions=bulk_to_add,
                                   page=Consumer.current_page,
                                   all_consumers=Consumer.get_consumers(),
                                   except_consumer=get_consumer(self.ip))
            await sv_msg.send()

            #########################################

            if get_key(action) == "page":
                from remoteApp.consumers import Consumer
                if action.get("page") == "next":
                    Consumer.set_page(Consumer.current_page + 1)
                    print("+1 to page", Consumer.current_page)

                if action.get("page") == "prev":
                    Consumer.set_page(Consumer.current_page - 1)
                    print("-1 to page", Consumer.current_page)

                sv_msg = ServerMessage(actions=await self.get_actions(Consumer.current_page),
                                       page=Consumer.current_page,
                                       all_consumers=Consumer.get_consumers())
                await sv_msg.send()

            #########################################
            if list(action.keys())[0] == "command":

                if get_key(action.get("command")) == "command":
                    command = action['command'].get('command')

                    # filter commands server meant to handle
                    if command.get("delete_page") is not None:

                        page_to_del = command.get("delete_page")
                        await self.del_page(page_to_del)

                    else:
                        invoker = self.ip
                        sv_msg = ServerMessage(actions=[{"command": {"command": command, "invoker": invoker}}],
                                               page=get_consumer(invoker).current_page,
                                               except_consumer=get_consumer(invoker),
                                               all_consumers=Consumer.get_consumers())
                        await sv_msg.send()

                if get_key(action.get("command")) == "command_response":
                    response = action['command'].get('command_response')
                    invoker = response.get("invoker")
                    sv_msg = ServerMessage(actions=[{"command": {"command_response": response}, "client": self.ip}],
                                           page=get_consumer(invoker).current_page,
                                           consumer=get_consumer(invoker))
                    await sv_msg.send()

        await self.save_to_db(bulk_to_add, Consumer.current_page)

    @database_sync_to_async
    def save_to_db(self, bulk_to_add, page):
        page = Page(index=page)
        page.append_bulk(bulk_to_add)

    @database_sync_to_async
    def get_actions(self, page):
        page = Page(index=page)
        return page.get_actions()

    @database_sync_to_async
    def del_page(self, p):
        page = Page(index=p)
        page.delete()


def get_key(d):
    return list(d.keys())[0]


def get_consumer(ip):
    from remoteApp.consumers import Consumer
    return Consumer.consumers.get(ip)














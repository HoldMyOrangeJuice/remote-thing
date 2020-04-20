import json
from remoteApp.communication.values import Update, Field
from remoteApp.models import PageData, Chat, Users
from remoteApp.communication.sv_message import ServerMessage
from remoteApp.communication.Page import Page
from channels.db import database_sync_to_async


class ClientMessage:
    # {"initiator": .initiator, "data":.data }

    def __init__(self, obj):

        data = json.loads(obj)

        # object, contains full event data. can be multi-layered
        self.action = data.get("action")
        self.command = data.get("command")
        self.response = data.get("response")

        self.cookie = data.get("cookie")
        self.username = data.get("username")
        self.invoker = data.get("invoker")
        self.receiver = data.get("receiver")


    async def handle_message(self):
        from remoteApp.consumers import Consumer
        bulk_to_add = []

        if self.action:

                action = self.action
                print(action)
                if get_key(action) == "line_obj":
                    bulk_to_add.append(action)

                if get_key(action) == "erase_obj":
                    bulk_to_add.append(action)

                if get_key(action) == "add_image":
                    bulk_to_add.append(action)

                if get_key(action) == "move_image":
                    bulk_to_add.append(action)

                if get_key(action) == "del_image":
                    bulk_to_add.append(action)

                if get_key(action) == "text":
                    bulk_to_add.append(action)

                if get_key(action) == "draw_text":
                    bulk_to_add.append(action)

                await self.save_to_db(bulk_to_add, Consumer.current_page)

                if action.get("undo"):

                    actions = await self.get_actions(Consumer.current_page)

                    for i in reversed(list(range((len(actions))))):
                        action_of_db = actions[i]
                        if not action_of_db.get("inactive"):
                            action_of_db["inactive"] = True
                            print("undo", i)
                            break

                    undo = [{"undo": "undo"}]
                    undo.extend(actions)

                    await self.set_actions(Consumer.current_page, actions)
                    sv_msg = ServerMessage(actions=undo,
                                           page=Consumer.current_page,
                                           all_consumers=Consumer.get_consumers(),
                                           except_consumer=get_consumer(self.invoker))  # undos are made locally on client as well
                    await sv_msg.send()

                if action.get("redo"):

                    actions = await self.get_actions(Consumer.current_page)
                    for i in reversed(list(range(len(actions)))):
                        action_of_db = actions[i]
                        if action_of_db.get("inactive") and (i == 0 or not actions[i-1].get("inactive")):
                            action_of_db["inactive"] = False
                            print("redo", i)
                            break

                    await self.set_actions(Consumer.current_page, actions)

                    redo = [{"redo": 'redo'}]
                    redo.extend(actions)

                    sv_msg = ServerMessage(actions=redo,
                                           page=Consumer.current_page,
                                           all_consumers=Consumer.get_consumers(),
                                           except_consumer=get_consumer(self.invoker))  # redos are made locally on client as well
                    await sv_msg.send()

                print("sending actions")
                sv_msg = ServerMessage(actions=bulk_to_add,
                                       page=Consumer.current_page,
                                       all_consumers=Consumer.get_consumers(),
                                       except_consumer=get_consumer(self.invoker))
                await sv_msg.send()

                if action.get("page"):
                    from remoteApp.consumers import Consumer
                    if action.get("page") == "next":
                        Consumer.set_page(Consumer.current_page + 1)

                    if action.get("page") == "prev":
                        Consumer.set_page(Consumer.current_page - 1)

                    sv_msg = ServerMessage(actions=await self.get_actions(Consumer.current_page),
                                           page=Consumer.current_page,
                                           all_consumers=Consumer.get_consumers())
                    await sv_msg.send()

        if self.command:
                        print(f"GOT COMMAND:\nfrom: {self.username} = {self.invoker}\n com is: {self.command}\n cookie: {self.cookie}")
                        command = self.command

                        if self.receiver == "all" or self.receiver is None:
                            receiver = Consumer.get_consumers()
                        else:
                            receiver = get_consumer(self.receiver)

                        # filter commands server meant to handle
                        if command.get("delete_page") is not None:
                            page_to_del = command.get("delete_page")
                            await self.del_page(page_to_del)
                        if command.get("messages"):
                            for message in command.get("messages"):
                                # validate message here
                                if not await self.user_is_valid(u=self.invoker, c=self.cookie) or \
                                        not await self.user_is_valid(u=message.get("author"), c=self.cookie) :
                                    return
                                await add_message(message)
                        if command.get("seen"):
                            id_of_seen_msg = command.get("seen")
                            await see_message(id_of_seen_msg)

                        print("sending command")
                        sv_msg = ServerMessage(commands=[{"command": self.command, "invoker": self.invoker}],
                                               page=Consumer.current_page,
                                               all_consumers=receiver)
                        await sv_msg.send()



        if self.response:
            print("sending response")
            response = self.response
            sv_msg = ServerMessage(commands=[{"command_response": response, "client": self.username}],
                                   page=get_consumer(self.invoker).current_page,
                                   consumer=get_consumer(self.invoker))
            await sv_msg.send()


    @database_sync_to_async
    def save_to_db(self, bulk_to_add, page):
        page = Page(index=page)
        page.append_bulk(bulk_to_add)

    @database_sync_to_async
    def set_actions(self, page, data):
        page = Page(index=page)
        page.set_actions(data)

    @database_sync_to_async
    def get_actions(self, page):
        page = Page(index=page)
        return page.get_actions()

    @database_sync_to_async
    def del_page(self, p):
        page = Page(index=p)
        page.delete()

    @database_sync_to_async
    def user_is_valid(self, u, c):
        if Users.objects.all().filter(username=u, cookie=c).count() > 0:
            return True
        return False


def get_key(d):
    try:
        return list(d.keys())[0]
    except:
        return ""


def get_consumer(username):
    from remoteApp.consumers import Consumer
    return Consumer.consumers.get(username)


@database_sync_to_async
def get_messages():
    try:
        print("getting messages", Chat.objects.all()[0].messages)
        return Chat.objects.all()[0].messages
    except:
        print("error while getting msgs")
        return None


@database_sync_to_async
def add_message(msg_obj):
    if len(Chat.objects.all()) > 0:
        messages = Chat.objects.all()[0].messages
    else:
        messages = Chat.objects.all().create().messages

    messages.append(msg_obj)
    print("updated messages", messages)
    c = Chat.objects.all()[0]
    c.messages = messages
    c.save()


@database_sync_to_async
def see_message(id):
    print("seen", id)
    # [{"id":{}}]
    msgs = Chat.objects.all()[0].messages
    for msg in msgs:
        print("mesasge", msg)
        if msg.get("time") == id:
            msg["seen"] = True
            print("upd", msg)

            e = Chat.objects.all()[0]
            print("upds", msgs)
            e.messages = msgs
            e.save()











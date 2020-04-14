import json
from remoteApp.communication.values import Update, Field
from remoteApp.communication.Message import Message
from remoteApp.communication.Page import Page
from channels.db import database_sync_to_async


class ClientMessage(Message):
    # {"initiator": .initiator, "data":.data }

    def __init__(self, obj):

        data = json.loads(obj)

        self.initiator = data.get("initiator")
        # object, contains full event data. can be multi-layered
        self.data = data.get("data")
        self.ip = data.get("client")
        super().__init__(initiator=self.initiator, data=self.data, client=self.ip)

    @database_sync_to_async
    def save_changes(self, to_page):

        if self.is_addition() or self.is_deletion():
            page = Page(to_page)

            if self.updated_field() == Field.bg:
                # [{}, {}, {}]

                data = page.get_data(Field.bg)

                if self.is_addition():

                    data.append(self.data)
                    updated_data = data


                else:

                    to_del = []
                    for item in data:
                        if item.get("url") == self.data.get("url"):
                            to_del.append(item)
                    for i in to_del:
                        del data[data.index(i)]
                    updated_data = data

                self.data = updated_data


            page.update_data(data=self.data, field=self.updated_field())










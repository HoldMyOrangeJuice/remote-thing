from remoteApp.models import PageData
from channels.db import database_sync_to_async
import datetime

class Page:

    def __init__(self, index):

        queryset = PageData.objects.all().filter(page=index)
        if queryset.count() == 0:
            # there is no page obj created for that page index
            self.obj = PageData.objects.create(page=index)
        else:
            self.obj = queryset[0]

    def append_action(self, action):
        e = self.get_actions()
        e.append(action)
        self.set_actions(e)

    def append_bulk(self, bulk):
        e = self.get_actions()
        e.extend(bulk)
        self.set_actions(e)

    def get_actions(self):
        return self.obj.actions

    def set_actions(self, data):
        self.obj.actions = data
        self.obj.save()
        print("updated action pattern at", datetime.datetime.now().strftime("%H:%M:%S"))

    def delete(self):
        self.obj.delete()




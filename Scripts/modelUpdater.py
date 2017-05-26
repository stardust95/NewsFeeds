#coding=utf-8
import requests, json, sys, configparser, tempfile
from pymongo import *
from newsCrawler import getConnection
from traceback import print_exc

filename = 'config.ini'
section = 'api'

class RecommendModel():
    def __init__(self):
        config = configparser.RawConfigParser()
        config.read(filename)
        self.endpoint = config.get(section, 'endpoint')
        self.token = config.get(section, 'token')
        self.modelid = config.get(section, 'modelid')
        self.HEADERS_STREAM = {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": self.token
        }
        self.HEADERS_JSON = {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": self.token
        }
        self.colName = 'news'

    def updateCatalog(self):
        catalogurl = self.endpoint + '/models/%s/catalog' % self.modelid
        header = self.HEADERS_STREAM
        collection = getConnection('mongo')[self.colName]
        temp = tempfile.TemporaryFile()
        try:
            for news in collection.find({ "uploaded": False }):
                tags = []
                for tag in news["keywords"]:
                    tags.append("tag="+tag)
                temp.write((','.join([str(news["_id"]), news["title"], news["genre"], ""] + tags)+"\n").encode())
            temp.seek(0)
            resp = requests.patch(catalogurl, data=temp, headers=header)
            result = json.loads(resp.text)
            print("result = " + str(result))
            if resp.status_code == 200:    
                collection.update_many({ "uploaded": False }, 
                                                { "$set": { "uploaded": True }  }, upsert=False)
        except:
            print_exc()
        finally:
            temp.close()

    def generateUsageFile(self, size, filename = 'usage.txt'):
        collection = getConnection('mongo')[self.colName]
        temp = tempfile
        try:
            items = collection.find({})
            with open(filename, 'wb') as file:
                for i in range(0, size):    # TODO: usage file format
                    file.write((','.join([])+"\n").encode())

if __name__ == "__main__":
    model = RecommendModel()
    model.updateCatalog()


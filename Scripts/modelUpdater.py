#coding=utf-8
import requests, json, sys, configparser, tempfile
from pymongo import *
from newsCrawler import getConnection
from traceback import print_exc
import random
from datetime import datetime
import gc
import gensim

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
        self.modelColName = 'recommendModel'
        self.timeFormat = '%Y/%m/%dT%H:%M:%S'
        self.word2vecModel = '../wiki/wiki.zh.text.model'

    def updateCatalog(self):
        catalogurl = self.endpoint + '/models/%s/catalog' % self.modelid
        header = self.HEADERS_STREAM
        collection = getConnection('mongo')[self.colName]
        temp = tempfile.TemporaryFile()
        try:
            for news in collection.find({ "uploaded": False }):
                tags = []
                itemName = "||".join([news["genre"], news["title"], news["imgurls"][0] if len(news["imgurls"]) > 0 else ""])
                for tag in news["keywords"]:
                    tags.append("tag="+tag)
                temp.write((','.join([str(news["_id"]), itemName, news["genre"], ""] + tags)+"\n").encode())
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

    def triggerBuild(self):
        collection = getConnection('mongo')[self.modelColName]
        header = self.HEADERS_JSON
        buildurl = self.endpoint + '/models/%s/builds?' % (self.modelid)
        body = json.dumps({
            "description": "Simple recomendations build",
            "buildType": "recommendation",
            "buildParameters": {
                "recommendation": {
                    "numberOfModelIterations": 40,
                    "numberOfModelDimensions": 20,
                    "itemCutOffLowerBound": 1,
                    "itemCutOffUpperBound": 10,
                    "userCutOffLowerBound": 0,
                    "userCutOffUpperBound": 0,
                    "enableModelingInsights": False,
                    "useFeaturesInModel": True,
                    "modelingFeatureList": "tag",
                    "allowColdItemPlacement": True,
                    "enableFeatureCorrelation": True,
                    "reasoningFeatureList": "tag",
                    "enableU2I": True
                }
            }
        })
        try:
            resp = requests.post(buildurl, body, headers=header)
            result = json.loads(resp.text)
            print("url = ", buildurl)
            print(result)
            if resp.status_code == 202: # success
                collection.insert({
                    "buildId": result["buildId"],
                    "time": datetime.now().strftime(self.timeFormat),
                    "modelId": self.modelid,
                    "token": self.token
                })
        except:
            print_exc()

    def generateUsageFile(self, size, users = [], filename = 'usage.txt'):
        collection = getConnection('mongo')[self.colName]
        # temp = tempfile.TemporaryFile()
        try:
            items = []
            for news in collection.find({}):
                items.append(news)
            with open(filename, 'wb') as file:
                for i in range(0, size):    # TODO: look up usage file format
                    file.write((','.join([
                        users[random.randint(0, len(users)-1)].replace('@','-').replace('.','_'),        # userid
                        str(items[random.randint(0, len(items)-1)]["_id"]),                         # itemid
                        datetime.now().strftime(self.timeFormat),
                        "Purchase"
                    ])+"\n").encode())
        except:
            print_exc()
        finally:
            # temp.close()
            pass

    def deleteEarlyModel(self):
        collection = getConnection('mongo')[self.modelColName]
        try:
            buildids = []
            header = self.HEADERS_JSON
            for item in collection.find().sort("time", ASCENDING):
                buildids.append(item)
            # print(buildids)
            if len(buildids) > 0:
                buildurl = self.endpoint + '/models/%s/builds/%s' % (self.modelid, buildids[0]["buildId"])
                resp = requests.delete(buildurl, headers=header)
                print("delete status = ", resp.status_code)
                # result = json.loads(resp.text)
                if resp.status_code == 200 or resp.status_code == 204:    
                    collection.delete_one(buildids[0])

        except:
            print_exc()

    def buildRelated(self):
        collection = getConnection('mongo')[self.colName]
        model = gensim.models.Word2Vec.load(self.word2vecModel)
        try:
            for news in collection.find({ "related_words": { "$exists": 0 } }, projection={"keywords":1, "title": 1, "_id": 1}):
                relatedWords = set()
                for keyword in news["keywords"]:
                    try:
                        relatedWords |= set(map(lambda t: t[0], model.most_similar(keyword)))
                    except KeyError:
                        print("KeyError:", keyword)
                        continue
                print(news["title"])
                collection.update_one({"_id": news["_id"]}, 
                                        {"$set": { "related_words": list(relatedWords) }})
        except:
            print_exc()
        finally:
            model = None
            gc.collect()

if __name__ == "__main__":
    model = RecommendModel()
    # model.updateCatalog()
    # model.deleteEarlyModel();
    model.buildRelated()
    # model.generateUsageFile(1000, ['546816713@qq.com'])
    # model.triggerBuild()

import newsCrawler
import modelUpdater
import time, configparser
import schedule
from traceback import print_exc

model = modelUpdater.RecommendModel()

def getConfig(section, item, config_name = 'config.ini'):
    config = configparser.RawConfigParser()
    config.read(config_name)
    return config.get(section, item)

def updateModel():
    global model
    model.deleteEarlyModel() 
    model.triggerBuild()

def main():
    global model
    toutiao = newsCrawler.Toutiao()
    loop = 1
    interval = int(getConfig('default', 'request_interval'))
    schedule.every().day.do(updateModel)

    try:
        while True:
            toutiao.start()
            model.updateCatalog()
            loop = loop + 1
            print('loop = ', loop)
            time.sleep(interval)
    except:
        print_exc()
        exit()

if __name__ == '__main__':
    main()

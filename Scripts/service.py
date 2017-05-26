import newsCrawler
import modelUpdater
import time, configparser
from traceback import print_exc

def getConfig(section, item, config_name = 'config.ini'):
    config = configparser.RawConfigParser()
    config.read(config_name)
    return config.get(section, item)

def main():
    toutiao = newsCrawler.Toutiao()
    model = modelUpdater.RecommendModel()
    loop = 1
    interval = int(getConfig('default', 'request_interval'))
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

#coding=utf-8
import requests, json, sys, configparser
from bs4 import BeautifulSoup
from traceback import print_exc
from pymongo import *


HEADERS = {
    'Accept':'text/html',
    # 'Connection':'keep-alive',
    'User-Agent': '''Mozilla/5.0 (Windows NT 10.0; Win64; x64)
    AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36'''
}

def getConnection(section, configName = 'config.ini'):
    config = configparser.RawConfigParser()
    config.read(configName)
    host = config.get(section, 'db_host')
    port = config.get(section, 'db_port')
    name = config.get(section, 'db_name')
    # dbuser = config.get(section, 'db_user')
    # dbpass = config.get(section, 'db_pass')
    return MongoClient(host, int(port))[name]

class Tencent():
    def __init__(self):
        '''
            Fileds to be saved:
                title
                docurl
                imgs: array
                keywords: array
                commentNum
                commenturl
                time
                source
        '''
        self.ADDRS_LIST = {
            'http://society.qq.com/': 'society',
            'http://ent.qq.com/': 'entertain',
            'http://sports.qq.com/': 'sport',
            'http://finance.qq.com/': 'finance',
            'http://mil.qq.com/mil_index.htm': 'war',
            'http://news.qq.com/world_index.shtml': 'global',
            'http://cul.qq.com/': 'culture'
        }
    
    def start(self):
        for (addr, catogory) in self.ADDRS_LIST.items():
            response = requests.get(addr, HEADERS)
            if response.status_code != 200:
                print('response code = ', response.status_code)
                exit()
            soup = BeautifulSoup(response.text, "html.parser")
            lists = soup.findAll('div', {'class' : 'list'})
            for list in lists:
                for item in list.findAll('div', {'class' : ['Q-tpWrap', 'Q-pList'] }):
                    try:
                        linkto = item.find('a', {'class' : 'linkto'})
                        title = linkto.text
                        docurl = linkto.get('href')
                        keywords = item.find('span',{'class':'keywords'}).text
                        imgs = [ a.get('src') if a.get('src') else a.get('_src') for a in item.findAll('img')]
                        comment = item.find('a', {'class' : 'discuzBtn'})
                        if comment:
                            commentNum = comment.text
                            commenturl = comment.get('href')
                        source = item.find('span', {'class' : 'from'}).text
                        print(catogory, title.strip())
                        # print(title, docurl, imgs, keywords.strip(), commentNum.strip(), source.strip())
                    except:
                        print_exc()
                        exit()
                        

class Netease():
    def __init__(self):
        self.NEWS_ADDR = 'http://temp.163.com/special/00804KVA/cm_%s.js?callback=data_callback'
        self.NEWS_CATOGORIES = ['guoji', 'guonei', 'shehui', 'war', 'hangkong']
        self.OTHER_ADDRS = [
            'http://tech.163.com/special/00097UHL/tech_datalist.js?callback=data_callback',
            'http://edu.163.com/special/002987KB/newsdata_edu_hot.js?callback=data_callback',
            'http://mobile.163.com/special/index_datalist/?callback=data_callback',
            'http://money.163.com/special/002557S5/newsdata_idx_index.js?callback=data_callback',
            'http://travel.163.com/special/00067VEJ/newsdatas_travel.js?callback=data_callback',
            'http://ent.163.com/special/000380VU/newsdata_index.js?callback=data_callback',
            'http://money.163.com/special/002557S6/newsdata_gp_index.js?callback=data_callback',
            'http://sports.163.com/special/000587PR/newsdata_n_allsports.js?callback=data_callback'
        ]
        self.types = [
            'global', 'domestic', 'society', 'war', 'aviation', 'technology', 'education',
            'mobile', 'finance', 'travel', 'entertain', 'finance', 'sport'
        ]
    
    def start(self): 
        index = 0
        for addr in [self.NEWS_ADDR % item for item in self.NEWS_CATOGORIES] + self.OTHER_ADDRS:
            text = ''
            try:
                response = requests.get(addr, HEADERS)
                if response.status_code != 200:
                    print('response code = ', response.status_code)
                    exit()
                text = response.text.replace(' ','').replace('\n','').replace('\t','')
                text = (text.replace('])', ']')
                                .replace('data_callback(', '')
                                .replace('[,', '['))  # uncommon errors
                newsArray = json.loads(text)
                collection = getConnection('mongo')[self.types[index]]
                collection.create_index('title', unique=True)
                index += 1
                collection.insert(newsArray)
            except errors.DuplicateKeyError:
                print('DuplicateKeyError ignored')
            except:
                print_exc()
                print(text)
                exit()

def ifeng():
    def __init__(self):
        self.ADDR_LIST = [
            'http://news.ifeng.com/mainland/',
            'http://news.ifeng.com/world/index.shtml',
            'http://news.ifeng.com/mil/index.shtml',
            'http://news.ifeng.com/society/index.shtml',
            
        ]

    def start(self):
        index = 0
        for addr in [self.NEWS_ADDR % item for item in self.NEWS_CATOGORIES] + self.OTHER_ADDRS:
            text = ''
            try:
                response = requests.get(addr, HEADERS)
                if response.status_code != 200:
                    print('response code = ', response.status_code)
                    exit()
                text = response.text.replace(' ','').replace('\n','').replace('\t','')
                text = (text.replace('])', ']')
                                .replace('data_callback(', '')
                                .replace('[,', '['))  # uncommon errors
                newsArray = json.loads(text)
                collection = getConnection('mongo')[self.types[index]]
                collection.create_index('title', unique=True)
                index += 1
                collection.insert(newsArray)
            except errors.DuplicateKeyError:
                print('DuplicateKeyError ignored')
            except:
                print_exc()
                print(text)
                exit()

class showapi():
    def __init__(self):
        self.types = {
        '国内': 'domestic',
        '国际': 'global',
        '军事': 'war',
        '财经': 'finance',
        '体育': 'sport',
        '娱乐': 'entertain',
        '游戏': 'game',
        '教育': 'education',
        '科技': 'technology',
        '社会': 'society',
        '健康': 'health',
        '房产': 'estate',
        '数码': 'mobile'
        }
        self.params = {
            'showapi_appid': '38146',
            'showapi_sign': '10a4e04676d84cf59dbaf582cf41c3d4',
            'needContent': 0,
            'needHtml': 0,
            'needAllList': 1,
            'maxResult': 100
        }
    
    def start(self):
        param = self.params
        try:
            for (name, type) in self.types.items():
                param['channelName'] = name
                resp = requests.get('http://route.showapi.com/109-35', params=param)
                result = json.loads(resp.text)
                if result['showapi_res_error']:
                    raise 'showapi_res_error'               
                    exit()
                result = result['showapi_res_body']['pagebean']['contentlist']
                collection = getConnection('mongo')[type]
                collection.create_index('title', unique=True)
                for item in result:
                    pass        
        except:
            print_exc()
            print(text)
            exit()

class Toutiao():
    def __init__(self):
        self.url = 'http://toutiao.com/api/article/recent/?source=2&category=%s&as=A1D5D87595C3287'
        self.types = {
            'news_hot': 'hot',
            'news_society': 'society',
            'news_entertainment': 'entertain',
            'news_tech': 'technology',
            'news_military': 'war',
            'news_sports': 'sport',
            'news_car': 'car',
            'news_finance': 'finance',
            'news_world': 'global',
            'news_fashion': 'fashion',
            'news_travel': 'travel',
            'news_discovery': 'discovery',
            'news_regimen': 'health',
            'news_game': 'game',
            'news_history': 'history'
        }

    def start(self):
        for (param, type) in self.types.items():
            url = self.url % param
            print('url=', url)
            try:
                resp = requests.get(url)
                result = json.loads(resp.text)['data']
                result = [news for news in result if 'ad' not in news and not news['has_video']]
                imglist = 'imgurls'
                for news in result:
                    news['time'] = news['datetime']
                    news[imglist] = []
                    for key in ['image_url', 'large_image_url', 'middle_image_url']:
                        if key in news and news[key] not in news[imglist]:
                            news[imglist].append(news[key])
                    for key in ['image_list', 'middle_image']:
                        if key in news:
                            if isinstance(news[key], list) or 'url_list' in news[key]:
                                arr = news[key]['url_list'] if 'url_list' in news[key] else news[key]
                                for item in arr:
                                    if item['url'] not in news[imglist]:
                                        news[imglist].append(item['url'])
                            elif news[key] not in news[imglist]:
                                news[imglist].append(news[key])
                    news['keywords'] = news['keywords'].split(',')
                    news['docurl'] = news['url']
                collection = getConnection('mongo')[type]
                collection.create_index('title', unique=True)
                collection.insert(result)
            except errors.DuplicateKeyError:
                print('DuplicateKeyError ignored')
            except:
                print_exc()
                print(resp.text)
                exit()


if __name__ == '__main__':
    task = Toutiao()
    task.start()
	
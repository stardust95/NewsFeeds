#coding=utf-8
import requests, json, sys
from bs4 import BeautifulSoup

'''
Fileds to Save:
    title
    docurl
    imgs: array
    keywords: array
    commentNum
    commenturl
    time
    source

'''

ADDRS_LIST = {
    'http://society.qq.com/': 'society',
    'http://ent.qq.com/': 'entertainment',
    'http://sports.qq.com/': 'sport',
    'http://finance.qq.com/': 'finance',
    'http://mil.qq.com/mil_index.htm': 'military',
    'http://news.qq.com/world_index.shtml': 'world',
    'http://cul.qq.com/': 'culture'
}

HEADERS = {
    'Accept':'text/html',
    # 'Connection':'keep-alive',
    'User-Agent': '''Mozilla/5.0 (Windows NT 10.0; Win64; x64)
    AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36'''
}

for (addr, catogory) in ADDRS_LIST.items():
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
                print("---------------------ERROR-----------------")
                print(item.prettify())
                exit()
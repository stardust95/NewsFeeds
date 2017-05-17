import requests, json, sys


NEWS_ADDR = 'http://temp.163.com/special/00804KVA/cm_%s.js?callback=data_callback'
NEWS_CATOGORIES = ['guoji', 'guonei', 'shehui', 'war', 'hangkong']
OTHER_ADDRS = [
    'http://tech.163.com/special/00097UHL/tech_datalist.js?callback=data_callback',
    'http://edu.163.com/special/002987KB/newsdata_edu_hot.js?callback=data_callback',
    'http://mobile.163.com/special/index_datalist/?callback=data_callback',
    'http://money.163.com/special/002557S5/newsdata_idx_index.js?callback=data_callback',
    'http://travel.163.com/special/00067VEJ/newsdatas_travel.js?callback=data_callback',
    'http://ent.163.com/special/000380VU/newsdata_index.js?callback=data_callback',
    'http://money.163.com/special/002557S6/newsdata_gp_index.js?callback=data_callback',
    'http://sports.163.com/special/000587PR/newsdata_n_allsports.js?callback=data_callback'
]

HEADERS = {
    'Accept':'text/html',
    # 'Connection':'keep-alive',
    'User-Agent': '''Mozilla/5.0 (Windows NT 10.0; Win64; x64)
    AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36'''
}

for addr in [NEWS_ADDR % item for item in NEWS_CATOGORIES] + OTHER_ADDRS:
    response = requests.get(addr, HEADERS)
    if response.status_code != 200:
        print('response code = ', response.status_code)
        exit()
    text = response.text.replace('])', ']').replace('data_callback(', '')
    newsArray = json.loads(text)

__author__ = 'huang'

import os
import logging
import sys
import re

if __name__=='__main__':

    program = os.path.basename(sys.argv[0])
    logger = logging.getLogger(program)

    logging.basicConfig(format='%(asctime)s: %(levelname)s: %(message)s')
    logging.root.setLevel(level=logging.INFO)

    if len(sys.argv) < 3:
        print(globals()['__doc__'] %locals())
        sys.exit(1)

    inp, outp = sys.argv[1:3]

    output = open(outp, 'w')
    inp = open(inp, 'r')

    for line in inp:

        ss = re.findall('[\n\s*\r\u4e00-\u9fa5]', line)
        output.write("".join(ss))

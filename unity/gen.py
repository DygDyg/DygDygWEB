import array
import json
import os
import time

#int_array = array.array('i', [1, 2, 3, 4])

#for a in int_array: print(a)

def scan(pyt):
    #directory = os.getcwd()
    listdir = os.listdir(pyt)
    files = []
    dirs = []
    #data = []
    #files = os.walk()
    #images = filter(lambda x: x.endswith('.jpg'), files)
    #print(files)
    #files.pop(0)

    for key in listdir:
        #print(os.path.isfile(key))
        if os.path.isfile(key):
            if key != ".gitattributes":
                files.append(key)

        else:
            if key != ".git":
                dirs.append(key)
                print(key)
                #input("Press Enter to continue...")
                #scan(key)
    #print(y)
    data = {"dir": dirs, "file": files}
    #data["file": files]

    f = open('dir.json', 'w')
    f.write(json.dumps(data))

    print(os.getcwd())
    print(files)
    print(dirs)

scan(os.getcwd())
time.sleep(2)
#input("Press Enter to continue...")